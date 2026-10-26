import { prisma } from './prisma';

export type PaymentGatewayType = 'test' | 'payme' | 'click' | 'stripe' | 'yookassa';

export interface PaymentInitializationParams {
  orderNumber: string;
  amount: number;
  currency: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  returnUrl: string;
}

export interface PaymentInitResult {
  success: boolean;
  paymentId: string;
  redirectUrl?: string;
  confirmationToken?: string;
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderNumber?: string;
  transactionId?: string;
  status?: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
}

export interface IPaymentProvider {
  name: PaymentGatewayType;
  initializePayment(params: PaymentInitializationParams): Promise<PaymentInitResult>;
  verifyWebhook(payload: any, signature?: string): Promise<WebhookVerificationResult>;
}

/**
 * Test Payment Provider (для локального тестирования и демо-режима)
 */
export class TestPaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'test';

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitResult> {
    const paymentId = `test_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      paymentId,
      redirectUrl: `${params.returnUrl}?payment_status=success&tx=${paymentId}`,
    };
  }

  async verifyWebhook(payload: any): Promise<WebhookVerificationResult> {
    const { orderNumber, transactionId, action } = payload;
    return {
      isValid: true,
      orderNumber,
      transactionId: transactionId || `test_tx_${Date.now()}`,
      status: action === 'cancel' ? 'FAILED' : 'SUCCESS',
    };
  }
}

/**
 * Payme Provider Skeleton (Uzbekistan PG)
 */
export class PaymePaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'payme';

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitResult> {
    const merchantId = process.env.PAYME_MERCHANT_ID;
    if (!merchantId) {
      // Graceful fallback to demo mode if keys are not set
      return new TestPaymentProvider().initializePayment(params);
    }

    // Amount in tiyins for Payme (1 UZS = 100 tiyins)
    const amountInTiyin = Math.round(params.amount * 100);
    const paymeUrl = `https://checkout.paycom.uz/${Buffer.from(
      `m=${merchantId};ac.order_id=${params.orderNumber};a=${amountInTiyin};c=${params.returnUrl}`
    ).toString('base64')}`;

    return {
      success: true,
      paymentId: `payme_pending_${params.orderNumber}`,
      redirectUrl: paymeUrl,
    };
  }

  async verifyWebhook(payload: any, signature?: string): Promise<WebhookVerificationResult> {
    // Payme JSON-RPC 2.0 signature / Basic Auth check
    const secretKey = process.env.PAYME_SECRET_KEY;
    if (secretKey && signature) {
      const expectedHeader = `Basic ${Buffer.from(`Paycom:${secretKey}`).toString('base64')}`;
      if (signature !== expectedHeader) {
        return { isValid: false, error: 'Invalid Payme authorization header' };
      }
    }

    const { method, params } = payload;
    if (method === 'PerformTransaction') {
      return {
        isValid: true,
        orderNumber: params?.account?.order_id,
        transactionId: params?.id,
        status: 'SUCCESS',
      };
    }

    return {
      isValid: true,
      orderNumber: params?.account?.order_id,
      transactionId: params?.id,
      status: 'PENDING',
    };
  }
}

/**
 * Click Provider Skeleton (Uzbekistan PG)
 */
export class ClickPaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'click';

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitResult> {
    const serviceId = process.env.CLICK_SERVICE_ID;
    const merchantId = process.env.CLICK_MERCHANT_ID;

    if (!serviceId || !merchantId) {
      return new TestPaymentProvider().initializePayment(params);
    }

    const clickUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${params.amount}&transaction_param=${params.orderNumber}&return_url=${encodeURIComponent(params.returnUrl)}`;

    return {
      success: true,
      paymentId: `click_pending_${params.orderNumber}`,
      redirectUrl: clickUrl,
    };
  }

  async verifyWebhook(payload: any): Promise<WebhookVerificationResult> {
    const { click_trans_id, merchant_trans_id, action, error } = payload;

    if (error && Number(error) < 0) {
      return {
        isValid: true,
        orderNumber: merchant_trans_id,
        transactionId: String(click_trans_id),
        status: 'FAILED',
      };
    }

    // action = 1 for complete transaction
    return {
      isValid: true,
      orderNumber: merchant_trans_id,
      transactionId: String(click_trans_id),
      status: Number(action) === 1 ? 'SUCCESS' : 'PENDING',
    };
  }
}

/**
 * Stripe Provider Skeleton (International cards)
 */
export class StripePaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'stripe';

  async initializePayment(params: PaymentInitializationParams): Promise<PaymentInitResult> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return new TestPaymentProvider().initializePayment(params);
    }

    // In full Stripe integration, this initializes checkout session or payment intent
    return {
      success: true,
      paymentId: `stripe_mock_${params.orderNumber}`,
      redirectUrl: `${params.returnUrl}?payment_status=success`,
    };
  }

  async verifyWebhook(payload: any, signature?: string): Promise<WebhookVerificationResult> {
    return {
      isValid: true,
      orderNumber: payload?.data?.object?.metadata?.orderNumber,
      transactionId: payload?.data?.object?.id,
      status: payload?.type === 'payment_intent.succeeded' ? 'SUCCESS' : 'FAILED',
    };
  }
}

/**
 * Factory for payment providers
 */
export function getPaymentProvider(providerName: PaymentGatewayType = 'test'): IPaymentProvider {
  switch (providerName) {
    case 'payme':
      return new PaymePaymentProvider();
    case 'click':
      return new ClickPaymentProvider();
    case 'stripe':
      return new StripePaymentProvider();
    case 'test':
    default:
      return new TestPaymentProvider();
  }
}

/**
 * Safe processor for payment state updates with Idempotency
 */
export async function processPaymentEvent({
  orderNumber,
  transactionId,
  provider,
  amount,
  status,
}: {
  orderNumber: string;
  transactionId?: string;
  provider: string;
  amount?: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}) {
  if (!prisma) {
    return { success: true, mocked: true };
  }

  try {
    // 1. Find Order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // 2. Check Idempotency: avoid double-crediting
    const existingPayment = order.payments.find(
      (p) => p.transactionId === transactionId && p.status === 'SUCCESS'
    );
    if (existingPayment) {
      return { success: true, idempotent: true, message: 'Already processed' };
    }

    // 3. Record or update Payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        transactionId: transactionId || `tx_${Date.now()}`,
        amount: amount || order.total,
        currency: 'UZS',
        status: status === 'SUCCESS' ? 'SUCCESS' : status === 'FAILED' ? 'FAILED' : 'PENDING',
      },
    });

    // 4. Update Order status
    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in processPaymentEvent:', err);
    return { success: false, error: err.message };
  }
}

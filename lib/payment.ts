
import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from './prisma';

export type PaymentGatewayType =
  | 'test'
  | 'payme'
  | 'click'
  | 'stripe'
  | 'yookassa';

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
  amount?: number;
  currency?: string;
}

export interface IPaymentProvider {
  name: PaymentGatewayType;

  initializePayment(
    params: PaymentInitializationParams
  ): Promise<PaymentInitResult>;

  verifyWebhook(
    payload: any,
    signature?: string
  ): Promise<WebhookVerificationResult>;
}

export class TestPaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'test';

  async initializePayment(
    params: PaymentInitializationParams
  ): Promise<PaymentInitResult> {
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

export class PaymePaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'payme';

  async initializePayment(
    params: PaymentInitializationParams
  ): Promise<PaymentInitResult> {
    const merchantId = process.env.PAYME_MERCHANT_ID;

    if (!merchantId) {
      return new TestPaymentProvider().initializePayment(params);
    }

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

  async verifyWebhook(
    payload: any,
    signature?: string
  ): Promise<WebhookVerificationResult> {
    const secretKey = process.env.PAYME_SECRET_KEY;

    if (secretKey && signature) {
      const expectedHeader = `Basic ${Buffer.from(
        `Paycom:${secretKey}`
      ).toString('base64')}`;

      if (signature !== expectedHeader) {
        return {
          isValid: false,
          error: 'Invalid Payme authorization header',
        };
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

export class ClickPaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'click';

  async initializePayment(
    params: PaymentInitializationParams
  ): Promise<PaymentInitResult> {
    const serviceId = process.env.CLICK_SERVICE_ID;
    const merchantId = process.env.CLICK_MERCHANT_ID;

    if (!serviceId || !merchantId) {
      return new TestPaymentProvider().initializePayment(params);
    }

    const clickUrl =
      `https://my.click.uz/services/pay?service_id=${serviceId}` +
      `&merchant_id=${merchantId}` +
      `&amount=${params.amount}` +
      `&transaction_param=${params.orderNumber}` +
      `&return_url=${encodeURIComponent(params.returnUrl)}`;

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

    return {
      isValid: true,
      orderNumber: merchant_trans_id,
      transactionId: String(click_trans_id),
      status: Number(action) === 1 ? 'SUCCESS' : 'PENDING',
    };
  }
}

export class StripePaymentProvider implements IPaymentProvider {
  name: PaymentGatewayType = 'stripe';

  async initializePayment(
    params: PaymentInitializationParams
  ): Promise<PaymentInitResult> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !stripeKey.startsWith('sk_test_')) {
      return {
        success: false,
        paymentId: '',
        error: 'A Stripe test secret key is required',
      };
    }

    if (!prisma) {
      return {
        success: false,
        paymentId: '',
        error: 'Database connection is required for Stripe',
      };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: params.orderNumber },
    });

    if (!order) {
      return {
        success: false,
        paymentId: '',
        error: 'Order not found',
      };
    }

    if (order.paymentMethod !== 'stripe' || order.status !== 'PENDING') {
      return {
        success: false,
        paymentId: '',
        error: 'Order is not eligible for Stripe payment',
      };
    }

    if (!Number.isSafeInteger(order.total) || order.total <= 0) {
      return {
        success: false,
        paymentId: '',
        error: 'Invalid order amount',
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl || !siteUrl.startsWith('https://')) {
      return {
        success: false,
        paymentId: '',
        error: 'NEXT_PUBLIC_SITE_URL must be configured',
      };
    }

    const locale = 'ru';
    const baseUrl = siteUrl.replace(/\/$/, '');

    const form = new URLSearchParams();

    form.set('mode', 'payment');
    form.set('success_url', `${baseUrl}/${locale}/order/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`);
    form.set('cancel_url', `${baseUrl}/${locale}/checkout`);

    form.set('line_items[0][price_data][currency]', 'uzs');
    form.set(
      'line_items[0][price_data][unit_amount]',
      String(order.total * 100)
    );
    form.set(
      'line_items[0][price_data][product_data][name]',
      `VoltStore order ${order.orderNumber}`
    );
    form.set('line_items[0][quantity]', '1');

    form.set('metadata[orderNumber]', order.orderNumber);
    form.set('client_reference_id', order.orderNumber);

    if (order.customerEmail) {
      form.set('customer_email', order.customerEmail);
    }

    const response = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': `voltstore-checkout-${order.id}`,
        },
        body: form.toString(),
        cache: 'no-store',
      }
    );

    const session = await response.json();

    if (!response.ok || !session.id || !session.url) {
      console.error('Stripe Checkout error:', session.error?.message);

      return {
        success: false,
        paymentId: '',
        error: session.error?.message || 'Stripe Checkout failed',
      };
    }

    return {
      success: true,
      paymentId: session.id,
      redirectUrl: session.url,
    };
  }

  async verifyWebhook(
    payload: any,
    signature?: string
  ): Promise<WebhookVerificationResult> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || !signature || typeof payload !== 'string') {
      return {
        isValid: false,
        error: 'Missing webhook secret, signature, or raw body',
      };
    }

    const parts = signature.split(',');
    const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
    const signatures = parts
      .filter((p) => p.startsWith('v1='))
      .map((p) => p.slice(3));

    if (!timestamp || signatures.length === 0) {
      return { isValid: false, error: 'Invalid Stripe signature header' };
    }

    const timestampNumber = Number(timestamp);

    if (
      !Number.isFinite(timestampNumber) ||
      Math.abs(Date.now() / 1000 - timestampNumber) > 300
    ) {
      return { isValid: false, error: 'Stripe signature expired' };
    }

    const expected = createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest();

    const signatureValid = signatures.some((value) => {
      if (!/^[0-9a-f]{64}$/i.test(value)) return false;

      const received = Buffer.from(value, 'hex');

      return (
        received.length === expected.length &&
        timingSafeEqual(received, expected)
      );
    });

    if (!signatureValid) {
      return { isValid: false, error: 'Invalid Stripe signature' };
    }

    let event: any;

    try {
      event = JSON.parse(payload);
    } catch {
      return { isValid: false, error: 'Invalid webhook JSON' };
    }

    if (event.type !== 'checkout.session.completed') {
      return { isValid: true, status: 'PENDING' };
    }

    const session = event.data?.object;

    if (
      session?.mode !== 'payment' ||
      session?.payment_status !== 'paid'
    ) {
      return { isValid: true, status: 'PENDING' };
    }

    return {
      isValid: true,
      orderNumber: session.metadata?.orderNumber,
      transactionId: session.id,
      status: 'SUCCESS',
      amount: session.amount_total,
      currency: session.currency,
    };
  }
}

export function getPaymentProvider(
  providerName: PaymentGatewayType = 'test'
): IPaymentProvider {
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
    return { success: false, error: 'Database unavailable' };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentMethod !== provider) {
      return { success: false, error: 'Payment provider mismatch' };
    }

    if (provider === 'stripe') {
      if (
        status !== 'SUCCESS' ||
        !transactionId ||
        amount !== order.total * 100
      ) {
        return { success: false, error: 'Stripe payment amount mismatch' };
      }
    }

    const existingPayment = order.payments.find(
      (p) => p.transactionId === transactionId
    );

    if (existingPayment) {
      return { success: true, idempotent: true };
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        transactionId: transactionId || `tx_${Date.now()}`,
        amount: order.total,
        currency: 'UZS',
        status:
          status === 'SUCCESS'
            ? 'SUCCESS'
            : status === 'FAILED'
              ? 'FAILED'
              : 'PENDING',
      },
    });

    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error in processPaymentEvent:', err);
    return {
      success: false,
      error: err.message || 'Payment processing failed',
    };
  }
}

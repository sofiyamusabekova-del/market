import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider, processPaymentEvent, PaymentGatewayType } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerName = (searchParams.get('provider') || 'test') as PaymentGatewayType;
    const signature = request.headers.get('authorization') || request.headers.get('stripe-signature') || undefined;

    let payload: any;
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const provider = getPaymentProvider(providerName);
    const verification = await provider.verifyWebhook(payload, signature);

    if (!verification.isValid) {
      return NextResponse.json({ success: false, error: verification.error || 'Invalid signature' }, { status: 400 });
    }

    if (!verification.orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number missing in webhook payload' }, { status: 400 });
    }

    const result = await processPaymentEvent({
      orderNumber: verification.orderNumber,
      transactionId: verification.transactionId,
      provider: providerName,
      status: verification.status || 'SUCCESS',
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 422 });
    }

    // Payme and standard protocols return specific ack format
    if (providerName === 'payme') {
      return NextResponse.json({
        result: {
          state: 2,
          perform_time: Date.now(),
          transaction: verification.transactionId,
        },
      });
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal webhook error' }, { status: 500 });
  }
}

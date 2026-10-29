
import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentProvider,
  processPaymentEvent,
} from '@/lib/payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerName = searchParams.get('provider');

    // Only Stripe is enabled on this public webhook.
    // Other providers need their own authenticated handlers.
    if (providerName !== 'stripe') {
      return NextResponse.json(
        { success: false, error: 'Unsupported payment provider' },
        { status: 403 }
      );
    }

    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Stripe signatures must be checked against the exact raw body.
    const rawBody = await request.text();

    const provider = getPaymentProvider('stripe');
    const verification = await provider.verifyWebhook(
      rawBody,
      signature
    );

    if (!verification.isValid) {
      console.error('Stripe webhook verification failed');

      return NextResponse.json(
        {
          success: false,
          error: verification.error || 'Invalid Stripe signature',
        },
        { status: 400 }
      );
    }

    // Ignore other valid Stripe events.
    // Only paid Checkout Sessions update orders.
    if (!verification.orderNumber) {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    if (
      verification.status !== 'SUCCESS' ||
      !verification.transactionId ||
      verification.amount === undefined ||
      verification.currency?.toLowerCase() !== 'uzs'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Stripe payment details',
        },
        { status: 400 }
      );
    }

    const result = await processPaymentEvent({
      orderNumber: verification.orderNumber,
      transactionId: verification.transactionId,
      provider: 'stripe',
      amount: verification.amount,
      status: 'SUCCESS',
    });

    if (!result.success) {
      console.error('Stripe payment processing failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to process Stripe payment',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: true,
    });
  } catch (error) {
    console.error('Stripe webhook error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal webhook error',
      },
      { status: 500 }
    );
  }
}

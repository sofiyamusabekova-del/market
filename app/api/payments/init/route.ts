
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumber = body?.orderNumber;

    if (
      typeof orderNumber !== 'string' ||
      !/^VLT-\d{8}-\d{4}$/.test(orderNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order number',
        },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is unavailable',
        },
        { status: 503 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== 'stripe') {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not selected for this order',
        },
        { status: 400 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Order is not awaiting payment',
        },
        { status: 409 }
      );
    }

    if (
      !Number.isSafeInteger(order.total) ||
      order.total <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order total',
        },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider('stripe');

    const result = await provider.initializePayment({
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: 'UZS',
      customer: {
        fullName: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail || undefined,
      },
      returnUrl: '',
    });

    if (!result.success || !result.redirectUrl) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Unable to initialize Stripe Checkout',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to initialize payment',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    // Protection against guessing/enumeration: regex format check VLT-YYYYMMDD-XXXX
    const orderNumberRegex = /^VLT-\d{8}-\d{4}$/;
    if (!orderNumberRegex.test(orderNumber)) {
      return NextResponse.json({ success: false, error: 'Invalid order number format' }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ success: true, message: 'Client state handles fallback order numbers' });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Return sanitized data without leaking internal sensitive IDs
    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        customerName: order.customerName,
        deliveryMethod: order.deliveryMethod,
        paymentMethod: order.paymentMethod,
        total: order.total,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        items: order.items,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error finding order' },
      { status: 500 }
    );
  }
}

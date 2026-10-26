import { NextRequest, NextResponse } from 'next/server';
import { createServerOrder } from '@/lib/order-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createServerOrder(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error creating order' },
      { status: 500 }
    );
  }
}

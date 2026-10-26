import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider, PaymentGatewayType } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, amount, currency = 'UZS', provider: providerName = 'test', customer, returnUrl } = body;

    if (!orderNumber || !amount) {
      return NextResponse.json({ success: false, error: 'orderNumber and amount are required' }, { status: 400 });
    }

    const provider = getPaymentProvider(providerName as PaymentGatewayType);
    const result = await provider.initializePayment({
      orderNumber,
      amount,
      currency,
      customer: customer || { fullName: 'Customer', phone: '' },
      returnUrl: returnUrl || `http://localhost:3000/order/${orderNumber}`,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

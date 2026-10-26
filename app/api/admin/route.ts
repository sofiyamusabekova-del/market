import { NextRequest, NextResponse } from 'next/server';
import { getAdminData, updateOrderStatus, saveProduct, deleteProduct } from '@/lib/admin-api';

function checkAdminAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const adminCookie = req.cookies.get('volt_admin_token')?.value;

  // Simple token verification (passphrase: "voltadmin2026")
  return (
    authHeader === 'Bearer voltadmin2026' ||
    adminCookie === 'voltadmin2026' ||
    req.headers.get('x-admin-key') === 'voltadmin2026'
  );
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 401 });
  }

  const data = await getAdminData();
  return NextResponse.json({ success: true, ...data });
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === 'UPDATE_ORDER_STATUS') {
    const { orderId, status } = body;
    const res = await updateOrderStatus(orderId, status);
    return NextResponse.json(res);
  }

  if (action === 'SAVE_PRODUCT') {
    const { product } = body;
    const res = await saveProduct(product);
    return NextResponse.json(res);
  }

  if (action === 'DELETE_PRODUCT') {
    const { slug } = body;
    const res = await deleteProduct(slug);
    return NextResponse.json(res);
  }

  return NextResponse.json({ success: false, error: 'Invalid admin action' }, { status: 400 });
}

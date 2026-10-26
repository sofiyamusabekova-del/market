import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/server-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const [products, categories] = await Promise.all([
      getProducts({ categorySlug, search, sortBy, limit }),
      getCategories(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      categories,
      count: products.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}

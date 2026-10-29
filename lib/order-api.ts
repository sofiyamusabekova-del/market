
import { prisma } from './prisma';
import { CustomerInfo, Order, OrderItem } from './store';

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface ServerOrderInput {
  items: OrderItemInput[];
  customer: CustomerInfo;
}

export async function createServerOrder(input: ServerOrderInput): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  const { items, customer } = input;

  if (!items || items.length === 0) {
    return { success: false, error: 'Order must contain at least 1 item' };
  }

  // Generate safe order identifier
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderNumber = `VLT-${dateStr}-${randomSuffix}`;

  if (!prisma) {
    // Graceful calculation using mock catalogs
    const { mockProducts } = await import('@/mocks/products');
    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const prod = mockProducts.find((p) => p.id === item.productId);
      if (!prod) continue;
      const verifiedPrice = prod.price;
      subtotal += verifiedPrice * item.quantity;
      orderItems.push({
        id: prod.id,
        slug: prod.slug,
        title: prod.title,
        price: verifiedPrice,
        quantity: item.quantity,
        image: prod.images[0] || '',
      });
    }

    const deliveryFee =
      customer.deliveryMethod === 'express' ? 50000 : customer.deliveryMethod === 'courier' ? 25000 : 0;
    const total = subtotal + deliveryFee;

    const mockCreatedOrder: Order = {
      orderNumber,
      createdAt: new Date().toISOString(),
      items: orderItems,
      customer,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      status: 'pending',
    };

    return { success: true, order: mockCreatedOrder };
  }

  try {
    // 1. Fetch real products from Neon Postgres to enforce Server as Single Source of Truth
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    let subtotal = 0;
    const verifiedOrderItems: any[] = [];
    const clientOrderItems: OrderItem[] = [];

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (!dbProd) {
        throw new Error(`Product ${item.productId} is no longer available`);
      }

      // Check stock
      if (dbProd.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for ${dbProd.titleRu}`);
      }

      const verifiedPrice = dbProd.price;
      subtotal += verifiedPrice * item.quantity;

      verifiedOrderItems.push({
        productId: dbProd.id,
        titleRu: dbProd.titleRu,
        titleEn: dbProd.titleEn,
        price: verifiedPrice,
        quantity: item.quantity,
        image: dbProd.images[0]?.url || '',
      });

      clientOrderItems.push({
        id: dbProd.id,
        slug: dbProd.slug,
        title: { ru: dbProd.titleRu, en: dbProd.titleEn },
        price: verifiedPrice,
        quantity: item.quantity,
        image: dbProd.images[0]?.url || '',
      });
    }

    const deliveryFee =
      customer.deliveryMethod === 'express' ? 50000 : customer.deliveryMethod === 'courier' ? 25000 : 0;
    const total = subtotal + deliveryFee;

    // 2. Persist order snapshot in Neon database
    const created = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        customerEmail: customer.email || undefined,
        city: customer.city,
        address: customer.address,
        deliveryMethod: customer.deliveryMethod,
        paymentMethod: customer.paymentMethod,
        subtotal,
        discount: 0,
        deliveryFee,
        total,
        status: 'PENDING',
        notes: customer.notes || undefined,
        items: {
          create: verifiedOrderItems,
        },
      },
    });

    // 3. Update stock quantities
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockCount: { decrement: item.quantity } },
      });
    }

    const orderResult: Order = {
      orderNumber: created.orderNumber,
      createdAt: created.createdAt.toISOString(),
      items: clientOrderItems,
      customer,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      status: created.status === 'PAID' ? 'paid' : 'pending',
    };

    return { success: true, order: orderResult };
  } catch (error: any) {
    console.error('Order creation error:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}

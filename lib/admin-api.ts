import { prisma } from './prisma';
import { mockProducts, mockCategories } from '@/mocks/products';
import { Product, Category } from '@/types';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  city: string;
  address: string;
  deliveryMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  items: {
    id: string;
    titleRu: string;
    titleEn: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
  author: string;
}

// Memory cache for mock/local admin operations
let inMemoryProducts = [...mockProducts];
let inMemoryCategories = [...mockCategories];
let inMemoryOrders: AdminOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'VLT-20261023-4819',
    customerName: 'Алишер Навои',
    customerPhone: '+998 90 987 65 43',
    customerEmail: 'alisher@example.com',
    city: 'Ташкент',
    address: 'ул. Амира Темура, 12, кв. 14',
    deliveryMethod: 'express',
    paymentMethod: 'test_card',
    subtotal: 17890000,
    discount: 0,
    deliveryFee: 50000,
    total: 17940000,
    status: 'PAID',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      {
        id: 'item-1',
        titleRu: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
        titleEn: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
        price: 17890000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'VLT-20261023-9214',
    customerName: 'Мадина Каримова',
    customerPhone: '+998 93 555 12 34',
    city: 'Самарканд',
    address: 'Регистанская ул. 45',
    deliveryMethod: 'courier',
    paymentMethod: 'cash',
    subtotal: 3190000,
    discount: 0,
    deliveryFee: 25000,
    total: 32150000,
    status: 'PROCESSING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        id: 'item-2',
        titleRu: 'Apple AirPods Pro 2 (USB-C)',
        titleEn: 'Apple AirPods Pro 2 (USB-C)',
        price: 3190000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

let inMemoryAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'STATUS_UPDATE',
    entity: 'Order #VLT-20261023-4819',
    details: 'Status changed to PAID via Test Card Gateway',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    author: 'System',
  },
  {
    id: 'log-2',
    action: 'PRODUCT_UPDATE',
    entity: 'Product: iPhone 16 Pro Max',
    details: 'Stock verified (14 units available)',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    author: 'Chief Administrator',
  },
];

export async function getAdminData() {
  if (prisma) {
    try {
      const [dbProducts, dbCategories, dbOrders] = await Promise.all([
        prisma.product.findMany({
          include: { category: true, images: true, attributes: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.category.findMany({ orderBy: { nameRu: 'asc' } }),
        prisma.order.findMany({
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const formattedOrders: AdminOrder[] = dbOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        city: o.city,
        address: o.address,
        deliveryMethod: o.deliveryMethod,
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        discount: o.discount,
        deliveryFee: o.deliveryFee,
        total: o.total,
        status: o.status as any,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          id: i.id,
          titleRu: i.titleRu,
          titleEn: i.titleEn,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      }));

      const totalRevenue = formattedOrders.reduce((sum, o) => (o.status !== 'CANCELLED' ? sum + o.total : sum), 0);
      const lowStockCount = dbProducts.filter((p) => p.stockCount <= 5).length;

      return {
        products: dbProducts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: { ru: p.titleRu, en: p.titleEn },
          price: p.price,
          oldPrice: p.oldPrice ?? undefined,
          stockCount: p.stockCount,
          inStock: p.inStock,
          categorySlug: p.category.slug,
          images: p.images.map((img) => img.url),
          rating: p.rating,
          reviewCount: p.reviewCount,
          attributes: p.attributes.map((a) => ({
            name: { ru: a.nameRu, en: a.nameEn },
            value: { ru: a.valueRu, en: a.valueEn },
          })),
          description: { ru: p.descriptionRu, en: p.descriptionEn },
        })),
        categories: dbCategories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: { ru: c.nameRu, en: c.nameEn },
          iconName: c.iconName,
          itemCount: c.itemCount,
        })),
        orders: formattedOrders,
        auditLogs: inMemoryAuditLogs,
        stats: {
          totalRevenue,
          totalOrders: formattedOrders.length,
          totalProducts: dbProducts.length,
          lowStockCount,
        },
      };
    } catch (e) {
      console.warn('Prisma query failed, using in-memory store:', e);
    }
  }

  // Fallback in-memory
  const totalRevenue = inMemoryOrders.reduce((sum, o) => (o.status !== 'CANCELLED' ? sum + o.total : sum), 0);
  const lowStockCount = inMemoryProducts.filter((p) => p.stockCount <= 5).length;

  return {
    products: inMemoryProducts,
    categories: inMemoryCategories,
    orders: inMemoryOrders,
    auditLogs: inMemoryAuditLogs,
    stats: {
      totalRevenue,
      totalOrders: inMemoryOrders.length,
      totalProducts: inMemoryProducts.length,
      lowStockCount,
    },
  };
}

export async function updateOrderStatus(orderIdOrNumber: string, status: AdminOrder['status'], author = 'Admin') {
  if (prisma) {
    try {
      const updated = await prisma.order.update({
        where: orderIdOrNumber.startsWith('VLT-') ? { orderNumber: orderIdOrNumber } : { id: orderIdOrNumber },
        data: { status: status as any },
      });

      inMemoryAuditLogs.unshift({
        id: `log-${Date.now()}`,
        action: 'ORDER_STATUS_CHANGE',
        entity: `Order #${updated.orderNumber}`,
        details: `Status set to ${status}`,
        timestamp: new Date().toISOString(),
        author,
      });

      return { success: true };
    } catch {}
  }

  const order = inMemoryOrders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
  if (order) {
    order.status = status;
    inMemoryAuditLogs.unshift({
      id: `log-${Date.now()}`,
      action: 'ORDER_STATUS_CHANGE',
      entity: `Order #${order.orderNumber}`,
      details: `Status set to ${status}`,
      timestamp: new Date().toISOString(),
      author,
    });
    return { success: true };
  }
  return { success: false, error: 'Order not found' };
}

export async function saveProduct(productData: Partial<Product>) {
  if (prisma) {
    try {
      const category = await prisma.category.findFirst({
        where: { slug: productData.categorySlug || 'smartphones' },
      });

      if (category && productData.slug) {
        await prisma.product.upsert({
          where: { slug: productData.slug },
          update: {
            titleRu: productData.title?.ru || 'Товар',
            titleEn: productData.title?.en || 'Product',
            price: productData.price || 0,
            oldPrice: productData.oldPrice,
            stockCount: productData.stockCount ?? 10,
            inStock: (productData.stockCount ?? 10) > 0,
          },
          create: {
            slug: productData.slug,
            titleRu: productData.title?.ru || 'Товар',
            titleEn: productData.title?.en || 'Product',
            price: productData.price || 0,
            oldPrice: productData.oldPrice,
            stockCount: productData.stockCount ?? 10,
            inStock: (productData.stockCount ?? 10) > 0,
            categoryId: category.id,
            descriptionRu: productData.description?.ru || '',
            descriptionEn: productData.description?.en || '',
          },
        });
      }
    } catch {}
  }

  const existingIdx = inMemoryProducts.findIndex((p) => p.slug === productData.slug);
  if (existingIdx >= 0) {
    inMemoryProducts[existingIdx] = { ...inMemoryProducts[existingIdx], ...productData } as Product;
  } else if (productData.slug && productData.title) {
    inMemoryProducts.unshift(productData as Product);
  }

  inMemoryAuditLogs.unshift({
    id: `log-${Date.now()}`,
    action: existingIdx >= 0 ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED',
    entity: `Product: ${productData.title?.ru || productData.slug}`,
    details: `Price: ${productData.price} UZS, Stock: ${productData.stockCount}`,
    timestamp: new Date().toISOString(),
    author: 'Admin',
  });

  return { success: true };
}

export async function deleteProduct(slug: string) {
  if (prisma) {
    try {
      await prisma.product.delete({ where: { slug } });
    } catch {}
  }
  inMemoryProducts = inMemoryProducts.filter((p) => p.slug !== slug);

  inMemoryAuditLogs.unshift({
    id: `log-${Date.now()}`,
    action: 'PRODUCT_DELETED',
    entity: `Product: ${slug}`,
    details: 'Removed from store catalog',
    timestamp: new Date().toISOString(),
    author: 'Admin',
  });

  return { success: true };
}

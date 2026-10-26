import { prisma } from './prisma';
import { mockCategories, mockProducts } from '@/mocks/products';
import { Product, Category } from '@/types';

export async function getCategories(): Promise<Category[]> {
  if (!prisma) {
    return mockCategories;
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { nameRu: 'asc' },
    });

    if (!categories || categories.length === 0) {
      return mockCategories;
    }

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: { ru: c.nameRu, en: c.nameEn },
      iconName: c.iconName,
      itemCount: c.itemCount,
    }));
  } catch (error) {
    console.warn('Database unavailable, falling back to mock categories:', error);
    return mockCategories;
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  search?: string;
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new';
  limit?: number;
}): Promise<Product[]> {
  if (!prisma) {
    let result = [...mockProducts];

    if (options?.categorySlug) {
      result = result.filter((p) => p.categorySlug === options.categorySlug);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.ru.toLowerCase().includes(q) ||
          p.title.en.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q)
      );
    }
    if (options?.sortBy) {
      if (options.sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
      else if (options.sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
      else if (options.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
      else if (options.sortBy === 'new') result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }
    return result;
  }

  try {
    const where: any = {};
    if (options?.categorySlug) {
      where.category = { slug: options.categorySlug };
    }
    if (options?.search) {
      where.OR = [
        { titleRu: { contains: options.search, mode: 'insensitive' } },
        { titleEn: { contains: options.search, mode: 'insensitive' } },
        { descriptionRu: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (options?.sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (options?.sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (options?.sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (options?.sortBy === 'popular') orderBy = { reviewCount: 'desc' };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: options?.limit,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        attributes: true,
      },
    });

    if (!products || products.length === 0) {
      return mockProducts;
    }

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: { ru: p.titleRu, en: p.titleEn },
      subtitle: p.subtitleRu ? { ru: p.subtitleRu, en: p.subtitleEn || '' } : undefined,
      price: p.price,
      oldPrice: p.oldPrice ?? undefined,
      discountPercent: p.discountPercent ?? undefined,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categorySlug: p.category.slug,
      images: p.images.map((img) => img.url),
      inStock: p.inStock,
      stockCount: p.stockCount,
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      attributes: p.attributes.map((a) => ({
        name: { ru: a.nameRu, en: a.nameEn },
        value: { ru: a.valueRu, en: a.valueEn },
      })),
      description: { ru: p.descriptionRu, en: p.descriptionEn },
    }));
  } catch (error) {
    console.warn('Database error, falling back to mock products:', error);
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!prisma) {
    return mockProducts.find((p) => p.slug === slug) || null;
  }

  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        attributes: true,
      },
    });

    if (!p) {
      return mockProducts.find((prod) => prod.slug === slug) || null;
    }

    return {
      id: p.id,
      slug: p.slug,
      title: { ru: p.titleRu, en: p.titleEn },
      subtitle: p.subtitleRu ? { ru: p.subtitleRu, en: p.subtitleEn || '' } : undefined,
      price: p.price,
      oldPrice: p.oldPrice ?? undefined,
      discountPercent: p.discountPercent ?? undefined,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categorySlug: p.category.slug,
      images: p.images.map((img) => img.url),
      inStock: p.inStock,
      stockCount: p.stockCount,
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      attributes: p.attributes.map((a) => ({
        name: { ru: a.nameRu, en: a.nameEn },
        value: { ru: a.valueRu, en: a.valueEn },
      })),
      description: { ru: p.descriptionRu, en: p.descriptionEn },
    };
  } catch (error) {
    return mockProducts.find((prod) => prod.slug === slug) || null;
  }
}

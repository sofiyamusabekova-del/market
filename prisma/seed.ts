import { PrismaClient } from '@prisma/client';
import { mockCategories, mockProducts } from '../mocks/products';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Neon PostgreSQL Seed ---');

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of mockCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        nameRu: cat.name.ru,
        nameEn: cat.name.en,
        iconName: cat.iconName,
        itemCount: cat.itemCount,
      },
      create: {
        id: cat.id,
        slug: cat.slug,
        nameRu: cat.name.ru,
        nameEn: cat.name.en,
        iconName: cat.iconName,
        itemCount: cat.itemCount,
      },
    });
  }

  // 2. Seed Products
  console.log('Seeding products and attributes...');
  for (const prod of mockProducts) {
    const category = await prisma.category.findUnique({
      where: { slug: prod.categorySlug },
    });

    if (!category) continue;

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        titleRu: prod.title.ru,
        titleEn: prod.title.en,
        subtitleRu: prod.subtitle?.ru,
        subtitleEn: prod.subtitle?.en,
        price: prod.price,
        oldPrice: prod.oldPrice,
        discountPercent: prod.discountPercent,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        inStock: prod.inStock,
        stockCount: prod.stockCount,
        isBestseller: prod.isBestseller ?? false,
        isNew: prod.isNew ?? false,
        descriptionRu: prod.description.ru,
        descriptionEn: prod.description.en,
        categoryId: category.id,
      },
      create: {
        id: prod.id,
        slug: prod.slug,
        titleRu: prod.title.ru,
        titleEn: prod.title.en,
        subtitleRu: prod.subtitle?.ru,
        subtitleEn: prod.subtitle?.en,
        price: prod.price,
        oldPrice: prod.oldPrice,
        discountPercent: prod.discountPercent,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        inStock: prod.inStock,
        stockCount: prod.stockCount,
        isBestseller: prod.isBestseller ?? false,
        isNew: prod.isNew ?? false,
        descriptionRu: prod.description.ru,
        descriptionEn: prod.description.en,
        categoryId: category.id,
      },
    });

    // Seed images
    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          url: prod.images[i],
          order: i,
          productId: createdProduct.id,
        },
      });
    }

    // Seed attributes
    await prisma.productAttribute.deleteMany({ where: { productId: createdProduct.id } });
    for (const attr of prod.attributes) {
      await prisma.productAttribute.create({
        data: {
          nameRu: attr.name.ru,
          nameEn: attr.name.en,
          valueRu: attr.value.ru,
          valueEn: attr.value.en,
          productId: createdProduct.id,
        },
      });
    }
  }

  // 3. Seed Default Admin User
  console.log('Seeding admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@voltstore.uz' },
    update: {},
    create: {
      email: 'admin@voltstore.uz',
      phone: '+998901234567',
      fullName: 'Chief Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✓ Neon Postgres Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

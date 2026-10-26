import React, { Suspense } from 'react';
import { Locale } from '@/lib/i18n';
import { getCategories, getProducts } from '@/lib/server-api';
import { CatalogView } from '@/components/catalog/CatalogView';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ locale: string; categorySlug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';
  const categorySlug = resolvedParams.categorySlug;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug }),
  ]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);
  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>{currentCategory.name[locale]}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {locale === 'ru'
            ? `Каталог товаров категории «${currentCategory.name[locale]}»`
            : `Products in category “${currentCategory.name[locale]}”`}
        </p>
      </div>

      <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Загрузка товаров...</div>}>
        <CatalogView
          products={products}
          categories={categories}
          locale={locale}
          currentCategorySlug={categorySlug}
        />
      </Suspense>
    </div>
  );
}

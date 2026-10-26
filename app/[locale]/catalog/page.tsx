import React, { Suspense } from 'react';
import { Locale } from '@/lib/i18n';
import { getCategories, getProducts } from '@/lib/server-api';
import { CatalogView } from '@/components/catalog/CatalogView';

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>{locale === 'ru' ? 'Каталог техники' : 'Product Catalog'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {locale === 'ru'
            ? 'Широкий выбор оригинальной техники с официальной гарантией'
            : 'Explore certified original electronics with official warranty'}
        </p>
      </div>

      <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Загрузка каталога...</div>}>
        <CatalogView
          products={products}
          categories={categories}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}

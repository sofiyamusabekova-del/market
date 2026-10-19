import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../cart/cart.module.css';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ComparePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ComparePage({ params }: ComparePageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>
        {locale === 'ru' ? 'Сравнение товаров' : 'Product Comparison'}
      </h1>

      <div className={styles.emptyCard}>
        <SlidersHorizontal size={56} className={styles.emptyIcon} />
        <h2>{locale === 'ru' ? 'Нет товаров для сравнения' : 'No items to compare'}</h2>
        <p>
          {locale === 'ru'
            ? 'Добавляйте товары к сравнению, чтобы сопоставить их характеристики и выбрать лучшее.'
            : 'Add products to compare their specifications and find the best match.'}
        </p>
        <Link href={`/${locale}/catalog`}>
          <Button variant="primary" size="md">
            <ArrowLeft size={16} />
            <span>{locale === 'ru' ? 'Перейти в каталог' : 'Browse Catalog'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

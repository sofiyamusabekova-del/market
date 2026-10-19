import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../cart/cart.module.css';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>
        {locale === 'ru' ? 'Избранные товары' : 'Wishlist & Favorites'}
      </h1>

      <div className={styles.emptyCard}>
        <Heart size={56} className={styles.emptyIcon} />
        <h2>{locale === 'ru' ? 'В избранном пока пусто' : 'Your wishlist is empty'}</h2>
        <p>
          {locale === 'ru'
            ? 'Добавляйте понравившиеся товары, нажимая на иконку сердечка в карточке товара.'
            : 'Save items you love by clicking the heart icon on any product card.'}
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

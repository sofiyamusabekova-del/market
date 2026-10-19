'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './favorites.module.css';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { useStore } from '@/lib/store';
import { mockProducts } from '@/mocks/products';

export default function FavoritesClient({ locale }: { locale: Locale }) {
  const { favorites } = useStore();

  const favoriteProducts = mockProducts.filter((p) => favorites.includes(p.slug));

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>{locale === 'ru' ? 'Избранные товары' : 'Wishlist & Favorites'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {locale === 'ru'
            ? `Сохранено товаров: ${favoriteProducts.length}`
            : `Saved items: ${favoriteProducts.length}`}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className={styles.emptyCard}>
          <Heart size={56} className={styles.emptyIcon} />
          <h2>{locale === 'ru' ? 'В избранном пока пусто' : 'Your wishlist is empty'}</h2>
          <p>
            {locale === 'ru'
              ? 'Нажимайте на иконку сердечка на карточках товаров, чтобы быстро вернуться к ним позже.'
              : 'Click the heart icon on any product card to save it for later.'}
          </p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" size="md">
              <ArrowLeft size={16} />
              <span>{locale === 'ru' ? 'Перейти в каталог' : 'Browse Catalog'}</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

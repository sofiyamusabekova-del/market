'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Heart, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Locale } from '@/lib/i18n';
import styles from './ProductPage.module.css';

interface ProductActionsProps {
  slug: string;
  locale: Locale;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ slug, locale }) => {
  const { isFavorite, toggleFavorite, isInCompare, toggleCompare } = useStore();
  const fav = isFavorite(slug);
  const comp = isInCompare(slug);

  return (
    <div className={styles.actionGroup}>
      <Button variant="primary" size="lg" fullWidth>
        <ShoppingCart size={20} />
        <span>{locale === 'ru' ? 'Добавить в корзину' : 'Add to Cart'}</span>
      </Button>
      <div className={styles.secondaryActions}>
        <Button
          variant={fav ? 'primary' : 'secondary'}
          size="md"
          onClick={() => toggleFavorite(slug)}
        >
          <Heart size={18} fill={fav ? '#ffffff' : 'none'} />
          <span>{fav ? (locale === 'ru' ? 'В избранном' : 'In Wishlist') : (locale === 'ru' ? 'В избранное' : 'To Favorites')}</span>
        </Button>
        <Button
          variant={comp ? 'primary' : 'secondary'}
          size="md"
          onClick={() => toggleCompare(slug)}
        >
          <SlidersHorizontal size={18} />
          <span>{comp ? (locale === 'ru' ? 'В сравнении' : 'In Compare') : (locale === 'ru' ? 'Сравнить' : 'Compare')}</span>
        </Button>
      </div>
    </div>
  );
};

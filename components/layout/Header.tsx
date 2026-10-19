import React from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { Search, ShoppingBag, Heart, SlidersHorizontal, Globe } from 'lucide-react';

interface HeaderProps {
  locale: Locale;
  cartCount?: number;
  favoritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  locale,
  cartCount = 0,
  favoritesCount = 0,
}) => {
  const switchLocale = locale === 'ru' ? 'en' : 'ru';

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        {/* Brand Logo */}
        <Link href={`/${locale}`} className={styles.logo}>
          <span className={styles.logoAccent}>VOLT</span>STORE
        </Link>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder={
              locale === 'ru'
                ? 'Поиск смартфонов, ноутбуков, техники...'
                : 'Search smartphones, laptops, electronics...'
            }
            className={styles.searchInput}
          />
        </div>

        {/* Actions / Navigation */}
        <div className={styles.actions}>
          {/* Language Switcher */}
          <Link href={`/${switchLocale}`} className={styles.actionBtn}>
            <Globe size={18} />
            <span className={styles.langLabel}>{switchLocale.toUpperCase()}</span>
          </Link>

          {/* Compare */}
          <Link href={`/${locale}/compare`} className={styles.actionBtn} title={locale === 'ru' ? 'Сравнение' : 'Compare'}>
            <SlidersHorizontal size={18} />
          </Link>

          {/* Favorites */}
          <Link href={`/${locale}/favorites`} className={styles.actionBtn} title={locale === 'ru' ? 'Избранное' : 'Favorites'}>
            <Heart size={18} />
            {favoritesCount > 0 && <span className={styles.badge}>{favoritesCount}</span>}
          </Link>

          {/* Cart */}
          <Link href={`/${locale}/cart`} className={`${styles.actionBtn} ${styles.cartBtn}`}>
            <ShoppingBag size={18} />
            <span className={styles.cartText}>{locale === 'ru' ? 'Корзина' : 'Cart'}</span>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

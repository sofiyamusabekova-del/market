'use client';

import React from 'react';
import styles from './Header.module.css';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import { Search, ShoppingBag, Heart, SlidersHorizontal, Globe } from 'lucide-react';
import { useStore } from '@/lib/store';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  locale: Locale;
  cartCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  locale,
  cartCount: propCartCount,
}) => {
  const switchLocale = locale === 'ru' ? 'en' : 'ru';
  const { favorites, compareList, cartCount: storeCartCount } = useStore();
  const cartCount = propCartCount !== undefined ? propCartCount : storeCartCount;
  const favoritesCount = favorites.length;
  const compareCount = compareList.length;

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
          {/* User Sign In (Google) */}
          <AuthModal locale={locale} />

          {/* Language Switcher */}
          <Link href={`/${switchLocale}`} className={styles.actionBtn}>
            <Globe size={18} />
            <span className={styles.langLabel}>{switchLocale.toUpperCase()}</span>
          </Link>

          {/* Compare */}
          <Link href={`/${locale}/compare`} className={styles.actionBtn} title={locale === 'ru' ? 'Сравнение' : 'Compare'}>
            <SlidersHorizontal size={18} />
            {compareCount > 0 && <span className={styles.badge}>{compareCount}</span>}
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

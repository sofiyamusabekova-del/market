'use client';

import React from 'react';
import styles from './CatalogView.module.css';
import { Product, Category } from '@/types';
import { Locale } from '@/lib/i18n';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, SlidersHorizontal, Search, X } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
  currentCategorySlug?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  locale,
  currentCategorySlug,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'popular';
  const selectedBrand = searchParams.get('brand') || '';
  const priceMin = searchParams.get('min') || '';
  const priceMax = searchParams.get('max') || '';

  // Extract available brands
  const brands = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const brandAttr = p.attributes.find((a) => a.name.ru === 'Бренд' || a.name.en === 'Brand');
      if (brandAttr) set.add(brandAttr.value.ru);
    });
    return Array.from(set);
  }, [products]);

  // Update URL params
  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (currentCategorySlug && p.categorySlug !== currentCategorySlug) return false;

      // Search query
      if (searchQuery) {
        const titleRu = p.title.ru.toLowerCase();
        const titleEn = p.title.en.toLowerCase();
        const q = searchQuery.toLowerCase();
        if (!titleRu.includes(q) && !titleEn.includes(q)) return false;
      }

      // Brand filter
      if (selectedBrand) {
        const brandAttr = p.attributes.find((a) => a.name.ru === 'Бренд' || a.name.en === 'Brand');
        if (!brandAttr || brandAttr.value.ru !== selectedBrand) return false;
      }

      // Price range
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;

      return true;
    });
  }, [products, currentCategorySlug, searchQuery, selectedBrand, priceMin, priceMax]);

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price_asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price_desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    // Default: 'popular'
    return list.sort((a, b) => b.reviewCount - a.reviewCount);
  }, [filteredProducts, sortBy]);

  const hasActiveFilters = Boolean(searchQuery || selectedBrand || priceMin || priceMax);

  return (
    <div className={styles.container}>
      {/* Search & Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateQuery('q', e.target.value)}
            placeholder={
              locale === 'ru'
                ? 'Быстрый поиск по названию модели...'
                : 'Filter by model or keyword...'
            }
            className={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => updateQuery('q', '')} className={styles.clearSearchBtn}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.sortBox}>
          <SlidersHorizontal size={16} />
          <select
            value={sortBy}
            onChange={(e) => updateQuery('sort', e.target.value)}
            className={styles.sortSelect}
          >
            <option value="popular">
              {locale === 'ru' ? 'Сначала популярные' : 'Most Popular'}
            </option>
            <option value="price_asc">
              {locale === 'ru' ? 'Сначала дешевле' : 'Price: Low to High'}
            </option>
            <option value="price_desc">
              {locale === 'ru' ? 'Сначала дороже' : 'Price: High to Low'}
            </option>
            <option value="rating">
              {locale === 'ru' ? 'Высокий рейтинг' : 'Top Rated'}
            </option>
          </select>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>
              <Filter size={18} />
              <span>{locale === 'ru' ? 'Фильтры' : 'Filters'}</span>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className={styles.resetBtn}>
                {locale === 'ru' ? 'Сбросить' : 'Reset'}
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className={styles.filterBlock}>
            <h4 className={styles.filterTitle}>{locale === 'ru' ? 'Категории' : 'Categories'}</h4>
            <div className={styles.categoryLinks}>
              <button
                onClick={() => router.push(`/${locale}/catalog`)}
                className={`${styles.catLink} ${!currentCategorySlug ? styles.catLinkActive : ''}`}
              >
                {locale === 'ru' ? 'Все категории' : 'All Categories'}
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/${locale}/catalog/${c.slug}`)}
                  className={`${styles.catLink} ${
                    currentCategorySlug === c.slug ? styles.catLinkActive : ''
                  }`}
                >
                  <span>{c.name[locale]}</span>
                  <span className={styles.catCount}>{c.itemCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className={styles.filterBlock}>
              <h4 className={styles.filterTitle}>{locale === 'ru' ? 'Бренд' : 'Brand'}</h4>
              <div className={styles.brandList}>
                {brands.map((brand) => (
                  <label key={brand} className={styles.checkboxLabel}>
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => updateQuery('brand', selectedBrand === brand ? '' : brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
                {selectedBrand && (
                  <button onClick={() => updateQuery('brand', '')} className={styles.clearMiniBtn}>
                    {locale === 'ru' ? 'Все бренды' : 'All brands'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className={styles.filterBlock}>
            <h4 className={styles.filterTitle}>
              {locale === 'ru' ? 'Цена (сум)' : 'Price (UZS)'}
            </h4>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder={locale === 'ru' ? 'От' : 'Min'}
                value={priceMin}
                onChange={(e) => updateQuery('min', e.target.value)}
                className={styles.priceField}
              />
              <span className={styles.priceDash}>—</span>
              <input
                type="number"
                placeholder={locale === 'ru' ? 'До' : 'Max'}
                value={priceMax}
                onChange={(e) => updateQuery('max', e.target.value)}
                className={styles.priceField}
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className={styles.gridArea}>
          <div className={styles.resultsInfo}>
            <span>
              {locale === 'ru'
                ? `Найдено товаров: ${sortedProducts.length}`
                : `Products found: ${sortedProducts.length}`}
            </span>
          </div>

          {sortedProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>{locale === 'ru' ? 'Ничего не найдено' : 'No products found'}</h3>
              <p>
                {locale === 'ru'
                  ? 'Попробуйте изменить параметры фильтрации или поисковый запрос.'
                  : 'Try adjusting your filters or search keywords.'}
              </p>
              <Button variant="secondary" onClick={clearAllFilters}>
                {locale === 'ru' ? 'Сбросить фильтры' : 'Reset filters'}
              </Button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

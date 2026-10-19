'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './compare.module.css';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { useStore } from '@/lib/store';
import { mockProducts } from '@/mocks/products';

export default function CompareClient({ locale }: { locale: Locale }) {
  const { compareList, toggleCompare, clearCompare } = useStore();

  const comparedProducts = mockProducts.filter((p) => compareList.includes(p.slug));

  // Collect all unique attribute names across compared products
  const attributeNames = React.useMemo(() => {
    const map = new Map<string, { ru: string; en: string }>();
    comparedProducts.forEach((p) => {
      p.attributes.forEach((attr) => {
        if (!map.has(attr.name.ru)) {
          map.set(attr.name.ru, { ru: attr.name.ru, en: attr.name.en });
        }
      });
    });
    return Array.from(map.values());
  }, [comparedProducts]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className={styles.headerRow}>
        <div>
          <h1>{locale === 'ru' ? 'Сравнение товаров' : 'Product Comparison'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {locale === 'ru'
              ? `Выбрано товаров для сравнения: ${comparedProducts.length} (максимум 4)`
              : `Selected items to compare: ${comparedProducts.length} (up to 4)`}
          </p>
        </div>

        {comparedProducts.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompare}>
            <Trash2 size={16} />
            <span>{locale === 'ru' ? 'Очистить список' : 'Clear all'}</span>
          </Button>
        )}
      </div>

      {comparedProducts.length === 0 ? (
        <div className={styles.emptyCard}>
          <SlidersHorizontal size={56} className={styles.emptyIcon} />
          <h2>{locale === 'ru' ? 'Нет товаров для сравнения' : 'No items to compare'}</h2>
          <p>
            {locale === 'ru'
              ? 'Нажимайте на иконку весов/сравнения на карточках любых товаров в каталоге, чтобы сравнить характеристики.'
              : 'Click the compare icon on any product in the catalog to inspect their specifications side by side.'}
          </p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" size="md">
              <ArrowLeft size={16} />
              <span>{locale === 'ru' ? 'Перейти в каталог' : 'Browse Catalog'}</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th className={styles.paramColumn}>
                  {locale === 'ru' ? 'Параметры' : 'Parameters'}
                </th>
                {comparedProducts.map((p) => (
                  <th key={p.id} className={styles.productHeaderCell}>
                    <button
                      onClick={() => toggleCompare(p.slug)}
                      className={styles.removeBtn}
                      title={locale === 'ru' ? 'Удалить из сравнения' : 'Remove from compare'}
                    >
                      <X size={16} />
                    </button>
                    <Link href={`/${locale}/product/${p.slug}`}>
                      <img src={p.images[0]} alt="" className={styles.productImg} />
                      <h4 className={styles.productTitle}>{p.title[locale]}</h4>
                    </Link>
                    <div style={{ marginTop: '0.5rem' }}>
                      <Price amount={p.price} oldAmount={p.oldPrice} locale={locale} size="sm" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category row */}
              <tr>
                <td className={styles.paramLabel}>{locale === 'ru' ? 'Категория' : 'Category'}</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className={styles.paramValue}>
                    {p.categorySlug}
                  </td>
                ))}
              </tr>

              {/* Rating row */}
              <tr>
                <td className={styles.paramLabel}>{locale === 'ru' ? 'Рейтинг' : 'Rating'}</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className={styles.paramValue}>
                    ★ {p.rating} ({p.reviewCount})
                  </td>
                ))}
              </tr>

              {/* Dynamic specs rows */}
              {attributeNames.map((attr, idx) => (
                <tr key={idx}>
                  <td className={styles.paramLabel}>{attr[locale]}</td>
                  {comparedProducts.map((p) => {
                    const match = p.attributes.find((a) => a.name.ru === attr.ru);
                    return (
                      <td key={p.id} className={styles.paramValue}>
                        {match ? match.value[locale] : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

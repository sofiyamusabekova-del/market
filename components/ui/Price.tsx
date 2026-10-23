import React from 'react';
import styles from './Price.module.css';
import { formatPrice, Locale, Currency } from '@/lib/i18n';

interface PriceProps {
  amount: number;
  oldAmount?: number;
  locale?: Locale;
  currency?: Currency;
  size?: 'sm' | 'md' | 'lg';
}

export const Price: React.FC<PriceProps> = ({
  amount,
  oldAmount,
  locale = 'ru',
  currency = 'UZS',
  size = 'md',
}) => {
  return (
    <div className={`${styles.priceContainer} ${styles[size]}`}>
      <span className={styles.current}>{formatPrice(amount, locale, currency)}</span>
      {oldAmount && oldAmount > amount && (
        <span className={styles.old}>{formatPrice(oldAmount, locale, currency)}</span>
      )}
    </div>
  );
};

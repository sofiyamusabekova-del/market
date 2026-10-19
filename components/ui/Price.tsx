import React from 'react';
import styles from './Price.module.css';
import { formatPrice, Locale } from '@/lib/i18n';

interface PriceProps {
  amount: number;
  oldAmount?: number;
  locale?: Locale;
  size?: 'sm' | 'md' | 'lg';
}

export const Price: React.FC<PriceProps> = ({
  amount,
  oldAmount,
  locale = 'ru',
  size = 'md',
}) => {
  return (
    <div className={`${styles.priceContainer} ${styles[size]}`}>
      <span className={styles.current}>{formatPrice(amount, locale)}</span>
      {oldAmount && oldAmount > amount && (
        <span className={styles.old}>{formatPrice(oldAmount, locale)}</span>
      )}
    </div>
  );
};

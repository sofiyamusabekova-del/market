import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'new' | 'discount' | 'bestseller' | 'stock' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children }) => {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
};

import React from 'react';
import styles from './ProductCard.module.css';
import { Product } from '@/types';
import { Locale } from '@/lib/i18n';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  locale: Locale;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  locale,
  onAddToCart,
}) => {
  const title = product.title[locale] || product.title.ru;
  const subtitle = product.subtitle ? product.subtitle[locale] || product.subtitle.ru : '';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <div className={styles.badges}>
          {product.isNew && <Badge variant="new">{locale === 'ru' ? 'Новинка' : 'New'}</Badge>}
          {product.discountPercent && (
            <Badge variant="discount">-{product.discountPercent}%</Badge>
          )}
          {product.isBestseller && (
            <Badge variant="bestseller">{locale === 'ru' ? 'Хит' : 'Hit'}</Badge>
          )}
        </div>

        <Link href={`/${locale}/product/${product.slug}`} className={styles.imageLink}>
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
            alt={title}
            className={styles.image}
            loading="lazy"
          />
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.ratingRow}>
          <div className={styles.rating}>
            <Star className={styles.starIcon} size={14} fill="#eab308" color="#eab308" />
            <span className={styles.ratingValue}>{product.rating}</span>
          </div>
          <span className={styles.reviewsCount}>
            ({product.reviewCount} {locale === 'ru' ? 'отзывов' : 'reviews'})
          </span>
        </div>

        <Link href={`/${locale}/product/${product.slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        <div className={styles.footerRow}>
          <Price
            amount={product.price}
            oldAmount={product.oldPrice}
            locale={locale}
            size="md"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddToCart && onAddToCart(product)}
            aria-label={locale === 'ru' ? 'В корзину' : 'Add to cart'}
          >
            <ShoppingCart size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Locale } from '@/lib/i18n';
import { mockProducts } from '@/mocks/products';
import { notFound } from 'next/navigation';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductActions } from './ProductActions';
import styles from './ProductPage.module.css';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Heart,
  SlidersHorizontal,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';
  const slug = resolvedParams.slug;

  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const title = product.title[locale];
  const description = product.description[locale];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href={`/${locale}`}>{locale === 'ru' ? 'Главная' : 'Home'}</Link>
        <ChevronRight size={14} />
        <Link href={`/${locale}/catalog`}>{locale === 'ru' ? 'Каталог' : 'Catalog'}</Link>
        <ChevronRight size={14} />
        <Link href={`/${locale}/catalog/${product.categorySlug}`}>
          {product.categorySlug}
        </Link>
        <ChevronRight size={14} />
        <span className={styles.currentBreadcrumb}>{title}</span>
      </nav>

      <div className={styles.productGrid}>
        {/* Left: Gallery */}
        <div className={styles.galleryColumn}>
          <div className={styles.mainImageWrapper}>
            <div className={styles.badgeList}>
              {product.isNew && (
                <Badge variant="new">{locale === 'ru' ? 'Новинка' : 'New'}</Badge>
              )}
              {product.discountPercent && (
                <Badge variant="discount">-{product.discountPercent}%</Badge>
              )}
              {product.isBestseller && (
                <Badge variant="bestseller">{locale === 'ru' ? 'Хит' : 'Hit'}</Badge>
              )}
            </div>
            <img
              src={product.images[0]}
              alt={title}
              className={styles.mainImage}
            />
          </div>

          {product.images.length > 1 && (
            <div className={styles.thumbList}>
              {product.images.map((img, idx) => (
                <div key={idx} className={styles.thumbWrapper}>
                  <img src={img} alt="" className={styles.thumbImage} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className={styles.infoColumn}>
          <div className={styles.ratingBar}>
            <div className={styles.ratingStars}>
              <Star size={16} fill="#eab308" color="#eab308" />
              <span className={styles.ratingNum}>{product.rating}</span>
            </div>
            <span className={styles.reviewText}>
              ({product.reviewCount} {locale === 'ru' ? 'отзывов' : 'reviews'})
            </span>
            <div className={styles.stockBadge}>
              <CheckCircle2 size={14} color="#4ade80" />
              <span>{locale === 'ru' ? 'В наличии в Ташкенте' : 'In stock (Tashkent)'}</span>
            </div>
          </div>

          <h1 className={styles.productTitle}>{title}</h1>

          {product.subtitle && (
            <p className={styles.productSubtitle}>{product.subtitle[locale]}</p>
          )}

          {/* Price Box */}
          <div className={styles.priceBox}>
            <Price
              amount={product.price}
              oldAmount={product.oldPrice}
              locale={locale}
              size="lg"
            />
            {product.discountPercent && (
              <span className={styles.savingsTag}>
                {locale === 'ru'
                  ? `Экономия: -${product.discountPercent}%`
                  : `Save: -${product.discountPercent}%`}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <ProductActions slug={product.slug} locale={locale} />

          {/* Delivery & Service Perks */}
          <div className={styles.servicePerks}>
            <div className={styles.perkRow}>
              <Truck size={18} className={styles.perkIcon} />
              <div>
                <strong>{locale === 'ru' ? 'Экспресс-доставка' : 'Express Delivery'}</strong>
                <p>
                  {locale === 'ru'
                    ? 'Курьером сегодня по Ташкенту, 1–2 дня по областям.'
                    : 'Same-day courier in Tashkent, 1–2 days nationwide.'}
                </p>
              </div>
            </div>
            <div className={styles.perkRow}>
              <ShieldCheck size={18} className={styles.perkIcon} />
              <div>
                <strong>{locale === 'ru' ? 'Гарантия 1 год' : '1 Year Warranty'}</strong>
                <p>
                  {locale === 'ru'
                    ? 'Официальный сервисный талон и чек покупки.'
                    : 'Official warranty slip and purchase receipt.'}
                </p>
              </div>
            </div>
            <div className={styles.perkRow}>
              <RotateCcw size={18} className={styles.perkIcon} />
              <div>
                <strong>{locale === 'ru' ? '14 дней на возврат' : '14 Days Return'}</strong>
                <p>
                  {locale === 'ru'
                    ? 'Простой возврат и обмен при сохранении товарного вида.'
                    : 'Simple returns and exchange if in original condition.'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={styles.descSection}>
            <h3>{locale === 'ru' ? 'Описание товара' : 'Product Description'}</h3>
            <p className={styles.descText}>{description}</p>
          </div>

          {/* Specifications */}
          <div className={styles.specsSection}>
            <h3>{locale === 'ru' ? 'Характеристики' : 'Specifications'}</h3>
            <dl className={styles.specsList}>
              {product.attributes.map((attr, idx) => (
                <div key={idx} className={styles.specItem}>
                  <dt className={styles.specName}>{attr.name[locale]}</dt>
                  <dd className={styles.specValue}>{attr.value[locale]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

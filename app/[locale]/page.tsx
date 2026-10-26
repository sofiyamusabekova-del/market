import React from 'react';
import { Locale } from '@/lib/i18n';
import { getCategories, getProducts } from '@/lib/server-api';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';
  
  const [categories, allProducts] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const bestsellers = allProducts.filter((p) => p.isBestseller);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Bento Grid Hero */}
      <section className={styles.bentoSection}>
        {/* Main Promo Card */}
        <div className={`${styles.bentoCard} ${styles.bentoHero}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>{locale === 'ru' ? 'Новинки сезона 2026' : 'Season 2026 Arrivals'}</span>
            </div>
            <h1 className={styles.heroTitle}>
              {locale === 'ru' ? (
                <>
                  Флагманские технологии <br />
                  <span className={styles.gradientText}>по честным ценам</span>
                </>
              ) : (
                <>
                  Flagship electronics <br />
                  <span className={styles.gradientText}>at transparent prices</span>
                </>
              )}
            </h1>
            <p className={styles.heroSubtitle}>
              {locale === 'ru'
                ? 'Официальные поставки смартфонов, ноутбуков и бытовой техники с быстрой доставкой по Ташкенту и всему Узбекистану.'
                : 'Official smartphones, laptops, and home appliances with fast delivery across Tashkent and all of Uzbekistan.'}
            </p>
            <div className={styles.heroActions}>
              <Link href={`/${locale}/catalog`}>
                <Button variant="primary" size="lg">
                  <span>{locale === 'ru' ? 'Перейти в каталог' : 'Explore Catalog'}</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Sub Card 1 */}
        <div className={`${styles.bentoCard} ${styles.bentoSub1}`}>
          <div className={styles.subCardTag}>
            <Zap size={14} color="#06b6d4" />
            <span>{locale === 'ru' ? 'Хит продаж' : 'Top Seller'}</span>
          </div>
          <h3 className={styles.subCardTitle}>iPhone 16 Pro Max</h3>
          <p className={styles.subCardPrice}>от 17 890 000 сум</p>
          <Link href={`/${locale}/catalog/smartphones`} className={styles.subCardLink}>
            {locale === 'ru' ? 'Смотреть варианты' : 'View details'} →
          </Link>
        </div>

        {/* Bento Sub Card 2 */}
        <div className={`${styles.bentoCard} ${styles.bentoSub2}`}>
          <div className={styles.subCardTag}>
            <Shield size={14} color="#4ade80" />
            <span>{locale === 'ru' ? 'Сервис' : 'Warranty'}</span>
          </div>
          <h3 className={styles.subCardTitle}>
            {locale === 'ru' ? 'Официальная гарантия 1 год' : '1 Year Official Warranty'}
          </h3>
          <p className={styles.subCardDesc}>
            {locale === 'ru'
              ? 'Авторизованные сервисные центры и полная техническая поддержка.'
              : 'Authorized service centers and complete technical support.'}
          </p>
        </div>
      </section>

      {/* Categories Bar */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{locale === 'ru' ? 'Популярные категории' : 'Featured Categories'}</h2>
          <Link href={`/${locale}/catalog`} className={styles.viewAll}>
            {locale === 'ru' ? 'Весь каталог' : 'All Categories'} →
          </Link>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/catalog/${cat.slug}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryName}>{cat.name[locale]}</span>
              <span className={styles.categoryCount}>
                {cat.itemCount} {locale === 'ru' ? 'товаров' : 'items'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Bestsellers */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{locale === 'ru' ? 'Хиты продаж' : 'Bestsellers'}</h2>
        </div>

        <div className={styles.productsGrid}>
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  );
}

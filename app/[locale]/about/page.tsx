import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../delivery/info.module.css';
import { ShieldCheck, Award, Zap, Users, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <h1 className={styles.title} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {locale === 'ru' ? 'О магазине VOLT STORE' : 'About VOLT STORE'}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
          {locale === 'ru'
            ? 'VOLT STORE — премиальный ритейлер флагманской электроники, гаджетов и инновационной бытовой техники в Узбекистане.'
            : 'VOLT STORE is a premier retailer of flagship consumer electronics, gadgets, and innovative home tech in Uzbekistan.'}
        </p>

        <div className={styles.infoGrid} style={{ marginBottom: '3rem' }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Award size={24} className={styles.icon} />
              <h3>{locale === 'ru' ? '100% Оригинальная техника' : '100% Genuine Devices'}</h3>
            </div>
            <p>
              {locale === 'ru'
                ? 'Прямые поставки от авторизованных дистрибьюторов Apple, Samsung, Dyson, Sony, ASUS. Все устройства имеют официальные серийные номера и сертификацию.'
                : 'Direct distribution from Apple, Samsung, Dyson, Sony, and ASUS. Every single product has verified serial numbers and official certification.'}
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <ShieldCheck size={24} className={styles.icon} />
              <h3>{locale === 'ru' ? 'Гарантия и сервис 1 год' : '1 Year Official Warranty'}</h3>
            </div>
            <p>
              {locale === 'ru'
                ? 'Официальный сервисный талон и чек к каждой покупке. Быстрое гарантийное обслуживание в авторизованных сервисных центрах Ташкента.'
                : 'Official warranty receipt included with every order. Fast repair and support in certified service centers in Tashkent.'}
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Zap size={24} className={styles.icon} />
              <h3>{locale === 'ru' ? 'Собственная служба доставки' : 'Express In-House Delivery'}</h3>
            </div>
            <p>
              {locale === 'ru'
                ? 'Быстрая экспресс-доставка по Ташкенту в течение 2–3 часов и безопасная междугородняя доставка во все регионы за 24–48 часов.'
                : 'Express same-day courier across Tashkent in 2–3 hours and 24–48h nationwide delivery with parcel tracking.'}
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Building2 size={24} className={styles.icon} />
              <h3>{locale === 'ru' ? 'Флагманский демо-зал' : 'Flagship Experience Center'}</h3>
            </div>
            <p>
              {locale === 'ru'
                ? 'Шоурум в центре города (ул. Амира Темура, 42), где перед покупкой можно вживую протестировать новинки и проконсультироваться с экспертами.'
                : 'Visit our showroom in the heart of Tashkent (Amir Temur St. 42) to test and experience the latest devices first-hand.'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" size="lg">
              <Sparkles size={18} />
              <span>{locale === 'ru' ? 'Перейти к покупкам' : 'Explore Catalog'}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

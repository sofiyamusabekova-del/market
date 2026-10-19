import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../delivery/info.module.css';
import { ShieldCheck, RotateCcw, AlertCircle } from 'lucide-react';

interface WarrantyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WarrantyPage({ params }: WarrantyPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Гарантия и возврат' : 'Warranty & Returns'}
      </h1>

      <div className={styles.infoGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ShieldCheck size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Официальная гарантия' : 'Official Warranty'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'На всю электронику распространяется официальная гарантия производителя сроком от 12 до 24 месяцев.'
              : 'All electronics carry manufacturer warranty ranging from 12 to 24 months.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <RotateCcw size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? '14 дней на возврат' : '14 Days Hassle-free Returns'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Возврат или обмен товара надлежащего качества в течение 14 дней с момента получения при сохранности упаковки.'
              : 'Return or exchange within 14 days of purchase in original condition and packaging.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <AlertCircle size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Сервисные центры' : 'Authorized Service'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Ремонт и диагностика осуществляются в авторизованных сервисных центрах Ташкента и регионов.'
              : 'Diagnostics and repairs conducted at authorized local service centers.'}
          </p>
        </div>
      </div>
    </div>
  );
}

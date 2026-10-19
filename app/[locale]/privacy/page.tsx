import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../delivery/info.module.css';
import { Lock, FileText, UserCheck } from 'lucide-react';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
      </h1>

      <div className={styles.infoGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Lock size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Безопасность данных' : 'Data Protection'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Магазин не хранит и не обрабатывает полные данные банковских карт. Все транзакции передаются по защищенному протоколу SSL.'
              : 'VoltStore never stores full credit card details. All transactions process through encrypted SSL pipelines.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <UserCheck size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Персональные данные' : 'Personal Information'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Контактный телефон и адрес доставки используются исключительно для выполнения и подтверждения заказов покупателя.'
              : 'Contact phone numbers and addresses are collected exclusively for order fulfillment and shipping.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileText size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Законодательство' : 'Legal Compliance'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Обработка данных осуществляется в строгом соответствии с Законом Республики Узбекистан «О персональных данных».'
              : 'Data processing complies fully with the Personal Data Law of the Republic of Uzbekistan.'}
          </p>
        </div>
      </div>
    </div>
  );
}

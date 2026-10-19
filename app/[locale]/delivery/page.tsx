import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './info.module.css';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface DeliveryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Доставка и оплата' : 'Delivery & Payment'}
      </h1>

      <div className={styles.infoGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Truck size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Доставка по Ташкенту' : 'Tashkent Delivery'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Экспресс-доставка день в день при заказе до 16:00. Стоимость — бесплатно при заказе от 5 000 000 сум.'
              : 'Same-day express delivery for orders before 16:00. Free on orders above 5,000,000 UZS.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Clock size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Доставка по Узбекистану' : 'Regions Delivery'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Доставка во все областные центры за 24–48 часов надежной курьерской службой с трек-номером.'
              : 'Reliable courier delivery across all regional centers within 24–48 hours with live tracking.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ShieldCheck size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Способы оплаты' : 'Payment Methods'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Оплата онлайн картами Uzum / Payme / Click / Visa / Mastercard, либо наличными курьеру при получении.'
              : 'Online payment via Uzum, Payme, Click, Visa, Mastercard, or cash upon delivery.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPin size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Самовывоз' : 'Store Pickup'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Пункт выдачи и демонстрационный зал в Ташкенте. Проверка техники перед оплатой.'
              : 'Pickup point & showroom in Tashkent. Hands-on testing before purchase.'}
          </p>
        </div>
      </div>
    </div>
  );
}

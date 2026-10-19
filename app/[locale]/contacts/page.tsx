import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from '../delivery/info.module.css';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

interface ContactsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactsPage({ params }: ContactsPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 className={styles.title}>
        {locale === 'ru' ? 'Контакты и адреса' : 'Contacts & Showrooms'}
      </h1>

      <div className={styles.infoGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Phone size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Телефон поддержки' : 'Customer Support'}</h3>
          </div>
          <p>
            +998 (71) 200-00-00<br />
            {locale === 'ru' ? 'Ежедневно с 09:00 до 21:00' : 'Daily from 09:00 to 21:00'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Mail size={24} className={styles.icon} />
            <h3>Email</h3>
          </div>
          <p>
            support@voltstore.uz<br />
            sales@voltstore.uz
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPin size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'Главный шоурум' : 'Flagship Store'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'г. Ташкент, ул. Амира Темура, 107Б (ориентир: станция метро Бадамзар)'
              : 'Tashkent, Amir Temur St., 107B (near Bodomzor metro station)'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Clock size={24} className={styles.icon} />
            <h3>{locale === 'ru' ? 'График работы' : 'Working Hours'}</h3>
          </div>
          <p>
            {locale === 'ru'
              ? 'Магазин и выдача заказов: Пн–Вс 10:00 – 22:00 без выходных'
              : 'Showroom & order pickup: Mon–Sun 10:00 – 22:00, 7 days a week'}
          </p>
        </div>
      </div>
    </div>
  );
}

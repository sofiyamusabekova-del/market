import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import ruMsg from '@/messages/ru.json';
import enMsg from '@/messages/en.json';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const t = locale === 'ru' ? ruMsg.footer : enMsg.footer;

  return (
    <footer className={styles.footer}>
      {/* Value props banner */}
      <div className={styles.perks}>
        <div className={`container ${styles.perksGrid}`}>
          <div className={styles.perkItem}>
            <ShieldCheck className={styles.perkIcon} size={24} />
            <div>
              <h4 className={styles.perkTitle}>
                {locale === 'ru' ? 'Официальная гарантия' : 'Official Warranty'}
              </h4>
              <p className={styles.perkDesc}>
                {locale === 'ru' ? 'Сертифицированная техника' : 'Certified devices'}
              </p>
            </div>
          </div>

          <div className={styles.perkItem}>
            <Truck className={styles.perkIcon} size={24} />
            <div>
              <h4 className={styles.perkTitle}>
                {locale === 'ru' ? 'Быстрая доставка' : 'Express Delivery'}
              </h4>
              <p className={styles.perkDesc}>
                {locale === 'ru' ? 'По Ташкенту и регионам' : 'Tashkent and all regions'}
              </p>
            </div>
          </div>

          <div className={styles.perkItem}>
            <RefreshCw className={styles.perkIcon} size={24} />
            <div>
              <h4 className={styles.perkTitle}>
                {locale === 'ru' ? 'Обмен и возврат' : 'Returns & Exchange'}
              </h4>
              <p className={styles.perkDesc}>
                {locale === 'ru' ? '14 дней на проверку' : '14 days hassle-free'}
              </p>
            </div>
          </div>

          <div className={styles.perkItem}>
            <Headphones className={styles.perkIcon} size={24} />
            <div>
              <h4 className={styles.perkTitle}>
                {locale === 'ru' ? 'Поддержка 24/7' : '24/7 Support'}
              </h4>
              <p className={styles.perkDesc}>
                {locale === 'ru' ? 'Консультации специалистов' : 'Expert assistance'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.footerMain}`}>
        <div className={styles.footerCol}>
          <div className={styles.footerLogo}>
            <span>VOLT</span>STORE
          </div>
          <p className={styles.footerTagline}>{t.tagline}</p>
        </div>

        <div className={styles.footerCol}>
          <h4 className={styles.footerColTitle}>{t.buyerGuide}</h4>
          <ul className={styles.linkList}>
            <li><Link href={`/${locale}/delivery`}>{t.delivery}</Link></li>
            <li><Link href={`/${locale}/warranty`}>{t.warranty}</Link></li>
            <li><Link href={`/${locale}/contacts`}>{t.contacts}</Link></li>
            <li><Link href={`/${locale}/privacy`}>{t.privacy}</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.copyrightBar}>
        <div className={`container ${styles.copyrightInner}`}>
          <span>© {new Date().getFullYear()} VoltStore. {t.rights}</span>
          <span className={styles.disclaimer}>
            {locale === 'ru'
              ? 'Цены и наличие синхронизируются на сервере.'
              : 'Prices and availability synchronized by server.'}
          </span>
        </div>
      </div>
    </footer>
  );
};

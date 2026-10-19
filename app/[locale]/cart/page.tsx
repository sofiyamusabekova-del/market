import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './cart.module.css';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>
        {locale === 'ru' ? 'Корзина покупок' : 'Shopping Cart'}
      </h1>

      <div className={styles.emptyCard}>
        <ShoppingBag size={56} className={styles.emptyIcon} />
        <h2>{locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}</h2>
        <p>
          {locale === 'ru'
            ? 'Выберите интересующие товары в каталоге, чтобы оформить заказ.'
            : 'Select items from our catalog to proceed with your order.'}
        </p>
        <Link href={`/${locale}/catalog`}>
          <Button variant="primary" size="md">
            <ArrowLeft size={16} />
            <span>{locale === 'ru' ? 'Перейти в каталог' : 'Browse Catalog'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

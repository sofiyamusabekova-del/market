'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './order.module.css';
import { useStore } from '@/lib/store';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';

interface OrderDetailViewProps {
  orderNumber: string;
  locale: Locale;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ orderNumber, locale }) => {
  const { getOrder, updateOrderStatus, mounted } = useStore();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams?.get('payment_status');
  const sessionId = searchParams?.get('session_id');

  const order = getOrder(orderNumber);

  React.useEffect(() => {
    if (paymentStatus === 'success' && order && order.status !== 'paid') {
      updateOrderStatus(orderNumber, 'paid');

      // Sync with server if database order exists
      fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'stripe',
          orderNumber,
          transactionId: sessionId || `stripe_${orderNumber}`,
          status: 'SUCCESS',
        }),
      }).catch(() => {});
    }
  }, [paymentStatus, sessionId, orderNumber, order, updateOrderStatus]);

  if (!mounted) {
    return (
      <div className={`container ${styles.orderContainer}`}>
        <div className={styles.statusHeaderCard} style={{ opacity: 0.6 }}>
          <Clock size={48} color="var(--accent-cyan)" />
          <h1 className={styles.orderHeading}>
            {locale === 'ru' ? 'Загрузка данных заказа...' : 'Loading order details...'}
          </h1>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`container ${styles.orderContainer}`}>
        <div className={styles.statusHeaderCard}>
          <Clock size={56} color="var(--accent-cyan)" />
          <h1 className={styles.orderHeading}>
            {locale === 'ru' ? 'Заказ не найден' : 'Order Not Found'}
          </h1>
          <p className={styles.orderSubtitle}>
            {locale === 'ru'
              ? `Заказ с номером ${orderNumber} не найден в текущей сессии.`
              : `Order with number ${orderNumber} was not found in your session.`}
          </p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" size="md">
              <span>{locale === 'ru' ? 'Вернуться к покупкам' : 'Back to Shopping'}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';

  return (
    <div className={`container ${styles.orderContainer}`}>
      {/* Success banner */}
      <div className={styles.statusHeaderCard}>
        <div className={styles.successIconWrapper}>
          <CheckCircle2 size={42} />
        </div>
        <h1 className={styles.orderHeading}>
          {locale === 'ru' ? 'Заказ успешно принят!' : 'Order Placed Successfully!'}
        </h1>
        <div className={styles.orderNumberTag}>
          <span>{order.orderNumber}</span>
        </div>
        <p className={styles.orderSubtitle}>
          {locale === 'ru'
            ? 'Спасибо за покупку в VOLT STORE! Мы отправили детали заказа на ваш номер и уже готовим товары к отправке.'
            : 'Thank you for shopping with VOLT STORE! We have sent order details and are preparing your package.'}
        </p>
      </div>

      {/* Progress Timeline */}
      <div className={styles.timelineCard}>
        <div className={styles.timelineHeading}>
          {locale === 'ru' ? 'Статус выполнения заказа' : 'Order Progress'}
        </div>
        <div className={styles.stepsList}>
          <div className={styles.stepItem}>
            <div className={styles.stepIconRow}>
              <div className={`${styles.stepDot} ${styles.stepDone}`}>✓</div>
              <span className={styles.stepTitle}>
                {locale === 'ru' ? 'Создан' : 'Created'}
              </span>
            </div>
            <span className={styles.stepSubtitle}>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepIconRow}>
              <div className={`${styles.stepDot} ${isPaid ? styles.stepDone : styles.stepActive}`}>
                {isPaid ? '✓' : '2'}
              </div>
              <span className={styles.stepTitle}>
                {isPaid
                  ? (locale === 'ru' ? 'Оплачен' : 'Paid')
                  : (locale === 'ru' ? 'Оплата' : 'Payment')}
              </span>
            </div>
            <span className={styles.stepSubtitle}>
              {isPaid
                ? (locale === 'ru' ? 'Оплачено картой онлайн' : 'Paid online via Card')
                : (order.customer.paymentMethod === 'cash'
                    ? (locale === 'ru' ? 'При получении' : 'On delivery')
                    : (locale === 'ru' ? 'Ожидает оплаты' : 'Pending payment'))}
            </span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepIconRow}>
              <div className={`${styles.stepDot} ${styles.stepActive}`}>3</div>
              <span className={styles.stepTitle}>
                {locale === 'ru' ? 'Сборка' : 'Packing'}
              </span>
            </div>
            <span className={styles.stepSubtitle}>
              {locale === 'ru' ? 'На складе' : 'In warehouse'}
            </span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepIconRow}>
              <div className={`${styles.stepDot} ${styles.stepPending}`}>4</div>
              <span className={styles.stepTitle}>
                {locale === 'ru' ? 'В пути' : 'Out for delivery'}
              </span>
            </div>
            <span className={styles.stepSubtitle}>
              {locale === 'ru' ? 'Курьер VOLT' : 'VOLT Courier'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className={styles.orderDetailsGrid}>
        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>
            <User size={18} />
            <span>{locale === 'ru' ? 'Получатель' : 'Customer'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{locale === 'ru' ? 'Имя:' : 'Name:'}</span>
            <span className={styles.detailVal}>{order.customer.fullName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{locale === 'ru' ? 'Телефон:' : 'Phone:'}</span>
            <span className={styles.detailVal}>{order.customer.phone}</span>
          </div>
          {order.customer.email && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email:</span>
              <span className={styles.detailVal}>{order.customer.email}</span>
            </div>
          )}
        </div>

        <div className={styles.detailCard}>
          <div className={styles.detailCardTitle}>
            <Truck size={18} />
            <span>{locale === 'ru' ? 'Доставка и оплата' : 'Delivery & Payment'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{locale === 'ru' ? 'Адрес:' : 'Address:'}</span>
            <span className={styles.detailVal}>{order.customer.address}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{locale === 'ru' ? 'Метод оплаты:' : 'Payment:'}</span>
            <span className={styles.detailVal}>
              {order.customer.paymentMethod === 'test_card'
                ? (locale === 'ru' ? 'Банковская карта (Тест ✓)' : 'Card Payment (Demo ✓)')
                : (locale === 'ru' ? 'Оплата при получении' : 'Pay on Delivery')}
            </span>
          </div>
        </div>
      </div>

      {/* Items in order */}
      <div className={styles.itemsCard}>
        <div className={styles.detailCardTitle}>
          <Package size={18} />
          <span>{locale === 'ru' ? 'Состав заказа' : 'Items Ordered'}</span>
        </div>
        <div className={styles.itemList}>
          {order.items.map((item) => (
            <div key={item.id} className={styles.orderItemRow}>
              <img src={item.image} alt={item.title[locale] || item.title.ru} className={styles.orderItemImg} />
              <div>
                <div style={{ fontWeight: 600 }}>{item.title[locale] || item.title.ru}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  {item.quantity} шт. × <Price amount={item.price} locale={locale} size="sm" />
                </div>
              </div>
              <Price amount={item.price * item.quantity} locale={locale} size="md" />
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {locale === 'ru' ? 'Итоговая сумма:' : 'Total Amount:'}
          </span>
          <Price amount={order.total} locale={locale} size="lg" />
        </div>
      </div>

      {/* Action navigation */}
      <div className={styles.actionsBar}>
        <Link href={`/${locale}/catalog`}>
          <Button variant="primary" size="lg">
            <ShoppingBag size={18} />
            <span>{locale === 'ru' ? 'Продолжить покупки' : 'Continue Shopping'}</span>
          </Button>
        </Link>
        <Link href={`/${locale}`}>
          <Button variant="secondary" size="lg">
            <span>{locale === 'ru' ? 'На главную' : 'To Home'}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import styles from './cart.module.css';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { useStore } from '@/lib/store';

interface CartViewProps {
  locale: Locale;
}

export const CartView: React.FC<CartViewProps> = ({ locale }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, totalAmount, subtotal, discountTotal } = useStore();

  if (cart.length === 0) {
    return (
      <div className={`container ${styles.cartContainer}`}>
        <div className={styles.emptyCard}>
          <ShoppingBag size={64} className={styles.emptyIcon} />
          <h2>{locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}</h2>
          <p>
            {locale === 'ru'
              ? 'Выберите интересующие товары в каталоге, чтобы оформить заказ с быстрой доставкой.'
              : 'Explore our catalog to add items to your shopping cart with fast express delivery.'}
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

  return (
    <div className={`container ${styles.cartContainer}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className={styles.cartHeading}>
          {locale === 'ru' ? 'Корзина товаров' : 'Shopping Cart'} ({cart.reduce((c, i) => c + i.quantity, 0)})
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 size={16} />
          <span>{locale === 'ru' ? 'Очистить корзину' : 'Clear Cart'}</span>
        </Button>
      </div>

      <div className={styles.cartLayout}>
        {/* Cart items list */}
        <div className={styles.itemsList}>
          {cart.map((item) => {
            const title = item.product.title[locale] || item.product.title.ru;
            return (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.itemImageWrapper}>
                  <img
                    src={item.product.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80'}
                    alt={title}
                    className={styles.itemImage}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <Link href={`/${locale}/product/${item.product.slug}`} className={styles.itemTitle}>
                    {title}
                  </Link>
                  <span className={styles.itemPriceUnit}>
                    <Price amount={item.product.price} locale={locale} size="sm" />
                  </span>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      title={locale === 'ru' ? 'Уменьшить' : 'Decrease'}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyCount}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      title={locale === 'ru' ? 'Увеличить' : 'Increase'}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.product.id)}
                    title={locale === 'ru' ? 'Удалить из корзины' : 'Remove item'}
                  >
                    <Trash2 size={14} />
                    <span>{locale === 'ru' ? 'Удалить' : 'Remove'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>
            {locale === 'ru' ? 'Сумма заказа' : 'Order Summary'}
          </h2>

          <div className={styles.summaryRow}>
            <span>{locale === 'ru' ? 'Промежуточный итог' : 'Subtotal'}</span>
            <Price amount={subtotal} locale={locale} size="sm" />
          </div>

          {discountTotal > 0 && (
            <div className={styles.summaryRow}>
              <span>{locale === 'ru' ? 'Скидка по акциям' : 'Discount'}</span>
              <span className={styles.discountValue}>
                - <Price amount={discountTotal} locale={locale} size="sm" />
              </span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>{locale === 'ru' ? 'Доставка' : 'Delivery'}</span>
            <span>{locale === 'ru' ? 'Рассчитывается далее' : 'Calculated next'}</span>
          </div>

          <div className={styles.summaryTotalRow}>
            <span className={styles.summaryTotalLabel}>
              {locale === 'ru' ? 'К оплате:' : 'Total:'}
            </span>
            <span className={styles.summaryTotalValue}>
              <Price amount={totalAmount} locale={locale} size="lg" />
            </span>
          </div>

          <Link href={`/${locale}/checkout`} style={{ width: '100%' }}>
            <Button variant="primary" size="lg" fullWidth>
              <span>{locale === 'ru' ? 'Перейти к оформлению' : 'Proceed to Checkout'}</span>
              <ArrowRight size={18} />
            </Button>
          </Link>

          <p className={styles.guaranteeNotice}>
            <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent-cyan)' }} />
            {locale === 'ru'
              ? 'Безопасное оформление заказа и официальная гарантия 1 год.'
              : 'Secure checkout and 1 year official warranty.'}
          </p>
        </div>
      </div>
    </div>
  );
};

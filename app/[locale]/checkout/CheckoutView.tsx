'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/i18n';
import styles from './checkout.module.css';
import { useStore, CustomerInfo } from '@/lib/store';
import { Price } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  CreditCard,
  User,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';

interface CheckoutViewProps {
  locale: Locale;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ locale }) => {
  const router = useRouter();
  const { cart, totalAmount, subtotal, discountTotal, createOrder } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ташкент');
  const [address, setAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup' | 'express'>('courier');
  const [paymentMethod, setPaymentMethod] = useState<'test_card' | 'cash'>('test_card');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTestModal, setShowTestModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery costs
  const deliveryFee = deliveryMethod === 'express' ? 50000 : deliveryMethod === 'courier' ? 25000 : 0;
  const finalOrderTotal = totalAmount + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className={`container ${styles.checkoutContainer}`}>
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2>{locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
            {locale === 'ru'
              ? 'Для оформления заказа добавьте товары из каталога.'
              : 'Add products from the catalog to proceed with your order.'}
          </p>
          <Link href={`/${locale}/catalog`}>
            <Button variant="primary" size="md">
              <ArrowLeft size={16} />
              <span>{locale === 'ru' ? 'Вернуться в каталог' : 'Go to Catalog'}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = locale === 'ru' ? 'Укажите ваше имя' : 'Please provide your name';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      errs.phone = locale === 'ru' ? 'Укажите корректный номер телефона' : 'Valid phone number required';
    }
    if (deliveryMethod !== 'pickup' && (!address.trim() || address.trim().length < 5)) {
      errs.address = locale === 'ru' ? 'Укажите полный адрес доставки' : 'Please specify a full delivery address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (paymentMethod === 'test_card') {
      setShowTestModal(true);
    } else {
      executeOrderCreation();
    }
  };

  const executeOrderCreation = () => {
    setIsProcessing(true);
    const customer: CustomerInfo = {
      fullName,
      phone,
      email,
      city,
      address: deliveryMethod === 'pickup' ? 'Самовывоз из шоурума (Ташкент, ул. Амира Темура, 42)' : address,
      deliveryMethod,
      paymentMethod,
      notes,
    };

    setTimeout(() => {
      const order = createOrder(customer);
      setIsProcessing(false);
      setShowTestModal(false);
      router.push(`/${locale}/order/${order.orderNumber}`);
    }, 1200);
  };

  return (
    <div className={`container ${styles.checkoutContainer}`}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href={`/${locale}/cart`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} />
          <span>{locale === 'ru' ? 'Назад в корзину' : 'Back to Cart'}</span>
        </Link>
      </div>

      <h1 className={styles.checkoutHeading}>
        {locale === 'ru' ? 'Оформление заказа' : 'Checkout'}
      </h1>

      <form onSubmit={handleStartCheckout} className={styles.checkoutLayout}>
        {/* Left column: Contact, Delivery, Payment */}
        <div className={styles.formSection}>
          {/* Step 1: Contact info */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>1</span>
              <span>{locale === 'ru' ? 'Контактные данные' : 'Contact Information'}</span>
            </h2>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {locale === 'ru' ? 'Имя и фамилия *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'ru' ? 'Иван Иванов' : 'John Doe'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={styles.input}
                />
                {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {locale === 'ru' ? 'Номер телефона *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.inputGroupFull}>
                <label className={styles.label}>
                  {locale === 'ru' ? 'Электронная почта' : 'Email Address'}
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery method */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>2</span>
              <span>{locale === 'ru' ? 'Способ доставки' : 'Delivery Method'}</span>
            </h2>

            <div className={styles.optionsGrid}>
              <div
                className={`${styles.optionCard} ${deliveryMethod === 'courier' ? styles.optionCardActive : ''}`}
                onClick={() => setDeliveryMethod('courier')}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.radioCircle}>
                    {deliveryMethod === 'courier' && <div className={styles.radioDot} />}
                  </div>
                  <div>
                    <div className={styles.optionLabel}>
                      {locale === 'ru' ? 'Стандартная доставка курьером' : 'Standard Courier'}
                    </div>
                    <div className={styles.optionDesc}>
                      {locale === 'ru' ? 'До двери завтра в течение дня' : 'Next-day delivery to your doorstep'}
                    </div>
                  </div>
                </div>
                <div className={styles.optionPrice}>
                  <Price amount={25000} locale={locale} size="sm" />
                </div>
              </div>

              <div
                className={`${styles.optionCard} ${deliveryMethod === 'express' ? styles.optionCardActive : ''}`}
                onClick={() => setDeliveryMethod('express')}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.radioCircle}>
                    {deliveryMethod === 'express' && <div className={styles.radioDot} />}
                  </div>
                  <div>
                    <div className={styles.optionLabel}>
                      {locale === 'ru' ? 'Срочная экспресс-доставка (2–3 часа)' : 'Express 2-3h Delivery'}
                    </div>
                    <div className={styles.optionDesc}>
                      {locale === 'ru' ? 'Только по Ташкенту, в течение 3 часов' : 'Available in Tashkent within 3 hours'}
                    </div>
                  </div>
                </div>
                <div className={styles.optionPrice}>
                  <Price amount={50000} locale={locale} size="sm" />
                </div>
              </div>

              <div
                className={`${styles.optionCard} ${deliveryMethod === 'pickup' ? styles.optionCardActive : ''}`}
                onClick={() => setDeliveryMethod('pickup')}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.radioCircle}>
                    {deliveryMethod === 'pickup' && <div className={styles.radioDot} />}
                  </div>
                  <div>
                    <div className={styles.optionLabel}>
                      {locale === 'ru' ? 'Самовывоз из флагманского магазина' : 'Showroom Pickup'}
                    </div>
                    <div className={styles.optionDesc}>
                      {locale === 'ru' ? 'Ташкент, ул. Амира Темура, 42 (Бесплатно)' : 'Tashkent, Amir Temur 42 (Free)'}
                    </div>
                  </div>
                </div>
                <div className={styles.optionPrice} style={{ color: '#4ade80' }}>
                  {locale === 'ru' ? 'Бесплатно' : 'Free'}
                </div>
              </div>
            </div>

            {deliveryMethod !== 'pickup' && (
              <div className={styles.formGrid} style={{ marginTop: '0.5rem' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>{locale === 'ru' ? 'Город' : 'City'}</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={styles.select}
                  >
                    <option value="Ташкент">Ташкент / Tashkent</option>
                    <option value="Самарканд">Самарканд / Samarkand</option>
                    <option value="Бухара">Бухара / Bukhara</option>
                    <option value="Андижан">Андижан / Andijan</option>
                    <option value="Фергана">Фергана / Fergana</option>
                  </select>
                </div>

                <div className={styles.inputGroupFull}>
                  <label className={styles.label}>
                    {locale === 'ru' ? 'Адрес доставки (улица, дом, кв.) *' : 'Delivery Address *'}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'ru' ? 'ул. Шахрисабз, дом 15, кв. 4' : 'Amir Temur St. 15, Apt 4'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.input}
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Payment method */}
          <div className={styles.sectionBlock}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>3</span>
              <span>{locale === 'ru' ? 'Способ оплаты' : 'Payment Method'}</span>
            </h2>

            <div className={styles.optionsGrid}>
              <div
                className={`${styles.optionCard} ${paymentMethod === 'test_card' ? styles.optionCardActive : ''}`}
                onClick={() => setPaymentMethod('test_card')}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.radioCircle}>
                    {paymentMethod === 'test_card' && <div className={styles.radioDot} />}
                  </div>
                  <div>
                    <div className={styles.optionLabel}>
                      {locale === 'ru' ? 'Онлайн-оплата картой (Тестовый режим)' : 'Online Card Payment (Test Mode)'}
                    </div>
                    <div className={styles.optionDesc}>
                      {locale === 'ru' ? 'Uzcard, Humo, Visa, Mastercard (без реальных списаний)' : 'Uzcard, Humo, Visa, Mastercard (simulation)'}
                    </div>
                  </div>
                </div>
                <CreditCard size={20} color="var(--accent-cyan)" />
              </div>

              <div
                className={`${styles.optionCard} ${paymentMethod === 'cash' ? styles.optionCardActive : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className={styles.optionLeft}>
                  <div className={styles.radioCircle}>
                    {paymentMethod === 'cash' && <div className={styles.radioDot} />}
                  </div>
                  <div>
                    <div className={styles.optionLabel}>
                      {locale === 'ru' ? 'Оплата при получении' : 'Cash / Terminal on Delivery'}
                    </div>
                    <div className={styles.optionDesc}>
                      {locale === 'ru' ? 'Наличными или картой курьеру при осмотре' : 'Pay in cash or terminal after inspecting goods'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.inputGroupFull} style={{ marginTop: '0.75rem' }}>
              <label className={styles.label}>{locale === 'ru' ? 'Комментарий к заказу' : 'Order Notes'}</label>
              <textarea
                rows={2}
                placeholder={locale === 'ru' ? 'Код домофона, удобное время звонка...' : 'Intercom code, preferred call time...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>
            {locale === 'ru' ? 'Ваш заказ' : 'Order Items'} ({cart.reduce((c, i) => c + i.quantity, 0)})
          </h2>

          <div className={styles.orderPreviewList}>
            {cart.map((item) => (
              <div key={item.product.id} className={styles.orderPreviewItem}>
                <span className={styles.previewName}>
                  {item.product.title[locale] || item.product.title.ru}
                  <span className={styles.previewQty}>× {item.quantity}</span>
                </span>
                <Price amount={item.product.price * item.quantity} locale={locale} size="sm" />
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>{locale === 'ru' ? 'Товары' : 'Items'}</span>
            <Price amount={subtotal} locale={locale} size="sm" />
          </div>

          {discountTotal > 0 && (
            <div className={styles.summaryRow}>
              <span>{locale === 'ru' ? 'Скидка' : 'Discount'}</span>
              <span style={{ color: '#4ade80' }}>
                - <Price amount={discountTotal} locale={locale} size="sm" />
              </span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>{locale === 'ru' ? 'Доставка' : 'Delivery'}</span>
            <span>{deliveryFee === 0 ? (locale === 'ru' ? 'Бесплатно' : 'Free') : <Price amount={deliveryFee} locale={locale} size="sm" />}</span>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>
              {locale === 'ru' ? 'Итого к оплате:' : 'Total:'}
            </span>
            <span className={styles.totalValue}>
              <Price amount={finalOrderTotal} locale={locale} size="lg" />
            </span>
          </div>

          <div className={styles.testBanner}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>
              {locale === 'ru'
                ? 'Режим симуляции: реальные деньги не списываются.'
                : 'Demo mode: test transactions only.'}
            </span>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isProcessing}>
            <Lock size={18} />
            <span>
              {isProcessing
                ? locale === 'ru'
                  ? 'Оформление заказа...'
                  : 'Processing Order...'
                : locale === 'ru'
                ? 'Подтвердить заказ'
                : 'Confirm & Place Order'}
            </span>
          </Button>
        </div>
      </form>

      {/* Test Payment Modal */}
      {showTestModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {locale === 'ru' ? 'Тестовый платежный шлюз' : 'Test Payment Gateway'}
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.testCardPreview}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.8 }}>VOLT CARD</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>TEST DEMO</span>
              </div>
              <div style={{ fontSize: '1.3rem', letterSpacing: '3px', fontFamily: 'monospace' }}>
                8600 •••• •••• 4242
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.9 }}>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.7rem', display: 'block' }}>CARDHOLDER</span>
                  <span>{fullName.toUpperCase() || 'VALUED CUSTOMER'}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.7rem', display: 'block' }}>EXPIRES</span>
                  <span>12/28</span>
                </div>
              </div>
            </div>

            <div className={styles.testBanner}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>{locale === 'ru' ? 'Предупреждение:' : 'Notice:'}</strong>{' '}
                {locale === 'ru'
                  ? 'Тестовый режим — списание средств не производится. Нажмите кнопку ниже для эмуляции успешной оплаты.'
                  : 'Test mode — no actual charge will be made. Click the button below to emulate payment.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ru' ? 'Сумма списания:' : 'Amount to charge:'}
              </span>
              <Price amount={finalOrderTotal} locale={locale} size="md" />
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isProcessing}
              onClick={executeOrderCreation}
            >
              {isProcessing ? (
                locale === 'ru' ? 'Авторизация платежа...' : 'Authorizing payment...'
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>
                    {locale === 'ru'
                      ? 'Оплатить успешно (Тест)'
                      : 'Simulate Successful Payment'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

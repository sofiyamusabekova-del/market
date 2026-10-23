export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export type Currency = 'UZS' | 'USD' | 'RUB';

// Approximate rates for client-side conversions: 1 USD = 12,800 UZS, 1 USD = 95 RUB (1 RUB = 135 UZS)
export const EXCHANGE_RATES: Record<Currency, number> = {
  UZS: 1,
  USD: 1 / 12800,
  RUB: 1 / 135,
};

export function formatPrice(
  amountInUzs: number,
  locale: Locale = 'ru',
  currency: Currency = 'UZS'
): string {
  const rate = EXCHANGE_RATES[currency] || 1;
  const converted = amountInUzs * rate;

  if (currency === 'USD') {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(converted);
  }

  if (currency === 'RUB') {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(converted);
  }

  // Default UZS
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(amountInUzs);

  return locale === 'ru' ? `${formatted} сум` : `${formatted} UZS`;
}

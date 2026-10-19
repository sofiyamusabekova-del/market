export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';

export function formatPrice(amount: number, locale: Locale = 'ru'): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(amount);
  return locale === 'ru' ? `${formatted} сум` : `${formatted} UZS`;
}

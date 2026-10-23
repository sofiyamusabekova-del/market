import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'VOLT STORE — Премиальный интернет-магазин электроники',
    template: '%s | VOLT STORE',
  },
  description:
    'Флагманские смартфоны, ноутбуки, аудиотехника и бытовая техника с официальной гарантией 1 год и экспресс-доставкой по Ташкенту и всему Узбекистану.',
  keywords: [
    'интернет магазин электроники',
    'купить iPhone в Ташкенте',
    'ноутбуки Ташкент',
    'бытовая техника Узбекистан',
    'VOLT STORE',
    'electronics shop Uzbekistan',
  ],
  openGraph: {
    title: 'VOLT STORE — Премиальная электроника в Узбекистане',
    description: 'Официальная гарантия 1 год, проверенные бренды и экспресс-доставка.',
    url: 'https://voltstore.uz',
    siteName: 'VOLT STORE',
    locale: 'ru_RU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

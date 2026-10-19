import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VoltStore — Премиальный интернет-магазин электроники',
  description: 'Смартфоны, ноутбуки, телевизоры и бытовая техника с официальной гарантией и быстрой доставкой по Узбекистану.',
};

import { StoreProvider } from '@/lib/store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

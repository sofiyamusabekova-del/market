import React from 'react';
import { Locale } from '@/lib/i18n';
import { CartView } from './CartView';

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return <CartView locale={locale} />;
}

import React from 'react';
import { Locale } from '@/lib/i18n';
import { OrderDetailView } from './OrderDetailView';

interface OrderPageProps {
  params: Promise<{ locale: string; orderNumber: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';
  const orderNumber = resolvedParams.orderNumber;

  return <OrderDetailView orderNumber={orderNumber} locale={locale} />;
}

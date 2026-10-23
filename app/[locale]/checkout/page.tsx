import React from 'react';
import { Locale } from '@/lib/i18n';
import { CheckoutView } from './CheckoutView';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return <CheckoutView locale={locale} />;
}

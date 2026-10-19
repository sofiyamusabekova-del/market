import React from 'react';
import { Locale } from '@/lib/i18n';
import CompareClient from './CompareClient';

interface ComparePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ComparePage({ params }: ComparePageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return <CompareClient locale={locale} />;
}

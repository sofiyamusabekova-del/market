import React from 'react';
import { Locale } from '@/lib/i18n';
import FavoritesClient from './FavoritesClient';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  return <FavoritesClient locale={locale} />;
}

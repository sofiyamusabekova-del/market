import React from 'react';
import { Locale } from '@/lib/i18n';
import { AdminView } from './AdminView';
import { getAdminData } from '@/lib/admin-api';

interface AdminPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const resolvedParams = await params;
  const locale: Locale = resolvedParams.locale === 'en' ? 'en' : 'ru';

  const initialData = await getAdminData();

  return <AdminView locale={locale} initialData={initialData} />;
}

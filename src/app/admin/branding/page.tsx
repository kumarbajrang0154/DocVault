import React from 'react';
import { redirect } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAdmin } from '@/lib/authGuard';
import { AdminBrandingClient } from './AdminBrandingClient';

export default async function AdminBrandingPage() {
  try {
    await requireAdmin();
  } catch (_err) {
    redirect('/');
  }

  return (
    <AuthGuard>
      <AdminBrandingClient />
    </AuthGuard>
  );
}

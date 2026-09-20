import React from 'react';
import { redirect } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAdmin } from '@/lib/authGuard';
import { AdminUsersClient } from './AdminUsersClient';

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch (_err) {
    redirect('/');
  }

  return (
    <AuthGuard>
      <AdminUsersClient />
    </AuthGuard>
  );
}

import React from 'react';
import { auth, AUTHORIZED_ADMIN_EMAIL } from '@/auth';
import { AdminLoginView } from '@/components/admin/AdminLoginView';
import { AccessDeniedView } from '@/components/admin/AccessDeniedView';
import { AdminHeaderWrapper } from '@/components/admin/AdminHeaderWrapper';

export const metadata = {
  title: 'Mood Admin Portal',
  description: 'Protected Admin Portal for Mood platform management.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Unauthenticated -> Show Admin Login
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 bg-ambient-gradient">
        <AdminLoginView />
      </div>
    );
  }

  // 2. Authenticated but unauthorized Google account -> Show Access Denied
  const userEmail = session.user.email?.toLowerCase() || '';
  if (userEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 bg-ambient-gradient">
        <AccessDeniedView userEmail={session.user.email} />
      </div>
    );
  }

  // 3. Authorized Admin -> Render Admin Dashboard layout
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <AdminHeaderWrapper session={session}>
        {children}
      </AdminHeaderWrapper>
    </div>
  );
}

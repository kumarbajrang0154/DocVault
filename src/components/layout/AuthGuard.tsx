import React from 'react';
import { auth } from '@/auth';
import { DocVaultLoginView } from './DocVaultLoginView';
import { DocVaultAccessDeniedView } from './DocVaultAccessDeniedView';
import { AppLayout } from './AppLayout';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <DocVaultLoginView />;
  }

  if (!session.user.id) {
    return <DocVaultAccessDeniedView userEmail={session.user.email} />;
  }

  return <AppLayout session={session}>{children}</AppLayout>;
}

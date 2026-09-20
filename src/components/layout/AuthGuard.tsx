import React from 'react';
import { auth } from '@/auth';
import { DocVaultLoginView } from './DocVaultLoginView';
import { RequestPendingView } from './RequestPendingView';
import { RequestRejectedView } from './RequestRejectedView';
import { AppLayout } from './AppLayout';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <DocVaultLoginView />;
  }

  if (session.user.status === 'PENDING') {
    return <RequestPendingView userEmail={session.user.email} />;
  }

  if (session.user.status === 'REJECTED') {
    return <RequestRejectedView userEmail={session.user.email} />;
  }

  return <AppLayout session={session}>{children}</AppLayout>;
}

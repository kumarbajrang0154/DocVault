import React from 'react';
import { auth } from '@/auth';
import { DocVaultLoginView } from './DocVaultLoginView';
import { RequestPendingView } from './RequestPendingView';
import { RequestRejectedView } from './RequestRejectedView';
import { RequestSuspendedView } from './RequestSuspendedView';
import { AppLayout } from './AppLayout';
import { getSiteBrandingAction } from '@/app/actions/branding';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <DocVaultLoginView />;
  }

  // Admins cannot be suspended
  if (session.user.isSuspended && !session.user.isAdmin) {
    return <RequestSuspendedView userEmail={session.user.email} />;
  }

  if (session.user.status === 'PENDING') {
    return <RequestPendingView userEmail={session.user.email} />;
  }

  if (session.user.status === 'REJECTED') {
    return <RequestRejectedView userEmail={session.user.email} />;
  }

  const branding = await getSiteBrandingAction();

  return <AppLayout session={session} branding={branding}>{children}</AppLayout>;
}

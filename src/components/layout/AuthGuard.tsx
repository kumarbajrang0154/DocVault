import React from 'react';
import { auth } from '@/auth';
import { DocVaultLoginView } from './DocVaultLoginView';
import { RequestPendingView } from './RequestPendingView';
import { RequestRejectedView } from './RequestRejectedView';
import { RequestSuspendedView } from './RequestSuspendedView';
import { AppLayout } from './AppLayout';
import { getSiteConfigAction } from '@/app/actions/siteConfig';

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const config = await getSiteConfigAction();

  if (!session?.user) {
    return <DocVaultLoginView config={config} />;
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

  const legacyBranding = {
    siteName: config.branding.siteName,
    logoUrl: config.branding.logoUrl,
    primaryColor: config.theme.primaryColor,
    secondaryColor: config.theme.secondaryColor,
    backgroundColor: config.theme.backgroundColor,
    accentColor: config.theme.accentColor,
    welcomeMessage: config.content.loginSubtext,
    footerText: config.content.footerText,
  };

  return <AppLayout session={session} branding={legacyBranding}>{children}</AppLayout>;
}

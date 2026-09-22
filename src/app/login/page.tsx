import React from 'react';
import { getSiteConfigAction } from '@/app/actions/siteConfig';
import { DocVaultLoginView } from '@/components/layout/DocVaultLoginView';

export default async function LoginPage() {
  const config = await getSiteConfigAction();
  return <DocVaultLoginView config={config} />;
}

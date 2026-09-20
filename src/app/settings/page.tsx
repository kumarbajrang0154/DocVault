import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { SettingsClient } from './SettingsClient';

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsClient />
    </AuthGuard>
  );
}

import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { DocumentUploadClient } from './DocumentUploadClient';

export default function DocumentUploadPage() {
  return (
    <AuthGuard>
      <DocumentUploadClient />
    </AuthGuard>
  );
}

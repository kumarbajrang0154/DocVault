import React from 'react';
import { notFound } from 'next/navigation';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAuth } from '@/lib/authGuard';
import { db } from '@/lib/db';
import { DocumentDetailClient } from './DetailClient';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

async function DocumentDetailContent({ id }: { id: string }) {
  const session = await requireAuth();

  // Strict ownership check: Only return document if it belongs to session user
  const doc = await db.document.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!doc) {
    notFound();
  }

  const serializableDoc = {
    ...doc,
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };

  return <DocumentDetailClient document={serializableDoc} />;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;

  return (
    <AuthGuard>
      <DocumentDetailContent id={id} />
    </AuthGuard>
  );
}

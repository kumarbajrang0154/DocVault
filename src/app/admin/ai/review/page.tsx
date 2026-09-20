'use me';
'use server';

import React from 'react';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { AIReviewClient } from './AIReviewClient';

export default async function AIReviewQueuePage() {
  await requireAdmin();

  const [discoveryItems, importRecords, languages, categories] = await Promise.all([
    db.aIDiscoveryItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
    }),
    db.aIImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    db.language.findMany({ where: { isActive: true } }),
    db.category.findMany({ where: { isActive: true } }),
  ]);

  return (
    <AIReviewClient
      discoveryItems={discoveryItems.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
      }))}
      importRecords={importRecords.map((rec) => ({
        ...rec,
        createdAt: rec.createdAt.toISOString(),
        updatedAt: rec.updatedAt.toISOString(),
        reviewedAt: rec.reviewedAt ? rec.reviewedAt.toISOString() : null,
      }))}
      languages={languages.map((l) => ({ id: l.id, name: l.name }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

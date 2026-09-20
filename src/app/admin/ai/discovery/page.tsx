'use me';
'use server';

import React from 'react';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { AIDiscoveryClient } from './AIDiscoveryClient';

export default async function AIDiscoveryPage() {
  await requireAdmin();

  const [discoveryItems, languages, categories] = await Promise.all([
    db.aIDiscoveryItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    db.language.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
  ]);

  return (
    <AIDiscoveryClient
      initialItems={discoveryItems.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
      }))}
      languages={languages.map((l) => ({ id: l.id, name: l.name, code: l.code }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

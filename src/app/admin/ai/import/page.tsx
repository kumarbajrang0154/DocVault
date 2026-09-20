'use me';
'use server';

import React from 'react';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { AIImportClient } from './AIImportClient';

export default async function AIImportPage() {
  await requireAdmin();

  const [languages, categories] = await Promise.all([
    db.language.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
  ]);

  return (
    <AIImportClient
      languages={languages.map((l) => ({ id: l.id, name: l.name, code: l.code }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

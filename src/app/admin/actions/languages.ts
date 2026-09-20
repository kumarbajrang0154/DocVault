'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getLanguages(params?: { search?: string; page?: number; limit?: number }) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.language.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { songs: true },
        },
      },
    }),
    db.language.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createLanguage(data: { name: string; code: string; displayOrder?: number }) {
  await requireAdmin();
  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();

  if (!name || !code) {
    throw new Error('Name and code are required.');
  }

  const existing = await db.language.findFirst({
    where: {
      OR: [{ name }, { code }],
    },
  });

  if (existing) {
    throw new Error('A language with this name or code already exists.');
  }

  const language = await db.language.create({
    data: {
      name,
      code,
      displayOrder: Number(data.displayOrder) || 0,
      isActive: true,
    },
  });

  await logAdminAction('LANGUAGE_CREATED', 'Language', language.id, { name, code });
  return language;
}

export async function updateLanguage(
  id: string,
  data: { name: string; code: string; displayOrder?: number; isActive?: boolean }
) {
  await requireAdmin();
  const name = data.name.trim();
  const code = data.code.trim().toLowerCase();

  const language = await db.language.update({
    where: { id },
    data: {
      name,
      code,
      displayOrder: Number(data.displayOrder) || 0,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    },
  });

  await logAdminAction('LANGUAGE_UPDATED', 'Language', id, { name, code });
  return language;
}

export async function toggleLanguageStatus(id: string, isActive: boolean) {
  await requireAdmin();
  const language = await db.language.update({
    where: { id },
    data: { isActive },
  });

  await logAdminAction(isActive ? 'LANGUAGE_ENABLED' : 'LANGUAGE_DISABLED', 'Language', id);
  return language;
}

export async function deleteLanguage(id: string) {
  await requireAdmin();

  // Check relationship safety
  const songCount = await db.song.count({
    where: { languageId: id },
  });

  if (songCount > 0) {
    throw new Error(`Cannot delete language: it is currently assigned to ${songCount} song(s). Disable it instead.`);
  }

  const deleted = await db.language.delete({
    where: { id },
  });

  await logAdminAction('LANGUAGE_DELETED', 'Language', id, { name: deleted.name });
  return deleted;
}

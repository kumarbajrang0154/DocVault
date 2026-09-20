'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getCategories(params?: { search?: string; page?: number; limit?: number }) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { slug: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      skip,
      take: limit,
      include: {
        theme: true,
        _count: {
          select: { songCategories: true },
        },
      },
    }),
    db.category.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  themeId?: string;
}) {
  await requireAdmin();
  const name = data.name.trim();
  const slug = (data.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

  if (!name || !slug) {
    throw new Error('Name and slug are required.');
  }

  const existing = await db.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existing) {
    throw new Error('A category with this name or slug already exists.');
  }

  const category = await db.category.create({
    data: {
      name,
      slug,
      description: data.description?.trim() || null,
      icon: data.icon?.trim() || 'Music',
      displayOrder: Number(data.displayOrder) || 0,
      themeId: data.themeId || null,
      isActive: true,
    },
  });

  await logAdminAction('CATEGORY_CREATED', 'Category', category.id, { name, slug });
  return category;
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
    themeId?: string;
    isActive?: boolean;
  }
) {
  await requireAdmin();
  const name = data.name.trim();
  const slug = (data.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

  const category = await db.category.update({
    where: { id },
    data: {
      name,
      slug,
      description: data.description?.trim() || null,
      icon: data.icon?.trim() || 'Music',
      displayOrder: Number(data.displayOrder) || 0,
      themeId: data.themeId || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    },
  });

  await logAdminAction('CATEGORY_UPDATED', 'Category', id, { name, slug });
  return category;
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  await requireAdmin();
  const category = await db.category.update({
    where: { id },
    data: { isActive },
  });

  await logAdminAction(isActive ? 'CATEGORY_ENABLED' : 'CATEGORY_DISABLED', 'Category', id);
  return category;
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const songCount = await db.songCategory.count({
    where: { categoryId: id },
  });

  if (songCount > 0) {
    throw new Error(`Cannot delete category: it is associated with ${songCount} song(s). Disable it instead.`);
  }

  const deleted = await db.category.delete({
    where: { id },
  });

  await logAdminAction('CATEGORY_DELETED', 'Category', id, { name: deleted.name });
  return deleted;
}

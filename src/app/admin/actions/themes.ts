'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export interface ThemeInput {
  name: string;
  background: string;
  backgroundImage?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  cardStyle?: string | null;
  buttonStyle?: string | null;
  playerStyle?: string | null;
  animationPreset?: string | null;
}

export async function getThemes() {
  await requireAdmin();
  return db.theme.findMany({
    orderBy: { name: 'asc' },
    include: {
      categories: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function createTheme(data: ThemeInput) {
  await requireAdmin();
  const name = data.name.trim();

  if (!name) {
    throw new Error('Theme name is required.');
  }

  const existing = await db.theme.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error('A theme with this name already exists.');
  }

  const theme = await db.theme.create({
    data: {
      name,
      background: data.background.trim() || '#09090b',
      backgroundImage: data.backgroundImage?.trim() || null,
      primaryColor: data.primaryColor.trim() || '#f43f5e',
      secondaryColor: data.secondaryColor.trim() || '#a855f7',
      accentColor: data.accentColor.trim() || '#06b6d4',
      textColor: data.textColor.trim() || '#ffffff',
      cardStyle: data.cardStyle?.trim() || 'bg-zinc-900/60 border-white/10',
      buttonStyle: data.buttonStyle?.trim() || 'bg-rose-500 hover:bg-rose-600 text-white',
      playerStyle: data.playerStyle?.trim() || 'from-rose-500/20 via-purple-600/20 to-cyan-500/20',
      animationPreset: data.animationPreset?.trim() || 'pulse',
    },
  });

  await logAdminAction('THEME_CREATED', 'Theme', theme.id, { name });
  return theme;
}

export async function updateTheme(id: string, data: ThemeInput) {
  await requireAdmin();
  const name = data.name.trim();

  const theme = await db.theme.update({
    where: { id },
    data: {
      name,
      background: data.background.trim() || '#09090b',
      backgroundImage: data.backgroundImage?.trim() || null,
      primaryColor: data.primaryColor.trim() || '#f43f5e',
      secondaryColor: data.secondaryColor.trim() || '#a855f7',
      accentColor: data.accentColor.trim() || '#06b6d4',
      textColor: data.textColor.trim() || '#ffffff',
      cardStyle: data.cardStyle?.trim() || 'bg-zinc-900/60 border-white/10',
      buttonStyle: data.buttonStyle?.trim() || 'bg-rose-500 hover:bg-rose-600 text-white',
      playerStyle: data.playerStyle?.trim() || 'from-rose-500/20 via-purple-600/20 to-cyan-500/20',
      animationPreset: data.animationPreset?.trim() || 'pulse',
    },
  });

  await logAdminAction('THEME_UPDATED', 'Theme', id, { name });
  return theme;
}

export async function deleteTheme(id: string) {
  await requireAdmin();

  const categoryCount = await db.category.count({
    where: { themeId: id },
  });

  if (categoryCount > 0) {
    throw new Error(`Cannot delete theme: attached to ${categoryCount} category/mood(s). Reassign those categories first.`);
  }

  const deleted = await db.theme.delete({
    where: { id },
  });

  await logAdminAction('THEME_DELETED', 'Theme', id, { name: deleted.name });
  return deleted;
}

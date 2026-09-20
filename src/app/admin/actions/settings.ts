'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getSettings() {
  await requireAdmin();
  const settings = await db.siteSettings.findMany();
  const result: Record<string, string> = {
    appName: 'Mood',
    appDescription: 'Choose your language. Choose your mood. Feel the music.',
    defaultLanguage: 'Hindi',
    defaultCategory: 'Romantic',
    pwaThemeColor: '#09090b',
  };

  for (const s of settings) {
    result[s.key] = s.value;
  }

  return result;
}

export async function updateSettings(settings: Record<string, string>) {
  await requireAdmin();

  for (const [key, value] of Object.entries(settings)) {
    if (typeof value === 'string') {
      await db.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }

  await logAdminAction('SETTINGS_UPDATED', 'SiteSettings', 'global', settings);
  return getSettings();
}

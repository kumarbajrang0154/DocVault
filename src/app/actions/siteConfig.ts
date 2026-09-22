'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { logActivity } from '@/lib/activityLog';
import {
  SiteConfigData,
  SiteBrandingConfig,
  SiteThemeConfig,
  SiteContentConfig,
  SiteLoginLayoutConfig,
  DEFAULT_SITE_CONFIG,
} from '@/lib/siteConfigTypes';

export async function getSiteConfigAction(): Promise<SiteConfigData> {
  try {
    const record = await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    });

    if (!record) {
      const created = await db.siteConfig.create({
        data: {
          id: 'singleton',
          branding: DEFAULT_SITE_CONFIG.branding as any,
          theme: DEFAULT_SITE_CONFIG.theme as any,
          content: DEFAULT_SITE_CONFIG.content as any,
          loginLayout: DEFAULT_SITE_CONFIG.loginLayout as any,
        },
      });

      return {
        id: created.id,
        branding: (created.branding as unknown as SiteBrandingConfig) || DEFAULT_SITE_CONFIG.branding,
        theme: (created.theme as unknown as SiteThemeConfig) || DEFAULT_SITE_CONFIG.theme,
        content: (created.content as unknown as SiteContentConfig) || DEFAULT_SITE_CONFIG.content,
        loginLayout: (created.loginLayout as unknown as SiteLoginLayoutConfig) || DEFAULT_SITE_CONFIG.loginLayout,
        updatedBy: created.updatedBy,
        updatedAt: created.updatedAt,
      };
    }

    return {
      id: record.id,
      branding: (record.branding as unknown as SiteBrandingConfig) || DEFAULT_SITE_CONFIG.branding,
      theme: (record.theme as unknown as SiteThemeConfig) || DEFAULT_SITE_CONFIG.theme,
      content: (record.content as unknown as SiteContentConfig) || DEFAULT_SITE_CONFIG.content,
      loginLayout: (record.loginLayout as unknown as SiteLoginLayoutConfig) || DEFAULT_SITE_CONFIG.loginLayout,
      updatedBy: record.updatedBy,
      updatedAt: record.updatedAt,
    };
  } catch (_err) {
    console.warn('[SiteConfig] DB query failed, using fallback DEFAULT_SITE_CONFIG.');
    return DEFAULT_SITE_CONFIG;
  }
}

export async function updateSiteConfigAction(data: {
  branding: SiteBrandingConfig;
  theme: SiteThemeConfig;
  content: SiteContentConfig;
  loginLayout: SiteLoginLayoutConfig;
}) {
  try {
    const session = await requireAdmin();
    const adminId = session.user.id;

    const previous = await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    });

    const updated = await db.siteConfig.upsert({
      where: { id: 'singleton' },
      update: {
        branding: data.branding as any,
        theme: data.theme as any,
        content: data.content as any,
        loginLayout: data.loginLayout as any,
        updatedBy: adminId,
      },
      create: {
        id: 'singleton',
        branding: data.branding as any,
        theme: data.theme as any,
        content: data.content as any,
        loginLayout: data.loginLayout as any,
        updatedBy: adminId,
      },
    });

    await db.siteBranding.upsert({
      where: { id: 'singleton' },
      update: {
        siteName: data.branding.siteName,
        logoUrl: data.branding.logoUrl || null,
        primaryColor: data.theme.primaryColor,
        secondaryColor: data.theme.secondaryColor,
        backgroundColor: data.theme.backgroundColor,
        accentColor: data.theme.accentColor,
        welcomeMessage: data.content.loginSubtext,
        footerText: data.content.footerText,
      },
      create: {
        id: 'singleton',
        siteName: data.branding.siteName,
        logoUrl: data.branding.logoUrl || null,
        primaryColor: data.theme.primaryColor,
        secondaryColor: data.theme.secondaryColor,
        backgroundColor: data.theme.backgroundColor,
        accentColor: data.theme.accentColor,
        welcomeMessage: data.content.loginSubtext,
        footerText: data.content.footerText,
      },
    });

    await logActivity('SITE_CONFIG_UPDATED', 'SiteConfig', 'singleton', {
      adminId,
      oldValue: previous ? previous : null,
      newValue: {
        branding: data.branding,
        theme: data.theme,
        content: data.content,
        loginLayout: data.loginLayout,
      },
      timestamp: new Date().toISOString(),
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/branding');
    revalidatePath('/login');

    return {
      success: true,
      config: {
        id: updated.id,
        branding: updated.branding as unknown as SiteBrandingConfig,
        theme: updated.theme as unknown as SiteThemeConfig,
        content: updated.content as unknown as SiteContentConfig,
        loginLayout: updated.loginLayout as unknown as SiteLoginLayoutConfig,
        updatedBy: updated.updatedBy,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update site configuration';
    return { success: false, error: message };
  }
}

export async function revertSiteConfigAction() {
  try {
    const session = await requireAdmin();
    const adminId = session.user.id;

    const logs = await db.activityLog.findMany({
      where: {
        entityType: 'SiteConfig',
        action: 'SITE_CONFIG_UPDATED',
      },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (logs.length === 0 || !logs[0].details) {
      return { success: false, error: 'No previous site configuration history found to revert.' };
    }

    let targetSnapshot: any = null;

    try {
      const details = JSON.parse(logs[0].details);
      if (details.oldValue) {
        targetSnapshot = details.oldValue;
      } else if (logs.length > 1 && logs[1].details) {
        const prevDetails = JSON.parse(logs[1].details);
        targetSnapshot = prevDetails.newValue;
      }
    } catch (_err) {
      // Fallback
    }

    if (!targetSnapshot) {
      targetSnapshot = DEFAULT_SITE_CONFIG;
    }

    const restored = await db.siteConfig.upsert({
      where: { id: 'singleton' },
      update: {
        branding: targetSnapshot.branding || DEFAULT_SITE_CONFIG.branding,
        theme: targetSnapshot.theme || DEFAULT_SITE_CONFIG.theme,
        content: targetSnapshot.content || DEFAULT_SITE_CONFIG.content,
        loginLayout: targetSnapshot.loginLayout || DEFAULT_SITE_CONFIG.loginLayout,
        updatedBy: adminId,
      },
      create: {
        id: 'singleton',
        branding: targetSnapshot.branding || DEFAULT_SITE_CONFIG.branding,
        theme: targetSnapshot.theme || DEFAULT_SITE_CONFIG.theme,
        content: targetSnapshot.content || DEFAULT_SITE_CONFIG.content,
        loginLayout: targetSnapshot.loginLayout || DEFAULT_SITE_CONFIG.loginLayout,
        updatedBy: adminId,
      },
    });

    await logActivity('SITE_CONFIG_REVERTED', 'SiteConfig', 'singleton', {
      adminId,
      revertedToTimestamp: restored.updatedAt.toISOString(),
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/branding');

    return {
      success: true,
      config: {
        id: restored.id,
        branding: restored.branding as unknown as SiteBrandingConfig,
        theme: restored.theme as unknown as SiteThemeConfig,
        content: restored.content as unknown as SiteContentConfig,
        loginLayout: restored.loginLayout as unknown as SiteLoginLayoutConfig,
        updatedBy: restored.updatedBy,
        updatedAt: restored.updatedAt,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revert site configuration';
    return { success: false, error: message };
  }
}

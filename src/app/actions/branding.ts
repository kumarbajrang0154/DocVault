'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/authGuard';
import { logActivity } from '@/lib/activityLog';
import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
}

const DEFAULT_BRANDING = {
  id: 'singleton',
  siteName: 'DocVault',
  tagline: 'Secure Personal Document Vault with Expiry Reminders',
  logoUrl: null,
  faviconEmoji: '🔒',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#09090b',
  accentColor: '#22d3ee',
  welcomeMessage: 'Secure personal document manager with server-side encryption and expiry warnings.',
  footerText: 'DocVault Personal Vault • End-to-End Encrypted',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function getSiteBrandingAction() {
  try {
    let branding = await db.siteBranding.findUnique({
      where: { id: 'singleton' },
    });

    if (!branding) {
      branding = await db.siteBranding.create({
        data: {
          id: 'singleton',
          siteName: DEFAULT_BRANDING.siteName,
          tagline: DEFAULT_BRANDING.tagline,
          faviconEmoji: DEFAULT_BRANDING.faviconEmoji,
          primaryColor: DEFAULT_BRANDING.primaryColor,
          secondaryColor: DEFAULT_BRANDING.secondaryColor,
          backgroundColor: DEFAULT_BRANDING.backgroundColor,
          accentColor: DEFAULT_BRANDING.accentColor,
          welcomeMessage: DEFAULT_BRANDING.welcomeMessage,
          footerText: DEFAULT_BRANDING.footerText,
        },
      });
    }

    return branding;
  } catch (_err) {
    console.warn('[Branding] DB query failed, using fallback branding values.');
    return DEFAULT_BRANDING;
  }
}

export async function updateSiteBrandingAction(data: {
  siteName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconEmoji?: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  welcomeMessage?: string | null;
  footerText?: string | null;
}) {
  await requireAdmin();

  try {
    const updated = await db.siteBranding.upsert({
      where: { id: 'singleton' },
      update: {
        siteName: data.siteName.trim(),
        tagline: data.tagline?.trim() || null,
        logoUrl: data.logoUrl || null,
        faviconEmoji: data.faviconEmoji?.trim() || '🔒',
        primaryColor: data.primaryColor || '#6366f1',
        secondaryColor: data.secondaryColor || '#8b5cf6',
        backgroundColor: data.backgroundColor || '#09090b',
        accentColor: data.accentColor || '#22d3ee',
        welcomeMessage: data.welcomeMessage?.trim() || null,
        footerText: data.footerText?.trim() || null,
      },
      create: {
        id: 'singleton',
        siteName: data.siteName.trim(),
        tagline: data.tagline?.trim() || null,
        logoUrl: data.logoUrl || null,
        faviconEmoji: data.faviconEmoji?.trim() || '🔒',
        primaryColor: data.primaryColor || '#6366f1',
        secondaryColor: data.secondaryColor || '#8b5cf6',
        backgroundColor: data.backgroundColor || '#09090b',
        accentColor: data.accentColor || '#22d3ee',
        welcomeMessage: data.welcomeMessage?.trim() || null,
        footerText: data.footerText?.trim() || null,
      },
    });

    await logActivity('BRANDING_UPDATED', 'SiteBranding', 'singleton', {
      siteName: updated.siteName,
      primaryColor: updated.primaryColor,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/branding');

    return { success: true, branding: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update branding';
    return { success: false, error: message };
  }
}

export async function uploadLogoAction(formData: FormData) {
  await requireAdmin();
  configureCloudinary();

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: 'Please select a logo image to upload.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'docvault/branding',
          resource_type: 'image',
          type: 'upload', // Public image asset for site logo
        },
        (error, res) => {
          if (error || !res) {
            return reject(new Error(error?.message || 'Logo upload failed'));
          }
          resolve(res);
        }
      );
      uploadStream.end(buffer);
    });

    return { success: true, logoUrl: result.secure_url };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logo upload failed';
    return { success: false, error: message };
  }
}

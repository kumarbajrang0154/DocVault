'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/authGuard';
import { encryptBuffer } from '@/lib/encryption';
import { uploadDocumentToCloudinary, deleteDocumentFromCloudinary } from '@/lib/cloudinary';
import { logActivity } from '@/lib/activityLog';

export async function uploadDocumentAction(formData: FormData) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string)?.trim();
    const category = (formData.get('category') as string)?.trim();
    const rawTags = (formData.get('tags') as string)?.trim() || '';
    const notes = (formData.get('notes') as string)?.trim() || null;
    const expiryDateRaw = formData.get('expiryDate') as string | null;

    if (!file || file.size === 0) {
      return { success: false, error: 'Please select a document file to upload.' };
    }

    if (!title) {
      return { success: false, error: 'Document title is required.' };
    }

    if (!category) {
      return { success: false, error: 'Category selection is required.' };
    }

    const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
    if (file.size > MAX_SIZE_BYTES) {
      return { success: false, error: 'File size exceeds the 15MB limit.' };
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        success: false,
        error: 'Invalid file type. Only PDF documents and standard images are allowed.',
      };
    }

    const tags = rawTags
      ? rawTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const expiryDate = expiryDateRaw ? new Date(expiryDateRaw) : null;

    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 1. Encrypt buffer server-side (AES-256-GCM)
    const encryptedBuffer = encryptBuffer(rawBuffer);

    // 2. Upload to Cloudinary authenticated private storage (folder docvault/${userId})
    const { fileKey } = await uploadDocumentToCloudinary(
      encryptedBuffer,
      file.name,
      file.type,
      userId
    );

    // 3. Save Document metadata in PostgreSQL database tied to userId
    const document = await db.document.create({
      data: {
        userId,
        title,
        category,
        tags,
        notes,
        fileKey,
        fileType: file.type,
        expiryDate,
        reminderSent: false,
      },
    });

    // 4. Log Activity
    await logActivity('DOCUMENT_UPLOADED', 'Document', document.id, {
      title,
      category,
      fileName: file.name,
      fileSize: file.size,
    });

    revalidatePath('/documents');
    revalidatePath('/');

    return { success: true, documentId: document.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown upload error';
    await logActivity('DOCUMENT_UPLOAD_FAILED', 'Document', undefined, { error: message }, 'FAILURE');
    console.error('Document upload failed:', error);
    return { success: false, error: message };
  }
}

export async function updateDocumentAction(
  id: string,
  data: {
    title: string;
    category: string;
    tags: string[];
    notes?: string | null;
    expiryDate?: string | null;
  }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Strict ownership check: document must exist and belong to session user
    const doc = await db.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' };
    }

    const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    const updated = await db.document.update({
      where: { id },
      data: {
        title: data.title.trim(),
        category: data.category.trim(),
        tags: data.tags.map((t) => t.trim()).filter(Boolean),
        notes: data.notes?.trim() || null,
        expiryDate,
        ...(doc.expiryDate?.toISOString() !== expiryDate?.toISOString()
          ? { reminderSent: false }
          : {}),
      },
    });

    await logActivity('DOCUMENT_UPDATED', 'Document', id, {
      title: updated.title,
      category: updated.category,
    });

    revalidatePath('/documents');
    revalidatePath(`/documents/${id}`);
    revalidatePath('/');

    return { success: true, document: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown update error';
    await logActivity('DOCUMENT_UPDATE_FAILED', 'Document', id, { error: message }, 'FAILURE');
    return { success: false, error: message };
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Strict ownership check
    const doc = await db.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return { success: false, error: 'Document not found or access denied.' };
    }

    // 1. Delete file from Cloudinary private storage
    await deleteDocumentFromCloudinary(doc.fileKey);

    // 2. Delete document from Database
    await db.document.delete({ where: { id } });

    // 3. Log Activity
    await logActivity('DOCUMENT_DELETED', 'Document', id, {
      title: doc.title,
      category: doc.category,
    });

    revalidatePath('/documents');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown deletion error';
    await logActivity('DOCUMENT_DELETE_FAILED', 'Document', id, { error: message }, 'FAILURE');
    return { success: false, error: message };
  }
}

export async function updateUserSettingsAction(reminderThresholds: number[]) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const settings = await db.userSettings.upsert({
      where: { userId },
      update: { reminderThresholds },
      create: {
        userId,
        reminderThresholds,
      },
    });

    await logActivity('SETTINGS_UPDATED', 'UserSettings', settings.id, {
      reminderThresholds,
    });

    revalidatePath('/settings');
    return { success: true, reminderThresholds: settings.reminderThresholds };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    await logActivity('SETTINGS_UPDATE_FAILED', 'UserSettings', undefined, { error: message }, 'FAILURE');
    return { success: false, error: message };
  }
}

export async function getUserSettingsAction() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const settings = await db.userSettings.findUnique({ where: { userId } });
    return {
      success: true,
      reminderThresholds: settings?.reminderThresholds || [30, 60, 90],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return {
      success: false,
      error: message,
      reminderThresholds: [30, 60, 90],
    };
  }
}

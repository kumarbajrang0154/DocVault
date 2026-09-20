'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export interface GetSongsParams {
  search?: string;
  languageId?: string;
  categoryId?: string;
  artistId?: string;
  albumId?: string;
  isPublished?: boolean;
  isDownloadable?: boolean;
  page?: number;
  limit?: number;
}

export async function getSongs(params?: GetSongsParams) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (params?.languageId) where.languageId = params.languageId;
  if (params?.artistId) where.artistId = params.artistId;
  if (params?.albumId) where.albumId = params.albumId;
  if (params?.isPublished !== undefined) where.isPublished = params.isPublished;
  if (params?.isDownloadable !== undefined) where.isDownloadable = params.isDownloadable;

  if (params?.categoryId) {
    where.categories = {
      some: {
        categoryId: params.categoryId,
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { artist: { name: { contains: search } } },
      { album: { title: { contains: search } } },
    ];
  }

  const [items, total] = await Promise.all([
    db.song.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true, coverImageUrl: true } },
        language: { select: { id: true, name: true, code: true } },
        categories: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    db.song.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export interface SongFormData {
  title: string;
  artistId: string;
  albumId?: string;
  languageId: string;
  sourceUrl?: string;
  streamUrl?: string;
  downloadUrl?: string;
  audioUrl?: string;
  coverImageUrl?: string;
  duration?: number;
  description?: string;
  isDownloadable?: boolean;
  isPublished?: boolean;
  categoryIds: string[];
}

export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  return lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('m.youtube.com');
}

function validateOptionalUrl(
  url?: string | null,
  fieldName: string = 'URL',
  options?: { rejectYouTube?: boolean }
) {
  if (!url || !url.trim()) return;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`${fieldName} must start with http:// or https://`);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('must start with')) {
      throw err;
    }
    throw new Error(`Invalid ${fieldName} format.`);
  }

  if (options?.rejectYouTube && isYouTubeUrl(trimmed)) {
    throw new Error(
      `${fieldName} cannot be a YouTube link. Paste a direct audio file URL (e.g. ending in .mp3/.m4a) from your own authorized storage.`
    );
  }
}

export async function createSong(data: SongFormData) {
  await requireAdmin();
  const title = data.title.trim();
  const artistId = data.artistId.trim();
  const languageId = data.languageId.trim();

  if (!title || !artistId || !languageId) {
    throw new Error('Title, Artist, and Language are required.');
  }

  const sourceUrl = data.sourceUrl?.trim() || null;
  const streamUrl = data.streamUrl?.trim() || null;
  const downloadUrl = data.downloadUrl?.trim() || null;
  const legacyAudioUrl = data.audioUrl?.trim() || streamUrl || sourceUrl || null;

  validateOptionalUrl(sourceUrl, 'Source URL');
  validateOptionalUrl(streamUrl, 'Authorized Stream URL', { rejectYouTube: true });
  validateOptionalUrl(downloadUrl, 'Authorized Download URL', { rejectYouTube: true });

  const song = await db.song.create({
    data: {
      title,
      artistId,
      albumId: data.albumId?.trim() || null,
      languageId,
      sourceUrl,
      streamUrl,
      downloadUrl,
      audioUrl: legacyAudioUrl,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      duration: Number(data.duration) || 0,
      description: data.description?.trim() || null,
      isDownloadable: data.isDownloadable && Boolean(downloadUrl),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      categories: {
        create: (data.categoryIds || []).map((catId) => ({
          categoryId: catId,
        })),
      },
    },
    include: {
      artist: { select: { name: true } },
    },
  });

  await logAdminAction('SONG_CREATED', 'Song', song.id, { title, artist: song.artist.name });
  return song;
}

export async function updateSong(id: string, data: SongFormData) {
  await requireAdmin();
  const title = data.title.trim();
  const artistId = data.artistId.trim();
  const languageId = data.languageId.trim();

  if (!title || !artistId || !languageId) {
    throw new Error('Title, Artist, and Language are required.');
  }

  const sourceUrl = data.sourceUrl?.trim() || null;
  const streamUrl = data.streamUrl?.trim() || null;
  const downloadUrl = data.downloadUrl?.trim() || null;
  const legacyAudioUrl = data.audioUrl?.trim() || streamUrl || sourceUrl || null;

  validateOptionalUrl(sourceUrl, 'Source URL');
  validateOptionalUrl(streamUrl, 'Authorized Stream URL', { rejectYouTube: true });
  validateOptionalUrl(downloadUrl, 'Authorized Download URL', { rejectYouTube: true });

  // Re-link categories
  await db.songCategory.deleteMany({
    where: { songId: id },
  });

  const song = await db.song.update({
    where: { id },
    data: {
      title,
      artistId,
      albumId: data.albumId?.trim() || null,
      languageId,
      sourceUrl,
      streamUrl,
      downloadUrl,
      audioUrl: legacyAudioUrl,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      duration: Number(data.duration) || 0,
      description: data.description?.trim() || null,
      isDownloadable: Boolean(data.isDownloadable && downloadUrl),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      categories: {
        create: (data.categoryIds || []).map((catId) => ({
          categoryId: catId,
        })),
      },
    },
  });

  await logAdminAction('SONG_UPDATED', 'Song', id, { title });
  return song;
}

export async function toggleSongPublish(id: string, isPublished: boolean) {
  await requireAdmin();
  const song = await db.song.update({
    where: { id },
    data: { isPublished },
  });

  await logAdminAction(isPublished ? 'SONG_PUBLISHED' : 'SONG_UNPUBLISHED', 'Song', id);
  return song;
}

export async function toggleSongDownload(id: string, isDownloadable: boolean) {
  await requireAdmin();
  const song = await db.song.update({
    where: { id },
    data: { isDownloadable },
  });

  await logAdminAction(isDownloadable ? 'SONG_DOWNLOAD_ENABLED' : 'SONG_DOWNLOAD_DISABLED', 'Song', id);
  return song;
}

export async function deleteSong(id: string) {
  await requireAdmin();

  const deleted = await db.song.delete({
    where: { id },
  });

  await logAdminAction('SONG_DELETED', 'Song', id, { title: deleted.title });
  return deleted;
}

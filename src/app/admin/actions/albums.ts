'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getAlbums(params?: { search?: string; artistId?: string; page?: number; limit?: number }) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const artistId = params?.artistId || undefined;
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (artistId) where.artistId = artistId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { artist: { name: { contains: search } } },
    ];
  }

  const [items, total] = await Promise.all([
    db.album.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        artist: { select: { id: true, name: true } },
        _count: { select: { songs: true } },
      },
    }),
    db.album.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createAlbum(data: {
  title: string;
  artistId: string;
  coverImageUrl?: string;
  releaseDate?: string;
  description?: string;
}) {
  await requireAdmin();
  const title = data.title.trim();
  const artistId = data.artistId.trim();

  if (!title || !artistId) {
    throw new Error('Title and artist are required.');
  }

  const album = await db.album.create({
    data: {
      title,
      artistId,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      releaseDate: data.releaseDate?.trim() || null,
      description: data.description?.trim() || null,
    },
    include: {
      artist: { select: { name: true } },
    },
  });

  await logAdminAction('ALBUM_CREATED', 'Album', album.id, { title, artist: album.artist.name });
  return album;
}

export async function updateAlbum(
  id: string,
  data: {
    title: string;
    artistId: string;
    coverImageUrl?: string;
    releaseDate?: string;
    description?: string;
  }
) {
  await requireAdmin();
  const title = data.title.trim();
  const artistId = data.artistId.trim();

  const album = await db.album.update({
    where: { id },
    data: {
      title,
      artistId,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      releaseDate: data.releaseDate?.trim() || null,
      description: data.description?.trim() || null,
    },
  });

  await logAdminAction('ALBUM_UPDATED', 'Album', id, { title });
  return album;
}

export async function deleteAlbum(id: string) {
  await requireAdmin();

  const songCount = await db.song.count({
    where: { albumId: id },
  });

  if (songCount > 0) {
    throw new Error(`Cannot delete album: contains ${songCount} song(s). Delete or reassign the songs first.`);
  }

  const deleted = await db.album.delete({
    where: { id },
  });

  await logAdminAction('ALBUM_DELETED', 'Album', id, { title: deleted.title });
  return deleted;
}

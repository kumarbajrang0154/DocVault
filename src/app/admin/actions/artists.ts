'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getArtists(params?: { search?: string; page?: number; limit?: number }) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.artist.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { songs: true, albums: true },
        },
      },
    }),
    db.artist.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createArtist(data: { name: string; imageUrl?: string; description?: string }) {
  await requireAdmin();
  const name = data.name.trim();

  if (!name) {
    throw new Error('Artist name is required.');
  }

  const existing = await db.artist.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error('An artist with this name already exists.');
  }

  const artist = await db.artist.create({
    data: {
      name,
      imageUrl: data.imageUrl?.trim() || null,
      description: data.description?.trim() || null,
      isActive: true,
    },
  });

  await logAdminAction('ARTIST_CREATED', 'Artist', artist.id, { name });
  return artist;
}

export async function updateArtist(
  id: string,
  data: { name: string; imageUrl?: string; description?: string; isActive?: boolean }
) {
  await requireAdmin();
  const name = data.name.trim();

  const artist = await db.artist.update({
    where: { id },
    data: {
      name,
      imageUrl: data.imageUrl?.trim() || null,
      description: data.description?.trim() || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
    },
  });

  await logAdminAction('ARTIST_UPDATED', 'Artist', id, { name });
  return artist;
}

export async function toggleArtistStatus(id: string, isActive: boolean) {
  await requireAdmin();
  const artist = await db.artist.update({
    where: { id },
    data: { isActive },
  });

  await logAdminAction(isActive ? 'ARTIST_ENABLED' : 'ARTIST_DISABLED', 'Artist', id);
  return artist;
}

export async function deleteArtist(id: string) {
  await requireAdmin();

  const [songCount, albumCount] = await Promise.all([
    db.song.count({ where: { artistId: id } }),
    db.album.count({ where: { artistId: id } }),
  ]);

  if (songCount > 0 || albumCount > 0) {
    throw new Error(
      `Cannot delete artist: assigned to ${songCount} song(s) and ${albumCount} album(s). Disable the artist instead.`
    );
  }

  const deleted = await db.artist.delete({
    where: { id },
  });

  await logAdminAction('ARTIST_DELETED', 'Artist', id, { name: deleted.name });
  return deleted;
}

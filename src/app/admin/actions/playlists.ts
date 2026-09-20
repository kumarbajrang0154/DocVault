'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';

export async function getPlaylists(params?: { search?: string; page?: number; limit?: number }) {
  await requireAdmin();
  const search = params?.search?.trim() || '';
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { slug: { contains: search } },
          { description: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.playlist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        playlistSongs: {
          orderBy: { position: 'asc' },
          include: {
            song: {
              include: {
                artist: { select: { id: true, name: true } },
                language: { select: { name: true } },
              },
            },
          },
        },
        _count: { select: { playlistSongs: true } },
      },
    }),
    db.playlist.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createPlaylist(data: {
  title: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  isPublished?: boolean;
}) {
  await requireAdmin();
  const title = data.title.trim();
  const slug = (data.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

  if (!title || !slug) {
    throw new Error('Title and slug are required.');
  }

  const existing = await db.playlist.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new Error('A playlist with this slug already exists.');
  }

  const playlist = await db.playlist.create({
    data: {
      title,
      slug,
      description: data.description?.trim() || null,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
    },
  });

  await logAdminAction('PLAYLIST_CREATED', 'Playlist', playlist.id, { title, slug });
  return playlist;
}

export async function updatePlaylist(
  id: string,
  data: {
    title: string;
    slug?: string;
    description?: string;
    coverImageUrl?: string;
    isPublished?: boolean;
  }
) {
  await requireAdmin();
  const title = data.title.trim();
  const slug = (data.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

  const playlist = await db.playlist.update({
    where: { id },
    data: {
      title,
      slug,
      description: data.description?.trim() || null,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : undefined,
    },
  });

  await logAdminAction('PLAYLIST_UPDATED', 'Playlist', id, { title, slug });
  return playlist;
}

export async function togglePlaylistPublish(id: string, isPublished: boolean) {
  await requireAdmin();
  const playlist = await db.playlist.update({
    where: { id },
    data: { isPublished },
  });

  await logAdminAction(isPublished ? 'PLAYLIST_PUBLISHED' : 'PLAYLIST_UNPUBLISHED', 'Playlist', id);
  return playlist;
}

export async function deletePlaylist(id: string) {
  await requireAdmin();

  const deleted = await db.playlist.delete({
    where: { id },
  });

  await logAdminAction('PLAYLIST_DELETED', 'Playlist', id, { title: deleted.title });
  return deleted;
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  await requireAdmin();

  const count = await db.playlistSong.count({
    where: { playlistId },
  });

  const entry = await db.playlistSong.create({
    data: {
      playlistId,
      songId,
      position: count + 1,
    },
  });

  await logAdminAction('PLAYLIST_SONG_ADDED', 'Playlist', playlistId, { songId });
  return entry;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  await requireAdmin();

  await db.playlistSong.delete({
    where: {
      playlistId_songId: {
        playlistId,
        songId,
      },
    },
  });

  await logAdminAction('PLAYLIST_SONG_REMOVED', 'Playlist', playlistId, { songId });
}

export async function reorderPlaylistSongs(playlistId: string, songIdsInOrder: string[]) {
  await requireAdmin();

  await db.$transaction(
    songIdsInOrder.map((songId, index) =>
      db.playlistSong.update({
        where: {
          playlistId_songId: {
            playlistId,
            songId,
          },
        },
        data: {
          position: index + 1,
        },
      })
    )
  );

  await logAdminAction('PLAYLIST_SONGS_REORDERED', 'Playlist', playlistId);
}

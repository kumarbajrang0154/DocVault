'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

export async function getDashboardStats() {
  await requireAdmin();

  const [
    totalSongs,
    publishedSongs,
    totalArtists,
    totalAlbums,
    totalPlaylists,
    totalCategories,
    totalLanguages,
    recentActivity,
  ] = await Promise.all([
    db.song.count(),
    db.song.count({ where: { isPublished: true } }),
    db.artist.count(),
    db.album.count(),
    db.playlist.count(),
    db.category.count(),
    db.language.count(),
    db.adminActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  return {
    totalSongs,
    publishedSongs,
    totalArtists,
    totalAlbums,
    totalPlaylists,
    totalCategories,
    totalLanguages,
    recentActivity,
  };
}

export async function getActivityLogs(params?: { page?: number; limit?: number }) {
  await requireAdmin();
  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.adminActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.adminActivityLog.count(),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

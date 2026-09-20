'use me';
'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';
import { logAdminAction } from '@/lib/activityLog';
import { fetchYouTubeMetadata, discoverYouTubeTrendingSongs } from '@/lib/ai/youtube';
import { classifyMusicMetadata } from '@/lib/ai/provider';
import { checkDuplicateSong } from '@/lib/ai/duplicateDetector';
import { AI_CONFIG } from '@/lib/ai/config';
import { revalidatePath } from 'next/cache';

export async function analyzeUrlAction(url: string) {
  await requireAdmin();

  if (!url || !url.trim()) {
    return { success: false, error: 'Please provide a valid music URL.' };
  }

  try {
    const metadata = await fetchYouTubeMetadata(url);
    const classification = await classifyMusicMetadata({
      title: metadata.title,
      channelTitle: metadata.channelTitle,
      description: metadata.description,
      duration: metadata.duration,
    });
    const duplicateResult = await checkDuplicateSong({
      sourceUrl: metadata.sourceUrl,
      title: classification.title,
      artistName: classification.artistName,
      duration: metadata.duration,
    });

    const aiResultJson = JSON.stringify({
      classification,
      duplicateResult,
      metadata,
    });

    const importRecord = await db.aIImport.create({
      data: {
        sourceUrl: metadata.sourceUrl,
        sourcePlatform: metadata.platform,
        sourceMetadata: JSON.stringify(metadata),
        aiResult: aiResultJson,
        status: 'REVIEW',
        confidence: classification.confidence,
      },
    });

    await logAdminAction(
      'AI_IMPORT_ANALYZED',
      'AIImport',
      importRecord.id,
      `Analyzed URL for track '${classification.title}' by '${classification.artistName}' (${classification.confidence}% confidence)`
    );

    revalidatePath('/admin/ai/import');
    revalidatePath('/admin/ai');

    return {
      success: true,
      importRecord,
      metadata,
      classification,
      duplicateResult,
    };
  } catch (err: unknown) {
    const errorMessage = (err as Error).message || 'Failed to analyze URL metadata.';
    
    await db.aIImport.create({
      data: {
        sourceUrl: url,
        sourcePlatform: 'YOUTUBE',
        status: 'FAILED',
        errorMessage,
      },
    });

    return { success: false, error: errorMessage };
  }
}

export async function approveImportAction(
  importId: string,
  editedData: {
    title: string;
    artistName: string;
    albumName?: string;
    languageId: string;
    categoryId: string;
    sourceUrl?: string;
    streamUrl?: string;
    downloadUrl?: string;
    audioUrl?: string;
    coverImageUrl?: string;
    description?: string;
    isDownloadable?: boolean;
  }
) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'kumarbajrang325@gmail.com';

  const importRecord = await db.aIImport.findUnique({
    where: { id: importId },
  });

  if (!importRecord) {
    return { success: false, error: 'Import record not found.' };
  }

  // 1. Resolve or Create Artist
  let artist = await db.artist.findFirst({
    where: { name: { equals: editedData.artistName, mode: 'insensitive' } },
  });

  if (!artist) {
    artist = await db.artist.create({
      data: {
        name: editedData.artistName.trim(),
        description: 'Created via AI Import Assistant',
      },
    });
  }

  // 2. Resolve or Create Album if provided
  let albumId: string | undefined = undefined;
  if (editedData.albumName && editedData.albumName.trim()) {
    let album = await db.album.findFirst({
      where: {
        title: { equals: editedData.albumName.trim(), mode: 'insensitive' },
        artistId: artist.id,
      },
    });

    if (!album) {
      album = await db.album.create({
        data: {
          title: editedData.albumName.trim(),
          artistId: artist.id,
          coverImageUrl: editedData.coverImageUrl || null,
        },
      });
    }
    albumId = album.id;
  }

  const sourceUrl = editedData.sourceUrl?.trim() || importRecord.sourceUrl;
  const streamUrl = editedData.streamUrl?.trim() || null;
  const downloadUrl = editedData.downloadUrl?.trim() || null;

  // 3. Create Song
  const song = await db.song.create({
    data: {
      title: editedData.title.trim(),
      artistId: artist.id,
      albumId: albumId || null,
      languageId: editedData.languageId,
      sourceUrl,
      streamUrl,
      downloadUrl,
      audioUrl: streamUrl || sourceUrl,
      coverImageUrl: editedData.coverImageUrl?.trim() || null,
      description: editedData.description?.trim() || null,
      isDownloadable: Boolean(editedData.isDownloadable && downloadUrl),
      isPublished: true,
      categories: {
        create: {
          categoryId: editedData.categoryId,
        },
      },
    },
  });

  // 4. Update AIImport status
  await db.aIImport.update({
    where: { id: importId },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: adminEmail,
    },
  });

  // 5. Log Activity
  await logAdminAction(
    'AI_IMPORT_APPROVED',
    'Song',
    song.id,
    `Approved AI import and published song '${song.title}'`
  );

  revalidatePath('/admin/songs');
  revalidatePath('/admin/ai');
  revalidatePath('/music');

  return { success: true, songId: song.id };
}

export async function rejectImportAction(importId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'kumarbajrang325@gmail.com';

  await db.aIImport.update({
    where: { id: importId },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: adminEmail,
    },
  });

  await logAdminAction(
    'AI_IMPORT_REJECTED',
    'AIImport',
    importId,
    `Rejected AI import record ${importId}`
  );

  revalidatePath('/admin/ai');
  return { success: true };
}

export async function runDiscoveryAction(searchQuery: string = 'new music 2026') {
  await requireAdmin();

  try {
    const candidates = await discoverYouTubeTrendingSongs(searchQuery);

    if (candidates.length === 0) {
      return { success: true, count: 0, message: 'No new candidate releases found.' };
    }

    let createdCount = 0;

    for (const candidate of candidates) {
      const existing = await db.aIDiscoveryItem.findUnique({
        where: { sourceUrl: candidate.sourceUrl },
      });

      if (existing) continue;

      const classification = await classifyMusicMetadata({
        title: candidate.title,
        channelTitle: candidate.channelTitle,
        description: candidate.description,
      });

      const duplicateResult = await checkDuplicateSong({
        sourceUrl: candidate.sourceUrl,
        title: classification.title,
        artistName: classification.artistName,
      });

      await db.aIDiscoveryItem.create({
        data: {
          sourceUrl: candidate.sourceUrl,
          sourcePlatform: candidate.platform,
          title: classification.title,
          artistName: classification.artistName,
          albumName: classification.albumName || null,
          thumbnailUrl: candidate.thumbnailUrl,
          duration: candidate.duration,
          publishedAt: candidate.publishedAt ? new Date(candidate.publishedAt) : null,
          rawMetadata: JSON.stringify(candidate),
          aiAnalysis: JSON.stringify(classification),
          languageId: classification.languageId,
          categoryId: classification.categoryId,
          confidence: classification.confidence,
          duplicateStatus: duplicateResult.duplicateStatus,
          status: 'NEW',
        },
      });

      createdCount++;
    }

    await logAdminAction(
      'AI_DISCOVERY_RUN',
      'AIDiscoveryItem',
      undefined,
      `Ran AI New Music Discovery: found ${createdCount} new candidate releases.`
    );

    revalidatePath('/admin/ai/discovery');
    revalidatePath('/admin/ai');

    return { success: true, count: createdCount };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message || 'Discovery run failed.' };
  }
}

export async function approveDiscoveryAction(
  discoveryId: string,
  editedData?: {
    title?: string;
    artistName?: string;
    albumName?: string;
    languageId?: string;
    categoryId?: string;
    streamUrl?: string;
    downloadUrl?: string;
  }
) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'kumarbajrang325@gmail.com';

  const item = await db.aIDiscoveryItem.findUnique({
    where: { id: discoveryId },
  });

  if (!item || item.status === 'APPROVED') {
    return { success: false, error: 'Discovery item not found or already approved.' };
  }

  const finalTitle = editedData?.title || item.title;
  const finalArtist = editedData?.artistName || item.artistName;
  const finalLanguageId = editedData?.languageId || item.languageId;
  const finalCategoryId = editedData?.categoryId || item.categoryId;

  if (!finalLanguageId || !finalCategoryId) {
    return { success: false, error: 'Target language and category must be set before approving.' };
  }

  // 1. Resolve/Create Artist
  let artist = await db.artist.findFirst({
    where: { name: { equals: finalArtist, mode: 'insensitive' } },
  });

  if (!artist) {
    artist = await db.artist.create({
      data: {
        name: finalArtist.trim(),
        description: 'Discovered via AI Music Assistant',
        imageUrl: item.thumbnailUrl || null,
      },
    });
  }

  // 2. Resolve/Create Album if present
  let albumId: string | undefined = undefined;
  const albumName = editedData?.albumName || item.albumName;
  if (albumName && albumName.trim()) {
    let album = await db.album.findFirst({
      where: {
        title: { equals: albumName.trim(), mode: 'insensitive' },
        artistId: artist.id,
      },
    });

    if (!album) {
      album = await db.album.create({
        data: {
          title: albumName.trim(),
          artistId: artist.id,
          coverImageUrl: item.thumbnailUrl || null,
        },
      });
    }
    albumId = album.id;
  }

  const sourceUrl = item.sourceUrl;
  const streamUrl = editedData?.streamUrl?.trim() || null;
  const downloadUrl = editedData?.downloadUrl?.trim() || null;

  // 3. Create Song
  const song = await db.song.create({
    data: {
      title: finalTitle.trim(),
      artistId: artist.id,
      albumId: albumId || null,
      languageId: finalLanguageId,
      sourceUrl,
      streamUrl,
      downloadUrl,
      audioUrl: streamUrl || sourceUrl,
      coverImageUrl: item.thumbnailUrl || null,
      duration: item.duration || 0,
      description: `AI Discovered Release (${item.sourcePlatform})`,
      isDownloadable: Boolean(downloadUrl),
      isPublished: true,
      categories: {
        create: {
          categoryId: finalCategoryId,
        },
      },
    },
  });

  // 4. Update discovery item status
  await db.aIDiscoveryItem.update({
    where: { id: discoveryId },
    data: {
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedBy: adminEmail,
    },
  });

  // 5. Activity Log
  await logAdminAction(
    'AI_DISCOVERY_APPROVED',
    'Song',
    song.id,
    `Approved discovery item and created song '${song.title}'`
  );

  revalidatePath('/admin/songs');
  revalidatePath('/admin/ai/discovery');
  revalidatePath('/admin/ai');
  revalidatePath('/music');

  return { success: true, songId: song.id };
}

export async function batchApproveDiscoveryAction(discoveryIds: string[]) {
  await requireAdmin();

  if (!discoveryIds || discoveryIds.length === 0) {
    return { success: false, error: 'No items selected for batch approval.' };
  }

  let approvedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (const id of discoveryIds) {
    try {
      const res = await approveDiscoveryAction(id);
      if (res.success) {
        approvedCount++;
      } else {
        skippedCount++;
        if (res.error) errors.push(`Item ${id}: ${res.error}`);
      }
    } catch {
      skippedCount++;
    }
  }

  revalidatePath('/admin/songs');
  revalidatePath('/admin/ai/discovery');
  revalidatePath('/admin/ai');
  revalidatePath('/music');

  return {
    success: true,
    summary: {
      total: discoveryIds.length,
      approvedCount,
      skippedCount,
      errors,
    },
  };
}

export async function ignoreDiscoveryAction(discoveryId: string) {
  const session = await requireAdmin();
  const adminEmail = session.user?.email || 'kumarbajrang325@gmail.com';

  await db.aIDiscoveryItem.update({
    where: { id: discoveryId },
    data: {
      status: 'IGNORED',
      reviewedAt: new Date(),
      reviewedBy: adminEmail,
    },
  });

  await logAdminAction(
    'AI_DISCOVERY_IGNORED',
    'AIDiscoveryItem',
    discoveryId,
    `Ignored discovery candidate ${discoveryId}`
  );

  revalidatePath('/admin/ai/discovery');
  revalidatePath('/admin/ai');

  return { success: true };
}

export async function getAIDashboardStatsAction() {
  await requireAdmin();

  const [
    totalDiscoveries,
    newDiscoveries,
    needsReview,
    highConfidence,
    possibleDuplicates,
    approvedToday,
    languageBreakdown,
  ] = await Promise.all([
    db.aIDiscoveryItem.count(),
    db.aIDiscoveryItem.count({ where: { status: 'NEW' } }),
    db.aIDiscoveryItem.count({ where: { status: 'NEW', confidence: { lt: AI_CONFIG.CONFIDENCE_HIGH } } }),
    db.aIDiscoveryItem.count({ where: { status: 'NEW', confidence: { gte: AI_CONFIG.CONFIDENCE_HIGH } } }),
    db.aIDiscoveryItem.count({ where: { duplicateStatus: { in: ['POSSIBLE', 'MATCH'] }, status: 'NEW' } }),
    db.aIDiscoveryItem.count({
      where: {
        status: 'APPROVED',
        reviewedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    db.aIDiscoveryItem.groupBy({
      by: ['languageId'],
      _count: { id: true },
      where: { status: 'NEW' },
    }),
  ]);

  const languages = await db.language.findMany();
  const breakdown = languageBreakdown.map((item) => {
    const lang = languages.find((l) => l.id === item.languageId);
    return {
      languageName: lang?.name || 'Unclassified',
      count: item._count.id,
    };
  });

  return {
    totalDiscoveries,
    newDiscoveries,
    needsReview,
    highConfidence,
    possibleDuplicates,
    approvedToday,
    languageBreakdown: breakdown,
  };
}

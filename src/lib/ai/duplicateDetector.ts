import { db } from '@/lib/db';

export interface DuplicateCheckResult {
  duplicateStatus: 'NONE' | 'POSSIBLE' | 'MATCH';
  similarity: number;
  matchingSongId?: string;
  matchingSongTitle?: string;
  matchingArtistName?: string;
  matchingSongAudioUrl?: string;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);

  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;

  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length);
    const shorter = Math.min(norm1.length, norm2.length);
    return Math.round((shorter / longer) * 100);
  }

  // Levenshtein distance approximation for short strings
  const matrix: number[][] = [];
  for (let i = 0; i <= norm1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= norm2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= norm1.length; i++) {
    for (let j = 1; j <= norm2.length; j++) {
      if (norm1[i - 1] === norm2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const distance = matrix[norm1.length][norm2.length];
  const maxLength = Math.max(norm1.length, norm2.length);
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
}

export async function checkDuplicateSong(input: {
  sourceUrl?: string;
  title: string;
  artistName?: string;
  duration?: number;
}): Promise<DuplicateCheckResult> {
  if (input.sourceUrl) {
    const exactUrlMatch = await db.song.findFirst({
      where: { audioUrl: input.sourceUrl },
      include: { artist: true },
    });

    if (exactUrlMatch) {
      return {
        duplicateStatus: 'MATCH',
        similarity: 100,
        matchingSongId: exactUrlMatch.id,
        matchingSongTitle: exactUrlMatch.title,
        matchingArtistName: exactUrlMatch.artist.name,
        matchingSongAudioUrl: exactUrlMatch.audioUrl ?? undefined,
      };
    }
  }

  const existingSongs = await db.song.findMany({
    take: 200,
    include: { artist: true },
  });

  let bestMatch: (typeof existingSongs)[0] | null = null;
  let maxSimilarity = 0;

  for (const song of existingSongs) {
    const titleSim = calculateStringSimilarity(input.title, song.title);
    const artistSim = input.artistName ? calculateStringSimilarity(input.artistName, song.artist.name) : 50;
    
    let durationSim = 100;
    if (input.duration && song.duration) {
      const diff = Math.abs(input.duration - song.duration);
      if (diff > 15) durationSim = 50;
      if (diff > 30) durationSim = 10;
    }

    const combinedSimilarity = Math.round(titleSim * 0.6 + artistSim * 0.3 + durationSim * 0.1);

    if (combinedSimilarity > maxSimilarity) {
      maxSimilarity = combinedSimilarity;
      bestMatch = song;
    }
  }

  if (bestMatch && maxSimilarity >= 85) {
    return {
      duplicateStatus: maxSimilarity >= 95 ? 'MATCH' : 'POSSIBLE',
      similarity: maxSimilarity,
      matchingSongId: bestMatch.id,
      matchingSongTitle: bestMatch.title,
      matchingArtistName: bestMatch.artist.name,
      matchingSongAudioUrl: bestMatch.audioUrl ?? undefined,
    };
  }

  if (bestMatch && maxSimilarity >= 65) {
    return {
      duplicateStatus: 'POSSIBLE',
      similarity: maxSimilarity,
      matchingSongId: bestMatch.id,
      matchingSongTitle: bestMatch.title,
      matchingArtistName: bestMatch.artist.name,
      matchingSongAudioUrl: bestMatch.audioUrl ?? undefined,
    };
  }

  return {
    duplicateStatus: 'NONE',
    similarity: maxSimilarity,
  };
}

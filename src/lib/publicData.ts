import { db } from '@/lib/db';

export async function getActiveLanguages() {
  try {
    return await db.language.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        displayOrder: true,
      },
    });
  } catch (error) {
    console.error('Error fetching active languages:', error);
    return [];
  }
}

export async function getActiveCategoriesWithThemes() {
  try {
    return await db.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        theme: true,
      },
    });
  } catch (error) {
    console.error('Error fetching active categories:', error);
    return [];
  }
}

export async function getMatchingSongs(languageName?: string, moodName?: string) {
  try {
    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (languageName) {
      where.language = {
        name: { equals: languageName },
      };
    }

    if (moodName) {
      where.categories = {
        some: {
          category: {
            name: { equals: moodName },
          },
        },
      };
    }

    const songs = await db.song.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: { select: { id: true, name: true, imageUrl: true } },
        album: { select: { id: true, title: true, coverImageUrl: true } },
        language: { select: { id: true, name: true, code: true } },
        categories: {
          include: {
            category: {
              include: {
                theme: true,
              },
            },
          },
        },
      },
    });

    return songs;
  } catch (error) {
    console.error('Error querying matching songs:', error);
    return [];
  }
}

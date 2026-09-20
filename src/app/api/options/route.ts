import { NextResponse } from 'next/server';
import { getActiveLanguages, getActiveCategoriesWithThemes } from '@/lib/publicData';

export async function GET() {
  const [languages, categories] = await Promise.all([
    getActiveLanguages(),
    getActiveCategoriesWithThemes(),
  ]);

  return NextResponse.json({
    languages: languages.length > 0 ? languages : [
      { id: '1', name: 'Hindi', code: 'hindi' },
      { id: '2', name: 'English', code: 'english' },
      { id: '3', name: 'Nepali', code: 'nepali' },
      { id: '4', name: 'Bhojpuri', code: 'bhojpuri' },
      { id: '5', name: 'Marathi', code: 'marathi' },
      { id: '6', name: 'Gujarati', code: 'gujarati' },
      { id: '7', name: 'Punjabi', code: 'punjabi' },
      { id: '8', name: 'Tamil', code: 'tamil' },
      { id: '9', name: 'Telugu', code: 'telugu' },
    ],
    categories: categories.length > 0 ? categories : [
      { id: '1', name: 'Romantic', slug: 'romantic', description: 'Love songs and romantic acoustic tracks' },
      { id: '2', name: 'Sad', slug: 'sad', description: 'Melancholic tones and reflective beats' },
      { id: '3', name: 'One Side Love', slug: 'one-side-love', description: 'Deep unrequited love songs' },
      { id: '4', name: 'Banger', slug: 'banger', description: 'High-energy party anthems' },
      { id: '5', name: 'Mashup', slug: 'mashup', description: 'DJ mixes and song medleys' },
      { id: '6', name: 'Funny', slug: 'funny', description: 'Humorous songs and meme audio tracks' },
      { id: '7', name: 'Bus Driver Playlist', slug: 'bus-driver-playlist', description: 'Long-drive highway hits' },
    ],
  });
}

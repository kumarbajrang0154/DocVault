import { db } from '@/lib/db';

export interface AIClassificationResult {
  title: string;
  artistName: string;
  albumName?: string;
  languageId: string;
  languageName: string;
  categoryId: string;
  categoryName: string;
  secondaryCategoryId?: string;
  secondaryCategoryName?: string;
  description?: string;
  confidence: number;
  reasoning: string;
}

export async function classifyMusicMetadata(input: {
  title: string;
  channelTitle: string;
  description?: string;
  duration?: number;
}): Promise<AIClassificationResult> {
  const [languages, categories] = await Promise.all([
    db.language.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
  ]);

  if (languages.length === 0 || categories.length === 0) {
    throw new Error('Database contains no active languages or categories for AI classification.');
  }

  const defaultLanguage = languages.find((l) => l.name.toLowerCase() === 'hindi') || languages[0];
  const defaultCategory = categories.find((c) => c.name.toLowerCase() === 'romantic') || categories[0];

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are an expert music classification engine for the Mood music app.
Analyze the following song metadata:
- Raw Title: "${input.title}"
- Channel/Artist: "${input.channelTitle}"
- Description: "${input.description || ''}"

Target Active Languages in Database: ${languages.map((l) => `${l.name} (id: ${l.id})`).join(', ')}
Target Active Categories in Database: ${categories.map((c) => `${c.name} (id: ${c.id})`).join(', ')}

Strict Rules:
1. Extract the clean Song Title (remove tags like "Official Video", "4K", "Lyrical", "Full Song").
2. Extract the Artist Name.
3. Classify Language into ONE of the exact target languages listed above.
4. Classify Primary Category into ONE of the exact target categories listed above.
5. Optionally select a Secondary Category from the target categories.
6. Provide an overall classification confidence score between 0 and 100.
7. Provide brief reasoning for your choice.

Respond STRICTLY in valid JSON with schema:
{
  "title": "Clean Song Title",
  "artistName": "Artist Name",
  "albumName": "Album Name or Single",
  "languageId": "ID matching one of target languages",
  "categoryId": "ID matching one of target categories",
  "secondaryCategoryId": "ID matching secondary category or null",
  "description": "Brief song summary",
  "confidence": 95,
  "reasoning": "Reasoning details"
}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const matchedLang = languages.find((l) => l.id === parsed.languageId) || defaultLanguage;
          const matchedCat = categories.find((c) => c.id === parsed.categoryId) || defaultCategory;
          const secondaryCat = categories.find((c) => c.id === parsed.secondaryCategoryId);

          return {
            title: parsed.title || cleanTitle(input.title),
            artistName: parsed.artistName || cleanArtist(input.channelTitle),
            albumName: parsed.albumName || 'Single',
            languageId: matchedLang.id,
            languageName: matchedLang.name,
            categoryId: matchedCat.id,
            categoryName: matchedCat.name,
            secondaryCategoryId: secondaryCat?.id,
            secondaryCategoryName: secondaryCat?.name,
            description: parsed.description || input.description || '',
            confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 85)),
            reasoning: parsed.reasoning || 'AI classified based on metadata analysis.',
          };
        }
      }
    } catch {
      // Fallback to rule-based parser on API error
    }
  }

  // Robust heuristic rule-based classifier
  return heuristicClassification(input, languages, categories, defaultLanguage, defaultCategory);
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/\[.*?\]|\(.*?\)/g, '')
    .replace(/\b(official|video|lyrical|full song|4k|hd|audio|visualizer)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArtist(rawArtist: string): string {
  return rawArtist
    .replace(/\b(VEVO|Official|Music|Records|Topic|Channel|Studio)\b/gi, '')
    .trim() || rawArtist;
}

function heuristicClassification(
  input: { title: string; channelTitle: string; description?: string },
  languages: Array<{ id: string; name: string }>,
  categories: Array<{ id: string; name: string }>,
  defaultLang: { id: string; name: string },
  defaultCat: { id: string; name: string }
): AIClassificationResult {
  const text = `${input.title} ${input.channelTitle} ${input.description || ''}`.toLowerCase();

  let matchedLang = defaultLang;
  let langConfidence = 80;

  for (const lang of languages) {
    const lName = lang.name.toLowerCase();
    if (text.includes(lName)) {
      matchedLang = lang;
      langConfidence = 95;
      break;
    }
  }

  if (matchedLang === defaultLang) {
    if (text.includes('punjabi') || text.includes('sidhu') || text.includes('karan aujla')) {
      matchedLang = languages.find((l) => l.name.toLowerCase() === 'punjabi') || defaultLang;
      langConfidence = 92;
    } else if (text.includes('bhojpuri') || text.includes('khesari') || text.includes('pawan singh')) {
      matchedLang = languages.find((l) => l.name.toLowerCase() === 'bhojpuri') || defaultLang;
      langConfidence = 94;
    } else if (text.includes('tamil') || text.includes('anirudh') || text.includes('ar rahman')) {
      matchedLang = languages.find((l) => l.name.toLowerCase() === 'tamil') || defaultLang;
      langConfidence = 90;
    } else if (text.includes('english') || text.includes('hollywood')) {
      matchedLang = languages.find((l) => l.name.toLowerCase() === 'english') || defaultLang;
      langConfidence = 88;
    }
  }

  let matchedCat = defaultCat;
  let catConfidence = 80;

  if (text.includes('sad') || text.includes('dard') || text.includes('broken') || text.includes('heartbreak')) {
    matchedCat = categories.find((c) => c.name.toLowerCase() === 'sad') || defaultCat;
    catConfidence = 95;
  } else if (text.includes('banger') || text.includes('party') || text.includes('dance') || text.includes('club')) {
    matchedCat = categories.find((c) => c.name.toLowerCase() === 'banger') || defaultCat;
    catConfidence = 92;
  } else if (text.includes('romantic') || text.includes('love') || text.includes('dil') || text.includes('pyar')) {
    matchedCat = categories.find((c) => c.name.toLowerCase() === 'romantic') || defaultCat;
    catConfidence = 94;
  } else if (text.includes('mashup') || text.includes('remix') || text.includes('medley')) {
    matchedCat = categories.find((c) => c.name.toLowerCase() === 'mashup') || defaultCat;
    catConfidence = 96;
  } else if (text.includes('one side') || text.includes('ek tarfa') || text.includes('unrequited')) {
    matchedCat = categories.find((c) => c.name.toLowerCase().includes('one side')) || defaultCat;
    catConfidence = 91;
  } else if (text.includes('funny') || text.includes('comedy') || text.includes('troll')) {
    matchedCat = categories.find((c) => c.name.toLowerCase() === 'funny') || defaultCat;
    catConfidence = 90;
  }

  const overallConfidence = Math.round((langConfidence + catConfidence) / 2);

  return {
    title: cleanTitle(input.title),
    artistName: cleanArtist(input.channelTitle),
    albumName: 'Single',
    languageId: matchedLang.id,
    languageName: matchedLang.name,
    categoryId: matchedCat.id,
    categoryName: matchedCat.name,
    description: input.description || `Discovered track classified under ${matchedLang.name} / ${matchedCat.name}`,
    confidence: overallConfidence,
    reasoning: `Rule-based classifier matched language '${matchedLang.name}' and mood '${matchedCat.name}' from track metadata.`,
  };
}

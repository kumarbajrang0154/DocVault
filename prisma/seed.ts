import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_LANGUAGES = [
  { name: 'Hindi', code: 'hindi', displayOrder: 1 },
  { name: 'English', code: 'english', displayOrder: 2 },
  { name: 'Nepali', code: 'nepali', displayOrder: 3 },
  { name: 'Bhojpuri', code: 'bhojpuri', displayOrder: 4 },
  { name: 'Marathi', code: 'marathi', displayOrder: 5 },
  { name: 'Gujarati', code: 'gujarati', displayOrder: 6 },
  { name: 'Punjabi', code: 'punjabi', displayOrder: 7 },
  { name: 'Tamil', code: 'tamil', displayOrder: 8 },
  { name: 'Telugu', code: 'telugu', displayOrder: 9 },
];

const INITIAL_CATEGORIES = [
  {
    name: 'Romantic',
    slug: 'romantic',
    description: 'Love songs, heart-touching melodies, and romantic acoustic tracks.',
    icon: 'Heart',
    displayOrder: 1,
    theme: {
      name: 'Romantic Red',
      background: '#09090b',
      primaryColor: '#f43f5e',
      secondaryColor: '#e11d48',
      accentColor: '#fb7185',
      textColor: '#ffffff',
      cardStyle: 'bg-rose-950/30 border-rose-500/20 shadow-rose-950/50',
      buttonStyle: 'bg-rose-600 hover:bg-rose-500 text-white',
      playerStyle: 'from-rose-500/20 via-pink-600/20 to-purple-600/20',
      animationPreset: 'pulse',
    },
  },
  {
    name: 'Sad',
    slug: 'sad',
    description: 'Melancholic tones, emotional ballads, and reflective beats.',
    icon: 'CloudRain',
    displayOrder: 2,
    theme: {
      name: 'Sad Blue',
      background: '#05070f',
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      accentColor: '#60a5fa',
      textColor: '#ffffff',
      cardStyle: 'bg-blue-950/30 border-blue-500/20 shadow-blue-950/50',
      buttonStyle: 'bg-blue-600 hover:bg-blue-500 text-white',
      playerStyle: 'from-blue-600/20 via-indigo-600/20 to-slate-800/20',
      animationPreset: 'glow',
    },
  },
  {
    name: 'One Side Love',
    slug: 'one-side-love',
    description: 'Deep unrequited love songs and emotional storytelling tracks.',
    icon: 'HeartOff',
    displayOrder: 3,
    theme: {
      name: 'Unrequited Purple',
      background: '#07050d',
      primaryColor: '#a855f7',
      secondaryColor: '#7e22ce',
      accentColor: '#c084fc',
      textColor: '#ffffff',
      cardStyle: 'bg-purple-950/30 border-purple-500/20 shadow-purple-950/50',
      buttonStyle: 'bg-purple-600 hover:bg-purple-500 text-white',
      playerStyle: 'from-purple-600/20 via-fuchsia-600/20 to-zinc-900/20',
      animationPreset: 'bounce',
    },
  },
  {
    name: 'Banger',
    slug: 'banger',
    description: 'High-energy party anthems, bass-boosted hits, and dance beats.',
    icon: 'Zap',
    displayOrder: 4,
    theme: {
      name: 'Neon Banger',
      background: '#0c0a00',
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      accentColor: '#fde047',
      textColor: '#ffffff',
      cardStyle: 'bg-amber-950/30 border-amber-500/20 shadow-amber-950/50',
      buttonStyle: 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold',
      playerStyle: 'from-amber-500/20 via-orange-600/20 to-yellow-500/20',
      animationPreset: 'pulse',
    },
  },
  {
    name: 'Mashup',
    slug: 'mashup',
    description: 'Seamless DJ mixes, non-stop mashups, and song medleys.',
    icon: 'Disc',
    displayOrder: 5,
    theme: {
      name: 'Cyan Mashup',
      background: '#030a0d',
      primaryColor: '#06b6d4',
      secondaryColor: '#0891b2',
      accentColor: '#67e8f9',
      textColor: '#ffffff',
      cardStyle: 'bg-cyan-950/30 border-cyan-500/20 shadow-cyan-950/50',
      buttonStyle: 'bg-cyan-600 hover:bg-cyan-500 text-white',
      playerStyle: 'from-cyan-500/20 via-teal-600/20 to-blue-600/20',
      animationPreset: 'spin',
    },
  },
  {
    name: 'Funny',
    slug: 'funny',
    description: 'Humorous songs, meme audio tracks, and cheerful parodies.',
    icon: 'Smile',
    displayOrder: 6,
    theme: {
      name: 'Vibrant Green',
      background: '#030c06',
      primaryColor: '#22c55e',
      secondaryColor: '#16a34a',
      accentColor: '#4ade80',
      textColor: '#ffffff',
      cardStyle: 'bg-emerald-950/30 border-emerald-500/20 shadow-emerald-950/50',
      buttonStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      playerStyle: 'from-emerald-500/20 via-green-600/20 to-lime-600/20',
      animationPreset: 'bounce',
    },
  },
  {
    name: 'Bus Driver Playlist',
    slug: 'bus-driver-playlist',
    description: 'Iconic long-drive highway hits, nostalgia retro tunes, and roadtrip tracks.',
    icon: 'Radio',
    displayOrder: 7,
    theme: {
      name: 'Highway Gold',
      background: '#0f0803',
      primaryColor: '#f97316',
      secondaryColor: '#ea580c',
      accentColor: '#fdba74',
      textColor: '#ffffff',
      cardStyle: 'bg-orange-950/30 border-orange-500/20 shadow-orange-950/50',
      buttonStyle: 'bg-orange-600 hover:bg-orange-500 text-white',
      playerStyle: 'from-orange-500/20 via-amber-600/20 to-red-600/20',
      animationPreset: 'pulse',
    },
  },
];

const INITIAL_SETTINGS = [
  { key: 'appName', value: 'Mood' },
  { key: 'appDescription', value: 'Choose your language. Choose your mood. Feel the music.' },
  { key: 'defaultLanguage', value: 'Hindi' },
  { key: 'defaultCategory', value: 'Romantic' },
  { key: 'pwaThemeColor', value: '#09090b' },
];

async function main() {
  console.log('Seeding initial Mood database config...');

  // Seed Languages
  for (const lang of INITIAL_LANGUAGES) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, displayOrder: lang.displayOrder },
      create: lang,
    });
  }
  console.log(`Seeded ${INITIAL_LANGUAGES.length} initial languages.`);

  // Seed Categories & Themes
  for (const cat of INITIAL_CATEGORIES) {
    let themeId: string | undefined = undefined;

    // Create or update Theme first
    const theme = await prisma.theme.upsert({
      where: { name: cat.theme.name },
      update: cat.theme,
      create: cat.theme,
    });
    themeId = theme.id;

    // Upsert Category
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        themeId,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        themeId,
      },
    });
  }
  console.log(`Seeded ${INITIAL_CATEGORIES.length} initial categories with themes.`);

  // Seed Site Settings
  for (const setting of INITIAL_SETTINGS) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`Seeded ${INITIAL_SETTINGS.length} site settings.`);

  console.log('Database seeding completed cleanly without fake songs or fake media!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export interface YouTubeMetadata {
  videoId: string;
  sourceUrl: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  publishedAt?: string;
  platform: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('music.youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2];
      }
      return parsed.searchParams.get('v');
    }
  } catch {
    // Ignore URL parse error
  }
  return null;
}

function parseISO8601Duration(durationStr: string): number {
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubeMetadata(url: string): Promise<YouTubeMetadata> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL provided. Supported formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...');
  }

  const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const apiEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const snippet = item.snippet || {};
          const contentDetails = item.contentDetails || {};
          const thumbnail = snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const durationSec = contentDetails.duration ? parseISO8601Duration(contentDetails.duration) : 0;

          return {
            videoId,
            sourceUrl: cleanUrl,
            title: snippet.title || 'Unknown Title',
            channelTitle: snippet.channelTitle || 'Unknown Artist',
            description: snippet.description || '',
            thumbnailUrl: thumbnail,
            duration: durationSec,
            publishedAt: snippet.publishedAt,
            platform: 'YOUTUBE',
          };
        }
      }
    } catch {
      // Fallback to oEmbed if YouTube API fails
    }
  }

  // Fallback to official YouTube oEmbed API (No API key required)
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
  const response = await fetch(oEmbedUrl);
  if (!response.ok) {
    throw new Error('Could not fetch YouTube video metadata. Please verify the URL.');
  }

  const oembed = await response.json();
  return {
    videoId,
    sourceUrl: cleanUrl,
    title: oembed.title || 'Unknown Title',
    channelTitle: oembed.author_name || 'Unknown Artist',
    description: '',
    thumbnailUrl: oembed.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    duration: 0,
    platform: 'YOUTUBE',
  };
}

export async function discoverYouTubeTrendingSongs(searchQuery: string = 'new song'): Promise<YouTubeMetadata[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.items || [];
    return items.map((item: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; description?: string; thumbnails?: { high?: { url?: string }; default?: { url?: string } }; publishedAt?: string } }) => ({
      videoId: item.id?.videoId || '',
      sourceUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      title: item.snippet?.title || '',
      channelTitle: item.snippet?.channelTitle || '',
      description: item.snippet?.description || '',
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
      duration: 0,
      publishedAt: item.snippet?.publishedAt,
      platform: 'YOUTUBE',
    })).filter((m: YouTubeMetadata) => Boolean(m.videoId));
  } catch {
    return [];
  }
}

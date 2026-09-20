export function isYouTubeUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  return (
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('m.youtube.com')
  );
}

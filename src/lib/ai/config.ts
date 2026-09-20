export const AI_CONFIG = {
  CONFIDENCE_HIGH: 90,
  CONFIDENCE_REVIEW: 70,
  DEFAULT_MIN_CONFIDENCE: 70,
  PLATFORM_YOUTUBE: 'YOUTUBE',
} as const;

export function getConfidenceBadge(confidence: number) {
  if (confidence >= AI_CONFIG.CONFIDENCE_HIGH) {
    return { label: 'High Confidence', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  }
  if (confidence >= AI_CONFIG.CONFIDENCE_REVIEW) {
    return { label: 'Review Recommended', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  }
  return { label: 'Manual Verification Required', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
}

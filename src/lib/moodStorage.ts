export interface MoodPreferences {
  language: string | null;
  mood: string | null;
  onboardingCompleted: boolean;
}

const STORAGE_KEY = 'mood_preferences';

export const DEFAULT_PREFERENCES: MoodPreferences = {
  language: null,
  mood: null,
  onboardingCompleted: false,
};

export function getMoodPreferences(): MoodPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (!item) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(item);
    return {
      language: typeof parsed.language === 'string' ? parsed.language : null,
      mood: typeof parsed.mood === 'string' ? parsed.mood : null,
      onboardingCompleted: Boolean(parsed.onboardingCompleted),
    };
  } catch (error) {
    console.error('Failed to read mood preferences from localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function saveMoodPreferences(updates: Partial<MoodPreferences>): MoodPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }
  try {
    const current = getMoodPreferences();
    const updated: MoodPreferences = {
      ...current,
      ...updates,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save mood preferences to localStorage:', error);
    return DEFAULT_PREFERENCES;
  }
}

export function clearMoodPreferences(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear mood preferences:', error);
  }
}

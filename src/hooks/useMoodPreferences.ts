'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import {
  MoodPreferences,
  DEFAULT_PREFERENCES,
  saveMoodPreferences,
} from '@/lib/moodStorage';

const STORAGE_KEY = 'mood_preferences';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

export function useMoodPreferences() {
  const rawPreferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [modalOverride, setModalOverride] = useState<boolean | null>(null);

  let preferences: MoodPreferences = DEFAULT_PREFERENCES;
  if (rawPreferences) {
    try {
      preferences = JSON.parse(rawPreferences);
    } catch {
      preferences = DEFAULT_PREFERENCES;
    }
  }

  // Derive modal open state: explicit user override > onboarding incomplete check
  const isModalOpen = modalOverride ?? !preferences.onboardingCompleted;

  const completeOnboarding = useCallback((language: string, mood: string) => {
    const updated = saveMoodPreferences({
      language,
      mood,
      onboardingCompleted: true,
    });
    setModalOverride(false);
    return updated;
  }, []);

  const openModal = useCallback(() => {
    setModalOverride(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOverride(false);
  }, []);

  return {
    preferences,
    isHydrated: true,
    isModalOpen,
    openModal,
    closeModal,
    completeOnboarding,
  };
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/mood/Navbar';
import { Hero } from '@/components/mood/Hero';
import { MoodPreview } from '@/components/mood/MoodPreview';
import { LanguagePreview } from '@/components/mood/LanguagePreview';
import { FinalCTA } from '@/components/mood/FinalCTA';
import { Footer } from '@/components/mood/Footer';
import { OnboardingModal } from '@/components/mood/OnboardingModal';
import { useMoodPreferences } from '@/hooks/useMoodPreferences';

export default function Home() {
  const router = useRouter();
  const {
    preferences,
    isHydrated,
    isModalOpen,
    openModal,
    closeModal,
    completeOnboarding,
  } = useMoodPreferences();

  const handleStartListening = () => {
    if (preferences.onboardingCompleted) {
      router.push('/music');
    } else {
      openModal();
    }
  };

  const handleCompleteOnboarding = (language: string, mood: string) => {
    completeOnboarding(language, mood);
    router.push('/music');
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 bg-ambient-gradient">
      <Navbar onStartListening={handleStartListening} />
      <main className="flex-1">
        <Hero onStartListening={handleStartListening} />
        <MoodPreview />
        <LanguagePreview />
        <FinalCTA onStartListening={handleStartListening} />
      </main>
      <Footer />

      {/* Persistent Onboarding Modal */}
      {isHydrated && (
        <OnboardingModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onComplete={handleCompleteOnboarding}
          initialLanguage={preferences.language}
          initialMood={preferences.mood}
          canDismiss={preferences.onboardingCompleted}
        />
      )}
    </div>
  );
}

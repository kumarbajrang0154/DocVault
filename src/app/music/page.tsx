'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/mood/Navbar';
import { Footer } from '@/components/mood/Footer';
import { OnboardingModal } from '@/components/mood/OnboardingModal';
import { useMoodPreferences } from '@/hooks/useMoodPreferences';
import { Music2, Globe, Heart, RefreshCw, Sparkles } from 'lucide-react';

export default function MusicPage() {
  const { preferences, completeOnboarding } = useMoodPreferences();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdatePreferences = (language: string, mood: string) => {
    completeOnboarding(language, mood);
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 bg-ambient-gradient">
      <Navbar onStartListening={() => setIsModalOpen(true)} />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
          
          {/* Music Header Emblem */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-500/20 mb-6">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
              <Music2 className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Music Experience
          </h1>
          
          <p className="mt-3 text-base text-zinc-400 max-w-md mx-auto">
            Your personalized listening space tailored to your language and mood selection.
          </p>

          {/* Active Preferences Panel */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            
            {/* Selected Language Badge */}
            <div className="rounded-2xl border border-white/10 bg-zinc-800/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                <Globe className="h-4 w-4" />
                <span>Language</span>
              </div>
              <p className="text-xl font-bold text-white">
                {preferences?.language || 'Not Selected'}
              </p>
            </div>

            {/* Selected Mood Badge */}
            <div className="rounded-2xl border border-white/10 bg-zinc-800/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
                <Heart className="h-4 w-4" />
                <span>Mood</span>
              </div>
              <p className="text-xl font-bold text-white">
                {preferences?.mood || 'Not Selected'}
              </p>
            </div>

          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:border-white/30"
            >
              <RefreshCw className="h-4 w-4 text-zinc-400" />
              <span>Change Mood or Language</span>
            </button>

            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              <Sparkles className="h-4 w-4 text-rose-500" />
              <span>Back to Landing Page</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />

      {/* Preference Edit Modal */}
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleUpdatePreferences}
        initialLanguage={preferences?.language}
        initialMood={preferences?.mood}
        canDismiss={true}
      />
    </div>
  );
}

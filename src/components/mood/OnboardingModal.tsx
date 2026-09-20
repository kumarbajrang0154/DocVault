'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Globe, 
  Heart, 
  CloudRain, 
  Flame, 
  HeartHandshake, 
  Music, 
  Laugh, 
  Bus 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (language: string, mood: string) => void;
  initialLanguage?: string | null;
  initialMood?: string | null;
  canDismiss?: boolean;
}

const DEFAULT_LANGUAGES = [
  { id: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'English', name: 'English', native: 'English' },
  { id: 'Nepali', name: 'Nepali', native: 'नेपाली' },
  { id: 'Bhojpuri', name: 'Bhojpuri', native: 'भोजपुरी' },
  { id: 'Marathi', name: 'Marathi', native: 'मराठी' },
  { id: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
  { id: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { id: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
  { id: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
];

const DEFAULT_MOODS = [
  { id: 'Romantic', name: 'Romantic', icon: <Heart className="h-5 w-5 text-rose-400" /> },
  { id: 'Sad', name: 'Sad', icon: <CloudRain className="h-5 w-5 text-indigo-400" /> },
  { id: 'One Side Love', name: 'One Side Love', icon: <HeartHandshake className="h-5 w-5 text-purple-400" /> },
  { id: 'Banger', name: 'Banger', icon: <Flame className="h-5 w-5 text-emerald-400" /> },
  { id: 'Mashup', name: 'Mashup', icon: <Music className="h-5 w-5 text-cyan-400" /> },
  { id: 'Funny', name: 'Funny', icon: <Laugh className="h-5 w-5 text-amber-400" /> },
  { id: 'Bus Driver Playlist', name: 'Bus Driver Playlist', icon: <Bus className="h-5 w-5 text-orange-400" /> },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialLanguage = null,
  initialMood = null,
  canDismiss = false,
}: OnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(initialLanguage);
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);

  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
  const [moods, setMoods] = useState(DEFAULT_MOODS);

  // Sync state when modal open state transitions to true
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelectedLanguage(initialLanguage);
      setSelectedMood(initialMood);
      setStep(1);
    }
  }

  // Fetch dynamic database options
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/options');
        if (res.ok) {
          const data = await res.json();
          if (data.languages && data.languages.length > 0) {
            setLanguages(
              data.languages.map((l: { id: string; name: string }) => ({
                id: l.name,
                name: l.name,
                native: l.name,
              }))
            );
          }
          if (data.categories && data.categories.length > 0) {
            setMoods(
              data.categories.map((c: { id: string; name: string }) => {
                const match = DEFAULT_MOODS.find((m) => m.name.toLowerCase() === c.name.toLowerCase());
                return {
                  id: c.name,
                  name: c.name,
                  icon: match ? match.icon : <Sparkles className="h-5 w-5 text-rose-400" />,
                };
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic onboarding options:', err);
      }
    }
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinueToMood = () => {
    if (selectedLanguage) {
      setStep(2);
    }
  };

  const handleBackToLanguage = () => {
    setStep(1);
  };

  const handleFinish = () => {
    if (selectedLanguage && selectedMood) {
      onComplete(selectedLanguage, selectedMood);
      router.push('/music');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Visual Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={() => {
          if (canDismiss) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={handleBackToLanguage}
                className="mr-2 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Back to language selection"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Step {step} of 2
            </span>
          </div>

          {canDismiss && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Close onboarding modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="flex flex-col">
            <div className="mb-6 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 mb-2">
                <Globe className="h-3.5 w-3.5" />
                <span>Language Choice</span>
              </div>
              <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-bold text-white">
                Which language do you want to listen to?
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
                Select your preferred language to personalize your music experience.
              </p>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-h-[320px] overflow-y-auto pr-1 py-1">
              {languages.map((lang) => {
                const isSelected = selectedLanguage === lang.name;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.name)}
                    className={`group relative flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/15 text-white shadow-lg shadow-rose-500/10'
                        : 'border-white/10 bg-zinc-800/40 text-zinc-300 hover:border-white/20 hover:bg-zinc-800/80'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-zinc-950">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                    <span className="text-sm font-semibold">{lang.name}</span>
                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400">
                      {lang.native}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleContinueToMood}
                disabled={!selectedLanguage}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mood Selection */}
        {step === 2 && (
          <div className="flex flex-col">
            <div className="mb-6 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Emotion & Vibe</span>
              </div>
              <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-bold text-white">
                What kind of music are you in the mood for?
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
                Selected Language: <span className="font-semibold text-rose-400">{selectedLanguage}</span>
              </p>
            </div>

            {/* Mood Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 py-1">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.name;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.name)}
                    className={`group relative flex items-center gap-3 rounded-xl p-3.5 text-left border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isSelected
                        ? `border-rose-500 bg-rose-500/15 text-white shadow-lg shadow-rose-500/10`
                        : 'border-white/10 bg-zinc-800/40 text-zinc-300 hover:border-white/20 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                      {mood.icon}
                    </div>
                    <span className="text-sm font-semibold flex-1">{mood.name}</span>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-zinc-950">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToLanguage}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-md p-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Language</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={!selectedLanguage || !selectedMood}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span>Start Listening</span>
                <Sparkles className="h-4 w-4 text-rose-500" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

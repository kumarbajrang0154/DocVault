'use client';

import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageItem {
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageItem[] = [
  { name: 'Hindi', nativeName: 'हिन्दी' },
  { name: 'English', nativeName: 'English' },
  { name: 'Nepali', nativeName: 'नेपाली' },
  { name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { name: 'Marathi', nativeName: 'मराठी' },
  { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { name: 'Tamil', nativeName: 'தமிழ்' },
  { name: 'Telugu', nativeName: 'తెలుగు' },
];

export function LanguagePreview() {
  return (
    <section id="languages" className="relative py-20 sm:py-28 border-t border-white/5 bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300">
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>Multilingual Discovery</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Choose Your Language
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Music in the language closest to your heart. Mood connects you with melodies across regional & global voices.
          </p>
        </div>

        {/* Language Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.name}
              className="group flex flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-4 text-center backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/30 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {lang.name}
              </span>
              <span className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {lang.nativeName}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

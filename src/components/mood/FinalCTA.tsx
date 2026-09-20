'use client';

import React from 'react';

interface FinalCTAProps {
  onStartListening?: () => void;
}

export function FinalCTA({ onStartListening }: FinalCTAProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 border-t border-white/5">
      {/* Background Radial Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-500/10 via-purple-600/15 to-cyan-500/10 blur-3xl opacity-80" 
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to feel the music?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
          Choose your language. Choose your mood. Experience a personalized way to listen.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onStartListening}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:shadow-xl hover:shadow-rose-500/10 active:scale-98"
          >
            Start Listening
          </button>
        </div>
      </div>
    </section>
  );
}

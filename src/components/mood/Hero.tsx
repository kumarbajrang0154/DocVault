'use client';

import React from 'react';
import { Disc3, Heart, Flame, CloudRain, HeartHandshake } from 'lucide-react';

interface HeroProps {
  onStartListening?: () => void;
}

export function Hero({ onStartListening }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36">
      {/* Subtle Background Glows */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/10 via-purple-600/15 to-cyan-500/10 blur-3xl opacity-70" 
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          
          {/* Hero Copy & CTA */}
          <div className="flex flex-col items-start text-left lg:col-span-7">
            
            {/* Tagline Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-medium text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>Feel the music</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Your mood. <br />
              <span className="text-gradient-primary">Your music.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 max-w-xl text-base sm:text-lg text-zinc-400 leading-relaxed">
              Discover music tailored to your emotion and spoken in your language. 
              Choose how you feel, select your language, and immerse in a personalized listening experience.
            </p>

            {/* Primary CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={onStartListening}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:shadow-xl hover:shadow-rose-500/10 active:scale-98"
              >
                Start Listening
              </button>
            </div>
          </div>

          {/* Album & Visual Language Card Display */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Outer Decorative Vinyl Effect */}
              <div className="absolute -top-6 -right-6 h-64 w-64 rounded-full border border-white/10 bg-zinc-900/60 p-4 shadow-2xl backdrop-blur-md hidden sm:flex items-center justify-center animate-[spin_40s_linear_infinite]">
                <div className="h-full w-full rounded-full border border-dashed border-zinc-700/60 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    <Disc3 className="h-8 w-8 text-rose-500/80" />
                  </div>
                </div>
              </div>

              {/* Main Album Card */}
              <div className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900/40 via-purple-900/40 to-zinc-900 p-6 border border-white/5 flex flex-col justify-between relative group">
                  
                  {/* Atmospheric Glow inside Card */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-transparent to-cyan-500/20 opacity-60" />

                  <div className="relative z-10 flex justify-between items-start">
                    <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
                      Mood Experience
                    </span>
                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  </div>

                  {/* Representative Mood Emblems */}
                  <div className="relative z-10 my-auto grid grid-cols-2 gap-3 pt-4">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10 backdrop-blur-md">
                      <Heart className="h-5 w-5 text-rose-400" />
                      <span className="text-xs font-medium text-zinc-200">Romantic</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10 backdrop-blur-md">
                      <CloudRain className="h-5 w-5 text-indigo-400" />
                      <span className="text-xs font-medium text-zinc-200">Sad</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10 backdrop-blur-md">
                      <Flame className="h-5 w-5 text-emerald-400" />
                      <span className="text-xs font-medium text-zinc-200">Banger</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 border border-white/10 backdrop-blur-md">
                      <HeartHandshake className="h-5 w-5 text-purple-400" />
                      <span className="text-xs font-medium text-zinc-200">One Side Love</span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-400">
                    <span>Language & Mood Aligned</span>
                    <span className="text-rose-400 font-medium">Step 1 Preview</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

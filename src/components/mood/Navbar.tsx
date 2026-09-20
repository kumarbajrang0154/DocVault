'use client';

import React from 'react';
import Link from 'next/link';
import { Music2 } from 'lucide-react';

interface NavbarProps {
  onStartListening?: () => void;
}

export function Navbar({ onStartListening }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-shadow">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Music2 className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Mood
          </span>
        </Link>

        {/* Minimal Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
          <a 
            href="#concept" 
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Moods
          </a>
          <a 
            href="#languages" 
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Languages
          </a>
        </nav>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartListening}
            className="group relative inline-flex items-center justify-center rounded-full bg-white px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 hover:shadow-lg hover:shadow-white/10 active:scale-95"
          >
            <span>Start Listening</span>
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { Music2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-zinc-950">
              <Music2 className="h-3 w-3 text-white" />
            </div>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Mood</span>
        </div>

        {/* Minimal Copyright */}
        <p className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Mood. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

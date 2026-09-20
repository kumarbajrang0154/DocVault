import React from 'react';
import { auth } from '@/auth';
import { ShieldCheck, Server, Key, Music2 } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-purple-950/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Session Authenticated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Admin Portal Overview
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Welcome back, <span className="font-semibold text-white">{session?.user?.name || session?.user?.email}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Portal Status Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <Key className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Auth Identity</span>
          </div>
          <p className="text-sm font-bold text-white truncate">
            {session?.user?.email}
          </p>
          <span className="mt-1 text-[11px] text-zinc-500 block">Verified Google OAuth</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 text-rose-400 mb-2">
            <Music2 className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">App Core</span>
          </div>
          <p className="text-sm font-bold text-white">
            Mood Platform v1.0
          </p>
          <span className="mt-1 text-[11px] text-zinc-500 block">Landing & Onboarding Active</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <Server className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Server Security</span>
          </div>
          <p className="text-sm font-bold text-emerald-400">
            Enforced Server-Side
          </p>
          <span className="mt-1 text-[11px] text-zinc-500 block">Single Admin Restriction</span>
        </div>
      </div>

      {/* Modules Roadmap Notice */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 text-left backdrop-blur-md">
        <h2 className="text-base font-bold text-white">
          Admin Management Foundation
        </h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          The Admin Portal security and session architecture has been established. Future management modules (Songs, Categories, Languages, Playlists, Themes) will be built in subsequent steps.
        </p>
      </div>
    </div>
  );
}

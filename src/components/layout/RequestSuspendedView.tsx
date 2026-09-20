'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { ShieldAlert, LogOut } from 'lucide-react';

interface RequestSuspendedViewProps {
  userEmail?: string | null;
}

export function RequestSuspendedView({ userEmail }: RequestSuspendedViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-rose-500/20 bg-zinc-900/80 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-white">Account Suspended</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your account ({userEmail || 'user'}) has been suspended by the administrator.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 text-xs text-zinc-400 text-left space-y-1">
          <p className="font-semibold text-rose-300">Access Restricted</p>
          <p className="text-[11px] text-zinc-400">
            If you believe this is an error or would like to request reactivation, please contact your system administrator.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

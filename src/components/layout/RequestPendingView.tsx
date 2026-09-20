'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';

interface RequestPendingViewProps {
  userEmail?: string | null;
  siteName?: string;
}

export function RequestPendingView({
  userEmail,
  siteName = 'DocVault',
}: RequestPendingViewProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--color-background,#09090b)] text-zinc-100">
      {/* Background Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl opacity-80"
      />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        {/* Clock Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-xl">
          <Clock className="h-8 w-8 text-amber-400" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-3">
            Approval Pending
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Access Request Pending
          </h1>

          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
            Thanks for signing up! Your access request for <span className="font-semibold text-white">{userEmail}</span> is awaiting administrator approval.
          </p>

          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            You will be granted access to {siteName} once an admin reviews and approves your request.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

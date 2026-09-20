'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { ShieldAlert, LogOut } from 'lucide-react';

interface RequestRejectedViewProps {
  userEmail?: string | null;
  siteName?: string;
}

export function RequestRejectedView({
  userEmail,
  siteName = 'DocVault',
}: RequestRejectedViewProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--color-background,#09090b)] text-zinc-100">
      {/* Background Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/15 blur-3xl opacity-80"
      />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
        {/* Shield Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xl">
          <ShieldAlert className="h-8 w-8 text-rose-500" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
            Request Declined
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Access Request Declined
          </h1>

          <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
            Your access request for <span className="font-semibold text-white">{userEmail}</span> was declined by the administrator.
          </p>

          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
            If you believe this is an error, please contact the administrator to reconsider your account for {siteName}.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-6 text-sm font-bold text-white transition-all hover:bg-rose-600 active:scale-98 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out & Try Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

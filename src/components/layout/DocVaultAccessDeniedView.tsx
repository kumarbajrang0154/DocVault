'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { ShieldAlert, LogOut } from 'lucide-react';

interface AccessDeniedViewProps {
  userEmail?: string | null;
}

export function DocVaultAccessDeniedView({ userEmail }: AccessDeniedViewProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-950 text-zinc-100">
      {/* Background Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-rose-500/20 via-rose-600/10 to-transparent blur-3xl opacity-80"
      />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/20 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
        {/* Shield Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-xl mb-6">
          <ShieldAlert className="h-8 w-8 text-rose-500" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-3">
          Account Not Authorized
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Access Denied
        </h1>

        <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
          The Google account <span className="font-semibold text-zinc-200">{userEmail || 'associated with your session'}</span> isn&apos;t authorized to access DocVault yet.
        </p>

        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          Contact the administrator (<span className="text-zinc-400 font-mono">kumarbajrang325@gmail.com</span>) to have your email address added to the access allowlist.
        </p>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-rose-500 px-6 text-sm font-bold text-white transition-all hover:bg-rose-600 active:scale-98 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out & Try Another Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const AccessDeniedView = DocVaultAccessDeniedView;

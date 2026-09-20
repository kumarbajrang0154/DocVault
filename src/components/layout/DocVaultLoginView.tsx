'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Shield, Lock } from 'lucide-react';

export function DocVaultLoginView() {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-950 text-zinc-100">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/15 via-indigo-600/20 to-emerald-500/15 blur-3xl opacity-80"
      />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center">
        {/* DocVault Shield Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/20 mb-6">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300 mb-3">
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypted Personal Vault</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          DocVault
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Secure document manager with automatic expiry reminders.
        </p>

        {/* Google Authentication Action */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/10 active:scale-98 cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="mt-6 text-[11px] text-zinc-500">
          Only the authorized owner account can access decrypted vault data.
        </p>
      </div>
    </div>
  );
}

export const AdminLoginView = DocVaultLoginView;

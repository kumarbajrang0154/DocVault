'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { Music2, LogOut, ShieldCheck, Menu } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
  onToggleSidebar?: () => void;
}

export function AdminHeader({
  userEmail,
  userName,
  userImage,
  onToggleSidebar,
}: AdminHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin' });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-cyan-500 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Music2 className="h-4 w-4 text-white" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Mood Admin</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </span>
        </Link>
      </div>

      {/* Admin User Profile & Sign Out */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName || 'Admin'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-200">
              {(userName || userEmail || 'A').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              {userName || 'Administrator'}
            </span>
            <span className="text-[11px] text-zinc-400 leading-tight">
              {userEmail}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-300"
          title="Sign out of Admin Portal"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

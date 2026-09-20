'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ShieldCheck, Menu, LogOut, Lock } from 'lucide-react';

interface HeaderProps {
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
  onToggleSidebar?: () => void;
}

export function Header({
  userEmail,
  userName,
  userImage,
  onToggleSidebar,
}: HeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Brand & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              DocVault
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 text-[10px] font-medium text-blue-400">
                Encrypted
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Security Status & User Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Lock className="h-3.5 w-3.5" />
          <span>AES-256 Vault Secure</span>
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="flex items-center gap-2.5">
            {userImage ? (
              // eslint-disable-next-html-element-suppression
              <img
                src={userImage}
                alt={userName || 'User'}
                className="h-8 w-8 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {userEmail?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {userName || 'Vault Owner'}
              </span>
              <span className="text-[10px] text-zinc-400 leading-tight">
                {userEmail}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

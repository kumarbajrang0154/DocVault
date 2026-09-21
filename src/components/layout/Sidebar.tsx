'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Settings,
  History,
  ShieldCheck,
  Lock,
  Users,
  Palette,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
  siteName?: string;
}

export function Sidebar({ isOpen = false, onClose, isAdmin = false, siteName }: SidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: 'All Documents',
      href: '/documents',
      icon: <FileText className="h-4 w-4 text-blue-400" />,
    },
    {
      title: 'Upload Document',
      href: '/documents/upload',
      icon: <UploadCloud className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: 'Settings & Reminders',
      href: '/settings',
      icon: <Settings className="h-4 w-4 text-purple-400" />,
    },
    {
      title: 'Activity Logs',
      href: '/logs',
      icon: <History className="h-4 w-4 text-zinc-400" />,
    },
  ];

  if (isAdmin) {
    NAV_ITEMS.push({
      title: 'User Approvals',
      href: '/admin/users',
      icon: <Users className="h-4 w-4 text-amber-400" />,
    });
    NAV_ITEMS.push({
      title: 'Branding Portal',
      href: '/admin/branding',
      icon: <Palette className="h-4 w-4 text-pink-400" />,
    });
    NAV_ITEMS.push({
      title: 'System Audit Logs',
      href: '/admin/logs',
      icon: <FileSpreadsheet className="h-4 w-4 text-emerald-400" />,
    });
  }

  // Find single best match (longest matching href) to ensure exactly ONE item is active
  const matchingItems = NAV_ITEMS.filter((item) => {
    if (item.href === '/') return pathname === '/';
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  const activeItem = matchingItems.reduce<SidebarItem | null>((best, item) => {
    if (!best) return item;
    return item.href.length > best.href.length ? item : best;
  }, null);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 shrink-0 border-r border-white/10 bg-zinc-950/95 p-4 transition-transform lg:static lg:h-full lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between overflow-y-auto custom-scrollbar">
          <nav aria-label="DocVault Navigation" className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>{siteName ? `${siteName} Vault` : 'Personal Vault'}</span>
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = activeItem?.href === item.href;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-md shadow-blue-950/20'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Security Banner */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-3.5 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 mb-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Files are AES-256 encrypted before Cloudinary upload. Decrypted server-side for authenticated session owners only.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

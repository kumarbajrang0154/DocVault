'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Music, 
  Layers, 
  Globe, 
  ListMusic, 
  Palette, 
  Settings,
  Lock
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS: SidebarItem[] = [
    {
      title: 'Overview',
      href: '/admin',
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === '/admin',
    },
    {
      title: 'Songs',
      href: '/admin/songs',
      icon: <Music className="h-4 w-4" />,
      disabled: true,
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: <Layers className="h-4 w-4" />,
      disabled: true,
    },
    {
      title: 'Languages',
      href: '/admin/languages',
      icon: <Globe className="h-4 w-4" />,
      disabled: true,
    },
    {
      title: 'Playlists',
      href: '/admin/playlists',
      icon: <ListMusic className="h-4 w-4" />,
      disabled: true,
    },
    {
      title: 'Themes',
      href: '/admin/themes',
      icon: <Palette className="h-4 w-4" />,
      disabled: true,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-4 w-4" />,
      disabled: true,
    },
  ];

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
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-white/10 bg-zinc-950/95 p-4 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <nav aria-label="Admin Navigation" className="space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
              Management Portal
            </div>

            {NAV_ITEMS.map((item) => {
              if (item.disabled) {
                return (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-500 opacity-60 cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Lock className="h-3 w-3" />
                      Step 3+
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer note */}
          <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-3 text-left">
            <span className="text-[11px] font-semibold text-zinc-300 block">
              Mood Admin v1.0
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              Foundation Active & Secured
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

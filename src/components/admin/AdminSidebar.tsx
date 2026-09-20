'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Music, 
  UserSquare2,
  DiscAlbum,
  Layers, 
  Globe, 
  ListMusic, 
  Palette, 
  Settings,
  History,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  Compass,
  ListFilter
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
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
    },
    {
      title: 'AI Music Hub',
      href: '/admin/ai',
      icon: <Sparkles className="h-4 w-4 text-purple-400" />,
    },
    {
      title: 'AI URL Import',
      href: '/admin/ai/import',
      icon: <LinkIcon className="h-4 w-4 text-cyan-400" />,
    },
    {
      title: 'AI Discovery',
      href: '/admin/ai/discovery',
      icon: <Compass className="h-4 w-4 text-amber-400" />,
    },
    {
      title: 'AI Review Queue',
      href: '/admin/ai/review',
      icon: <ListFilter className="h-4 w-4 text-emerald-400" />,
    },
    {
      title: 'Songs',
      href: '/admin/songs',
      icon: <Music className="h-4 w-4" />,
    },
    {
      title: 'Artists',
      href: '/admin/artists',
      icon: <UserSquare2 className="h-4 w-4" />,
    },
    {
      title: 'Albums',
      href: '/admin/albums',
      icon: <DiscAlbum className="h-4 w-4" />,
    },
    {
      title: 'Categories (Moods)',
      href: '/admin/categories',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      title: 'Languages',
      href: '/admin/languages',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      title: 'Playlists',
      href: '/admin/playlists',
      icon: <ListMusic className="h-4 w-4" />,
    },
    {
      title: 'Themes',
      href: '/admin/themes',
      icon: <Palette className="h-4 w-4" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: 'Activity Logs',
      href: '/admin/logs',
      icon: <History className="h-4 w-4" />,
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
        <div className="flex flex-col h-full justify-between overflow-y-auto custom-scrollbar">
          <nav aria-label="Admin Navigation" className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Management CMS</span>
            </div>

            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-md shadow-rose-950/20'
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
          <div className="mt-6 rounded-xl border border-white/5 bg-zinc-900/50 p-3 text-left">
            <span className="text-[11px] font-semibold text-zinc-300 block">
              Mood CMS Portal
            </span>
            <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
              ● Live Database Connected
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

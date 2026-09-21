'use client';

import React, { useState } from 'react';
import type { Session } from 'next-auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface SiteBrandingData {
  siteName?: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconEmoji?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  welcomeMessage?: string | null;
  footerText?: string | null;
}

interface AppLayoutProps {
  session: Session;
  branding?: SiteBrandingData | null;
  children: React.ReactNode;
}

export function AppLayout({ session, branding, children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-blue-500/30 selection:text-white">
      <Header
        userEmail={session.user?.email}
        userName={session.user?.name}
        userImage={session.user?.image}
        logoUrl={branding?.logoUrl}
        siteName={branding?.siteName}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isAdmin={session.user?.isAdmin}
          siteName={branding?.siteName}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

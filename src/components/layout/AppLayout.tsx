'use client';

import React, { useState } from 'react';
import type { Session } from 'next-auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  session: Session;
  children: React.ReactNode;
}

export function AppLayout({ session, children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-500/30 selection:text-white">
      <Header
        userEmail={session.user?.email}
        userName={session.user?.name}
        userImage={session.user?.image}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isAdmin={session.user?.isAdmin}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

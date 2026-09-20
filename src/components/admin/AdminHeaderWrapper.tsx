'use client';

import React, { useState } from 'react';
import type { Session } from 'next-auth';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminHeaderWrapperProps {
  session: Session;
  children: React.ReactNode;
}

export function AdminHeaderWrapper({ session, children }: AdminHeaderWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <AdminHeader
        userEmail={session.user?.email}
        userName={session.user?.name}
        userImage={session.user?.image}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

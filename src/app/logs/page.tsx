import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAuth } from '@/lib/authGuard';
import { db } from '@/lib/db';
import { LogsClient } from './LogsClient';

async function PersonalLogsContent() {
  const session = await requireAuth();

  // Strictly scoped to session user id (Personal Log View)
  const logs = await db.activityLog.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const serializableLogs = logs.map((log) => ({
    ...log,
    status: log.status || ('SUCCESS' as const),
    createdAt: log.createdAt.toISOString(),
  }));

  return <LogsClient logs={serializableLogs} />;
}

export default function LogsPage() {
  return (
    <AuthGuard>
      <PersonalLogsContent />
    </AuthGuard>
  );
}

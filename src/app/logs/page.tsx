import React from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { db } from '@/lib/db';
import { History, Shield, Calendar, User } from 'lucide-react';

async function LogsContent() {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <History className="h-7 w-7 text-zinc-400" />
          Activity & Audit Logs
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Detailed security audit history of document uploads, view sessions, metadata edits, and automated reminder alerts.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-12 text-center space-y-2">
          <Shield className="mx-auto h-10 w-10 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No activity logged yet</h3>
          <p className="text-xs text-zinc-500">
            Activity events will appear here as you upload, view, or modify documents.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {logs.map((log) => {
                  const isDelete = log.action.includes('DELETE');
                  const isUpload = log.action.includes('UPLOAD');
                  const isReminder = log.action.includes('REMINDER');

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {log.createdAt.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isUpload
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : isDelete
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                              : isReminder
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">{log.entityType}</td>
                      <td className="p-4 text-zinc-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-zinc-500" /> {log.userEmail}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 text-[11px] max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LogsPage() {
  return (
    <AuthGuard>
      <LogsContent />
    </AuthGuard>
  );
}

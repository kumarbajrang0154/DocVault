'use client';

import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '@/app/admin/actions/logs';
import { Pagination } from '@/components/admin/ui/Pagination';
import { History, ShieldCheck } from 'lucide-react';

interface LogItem {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getActivityLogs({ page, limit: 20 })
      .then((res) => {
        if (isMounted) {
          setLogs(res.items.map((l) => ({ ...l, createdAt: l.createdAt.toString() })));
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to fetch activity logs:', err);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <History className="h-6 w-6 text-purple-400" />
          <span>Admin Activity Logs</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Audit log trail recording all administrator CMS actions.
        </p>
      </div>

      {/* Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin Email</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Entity ID</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-zinc-400 font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{log.adminEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-300 font-semibold">{log.entityType}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500 truncate max-w-[120px]">
                      {log.entityId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-[11px] truncate max-w-xs">
                      {log.details || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

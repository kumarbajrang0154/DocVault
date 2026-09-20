'use client';

import React, { useState } from 'react';
import { History, Shield, Calendar, Eye, Search, Filter } from 'lucide-react';
import { LogDetailModal, ActivityLogRecord } from '@/components/logs/LogDetailModal';

interface LogsClientProps {
  logs: ActivityLogRecord[];
}

export function LogsClient({ logs }: LogsClientProps) {
  const [selectedLog, setSelectedLog] = useState<ActivityLogRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      (log.details && log.details.toLowerCase().includes(query));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <History className="h-7 w-7 text-zinc-400" />
          Personal Activity & Audit Logs
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Your personal security audit history of document uploads, view sessions, metadata edits, and automated alerts.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, entity, or details..."
            className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Filter className="h-3 w-3 text-blue-400" /> Status:
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-950 p-1">
            {(['ALL', 'SUCCESS', 'FAILURE'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? st === 'FAILURE'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : st === 'SUCCESS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-12 text-center space-y-2 shadow-xl">
          <Shield className="mx-auto h-10 w-10 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No activity logs found</h3>
          <p className="text-xs text-zinc-500">
            Activity events will automatically record as you upload, view, or modify documents.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right">View Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">{log.action}</td>
                      <td className="p-4 font-medium text-zinc-300">{log.entityType}</td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 text-[11px] max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          title="View Full Log Detail Payload"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-blue-400" />
                        </button>
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

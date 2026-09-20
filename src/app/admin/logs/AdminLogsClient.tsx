'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Calendar,
  User,
  Eye,
  Search,
  Filter,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { LogDetailModal, ActivityLogRecord } from '@/components/logs/LogDetailModal';

interface UserOption {
  id: string;
  email: string;
  name: string | null;
}

interface AdminLogsClientProps {
  logs: ActivityLogRecord[];
  users: UserOption[];
}

export function AdminLogsClient({ logs, users }: AdminLogsClientProps) {
  const [selectedLog, setSelectedLog] = useState<ActivityLogRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesUser = userFilter === 'ALL' || log.userEmail.toLowerCase() === userFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.entityType.toLowerCase().includes(query) ||
      log.userEmail.toLowerCase().includes(query) ||
      (log.details && log.details.toLowerCase().includes(query));

    return matchesUser && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <FileSpreadsheet className="h-7 w-7 text-emerald-400" />
              Global System Audit Logs
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Cross-system audit record of all user actions, authentication events, metadata updates, and system operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>System Administrator Audit</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, email, entity..."
            className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* User Filter Dropdown */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-400 shrink-0" />
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Users ({users.length})</option>
            {users.map((u) => (
              <option key={u.id} value={u.email}>
                {u.email} {u.name ? `(${u.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Filter className="h-3 w-3 text-emerald-400" /> Status:
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

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-12 text-center space-y-2 shadow-xl">
          <FileSpreadsheet className="mx-auto h-10 w-10 text-zinc-600" />
          <h3 className="text-base font-bold text-white">No system audit logs found</h3>
          <p className="text-xs text-zinc-500">
            System logs will automatically appear as users perform operations in DocVault.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Details Summary</th>
                  <th className="p-4 text-right">Payload</th>
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
                      <td className="p-4 font-mono text-zinc-300">{log.userEmail}</td>
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
                          title="Inspect Full Audit Log Payload"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-emerald-400" />
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

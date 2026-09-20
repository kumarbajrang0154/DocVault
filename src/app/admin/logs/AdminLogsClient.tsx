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
  Loader2,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import {
  LogDetailModal,
  ActivityLogRecord,
  formatLogDetailsSummary,
} from '@/components/logs/LogDetailModal';
import { getMoreAdminLogsAction } from '@/app/actions/logs';

interface UserOption {
  id: string;
  email: string;
  name: string | null;
}

interface AdminLogsClientProps {
  logs: ActivityLogRecord[];
  users: UserOption[];
  currentAdminEmail?: string;
}

export function AdminLogsClient({ logs, users, currentAdminEmail = '' }: AdminLogsClientProps) {
  const [allLogs, setAllLogs] = useState<ActivityLogRecord[]>(logs);
  const [selectedLog, setSelectedLog] = useState<ActivityLogRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(logs.length >= 100);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const res = await getMoreAdminLogsAction(allLogs.length, 50);
      if (res.success && res.logs.length > 0) {
        setAllLogs((prev) => [...prev, ...(res.logs as ActivityLogRecord[])]);
        if (res.logs.length < 50) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (_err) {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredLogs = allLogs.filter((log) => {
    const matchesUser =
      userFilter === 'ALL' || log.userEmail.toLowerCase() === userFilter.toLowerCase();
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

  const isFilteringMyActivity =
    userFilter.toLowerCase() === currentAdminEmail.toLowerCase() && currentAdminEmail !== '';

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

        {/* User Filter Dropdown & Quick "My Activity" Button */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-400 shrink-0" />
          <div className="flex flex-1 items-center gap-1">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Users ({users.length})</option>
              {currentAdminEmail && (
                <option value={currentAdminEmail}>
                  My Activity Only ({currentAdminEmail})
                </option>
              )}
              {users
                .filter((u) => u.email.toLowerCase() !== currentAdminEmail.toLowerCase())
                .map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.email} {u.name ? `(${u.name})` : ''}
                  </option>
                ))}
            </select>

            {currentAdminEmail && (
              <button
                type="button"
                onClick={() =>
                  setUserFilter(isFilteringMyActivity ? 'ALL' : currentAdminEmail)
                }
                title="Quickly filter to your own admin activity logs"
                className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isFilteringMyActivity
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                    : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                My Activity
              </button>
            )}
          </div>
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
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl space-y-0">
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
                  const isCurrentAdmin =
                    currentAdminEmail !== '' &&
                    log.userEmail.toLowerCase() === currentAdminEmail.toLowerCase();

                  return (
                    <tr
                      key={log.id}
                      className={`transition-colors ${
                        isCurrentAdmin ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="p-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                          <span>{log.userEmail}</span>
                          {isCurrentAdmin && (
                            <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.2 text-[9px] font-bold text-blue-300 flex items-center gap-0.5">
                              <UserCheck className="h-2.5 w-2.5" /> You
                            </span>
                          )}
                        </div>
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
                      <td className="p-4 text-zinc-400 text-[11px] max-w-md">
                        <p className="line-clamp-2">{formatLogDetailsSummary(log.details)}</p>
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

          {/* Load More Pagination Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-white/10 bg-zinc-950/80">
            <span className="text-xs text-zinc-400">
              Showing <strong className="text-white">{filteredLogs.length}</strong> of{' '}
              <strong className="text-white">{allLogs.length}</strong> loaded logs
            </span>

            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading Older Logs...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Load More Older Logs</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-zinc-500">
                All available logs loaded.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

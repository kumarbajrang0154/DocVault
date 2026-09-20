'use client';

import React from 'react';
import { X, Calendar, User, ShieldCheck, AlertTriangle, Code, Tag } from 'lucide-react';

export interface ActivityLogRecord {
  id: string;
  userId?: string | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  status: 'SUCCESS' | 'FAILURE';
  createdAt: string | Date;
}

interface LogDetailModalProps {
  log: ActivityLogRecord | null;
  onClose: () => void;
}

export function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  if (!log) return null;

  let formattedDetails = log.details || 'No additional details logged.';
  try {
    if (log.details && (log.details.startsWith('{') || log.details.startsWith('['))) {
      const parsed = JSON.parse(log.details);
      formattedDetails = JSON.stringify(parsed, null, 2);
    }
  } catch (_e) {
    // Keep as raw string if JSON parsing fails
  }

  const isSuccess = log.status === 'SUCCESS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border border-white/15 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                isSuccess
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {isSuccess ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{log.action}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isSuccess
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {log.status}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Audit log event entry details</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Meta Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
              <User className="h-3 w-3 text-blue-400" /> User Email
            </span>
            <p className="font-mono text-white text-[11px] truncate">{log.userEmail}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-purple-400" /> Timestamp
            </span>
            <p className="text-white text-[11px] font-medium">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
              <Tag className="h-3 w-3 text-amber-400" /> Entity Type
            </span>
            <p className="text-white text-[11px] font-semibold">{log.entityType}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
              <Code className="h-3 w-3 text-emerald-400" /> Entity ID
            </span>
            <p className="font-mono text-zinc-300 text-[11px] truncate">{log.entityId || 'N/A'}</p>
          </div>
        </div>

        {/* Formatted Details Payload */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
            Payload & Context Details
          </span>
          <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-4 font-mono text-[11px] text-emerald-300 custom-scrollbar">
            <pre className="whitespace-pre-wrap break-words">{formattedDetails}</pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-xl bg-white/10 border border-white/15 px-4 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

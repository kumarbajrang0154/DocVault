'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Search,
} from 'lucide-react';
import {
  getAuthorizedEmailsAction,
  addAuthorizedEmailAction,
  revokeAuthorizedEmailAction,
} from '@/app/actions/users';

interface AuthorizedEntry {
  id: string;
  email: string;
  addedByAdmin: string;
  addedAt: string | Date;
  hasLoggedIn: boolean;
}

export default function AdminUsersPage() {
  const [entries, setEntries] = useState<AuthorizedEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await getAuthorizedEmailsAction();
      setEntries(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Access denied or failed to load data.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await addAuthorizedEmailAction(newEmail);
      if (res.success) {
        setSuccessMessage(`Successfully added ${newEmail} to the DocVault allowlist.`);
        setNewEmail('');
        await loadData();
      } else {
        setErrorMessage(res.error || 'Failed to authorize email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding email.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) {
      return;
    }

    setRevokingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await revokeAuthorizedEmailAction(id);
      if (res.success) {
        setSuccessMessage(`Revoked access for ${email}.`);
        await loadData();
      } else {
        setErrorMessage(res.error || 'Failed to revoke email.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error revoking email.';
      setErrorMessage(msg);
    } finally {
      setRevokingId(null);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-400" />
              User Access Control
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Manage authorized email allowlist for Google OAuth sign-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Admin Portal Only</span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Email Allowlist Form */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-emerald-400" />
          Authorize New User Email
        </h2>
        <p className="text-xs text-zinc-400">
          Adding an email to the allowlist permits that Google account to sign in to DocVault.
        </p>

        <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="e.g. family.member@gmail.com"
            required
            className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Authorize Account</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Allowlist Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Authorized Accounts</span>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
              {entries.length}
            </span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search allowlist..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center text-xs text-zinc-400">
            No authorized email entries found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Login Status</th>
                    <th className="p-4">Authorized By</th>
                    <th className="p-4">Date Added</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-white">{entry.email}</td>
                      <td className="p-4">
                        {entry.hasLoggedIn ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Signed Up / Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-medium text-amber-400">
                            <Clock className="h-3 w-3" /> Pending First Login
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-zinc-400 text-[11px]">{entry.addedByAdmin}</td>
                      <td className="p-4 text-zinc-400 text-[11px]">
                        {new Date(entry.addedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevoke(entry.id, entry.email)}
                          disabled={revokingId === entry.id}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Revoke Access</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

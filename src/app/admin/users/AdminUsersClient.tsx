'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Search,
  UserCheck,
} from 'lucide-react';
import {
  getUsersListAction,
  approveUserAction,
  rejectUserAction,
  revokeUserAction,
  reconsiderUserAction,
} from '@/app/actions/users';

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isAdmin: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string | Date;
  reviewedAt: string | Date | null;
  reviewedBy: string | null;
}

type TabType = 'pending' | 'approved' | 'rejected';

export function AdminUsersClient() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getUsersListAction();
      if (Array.isArray(res)) {
        setUsers(res as unknown as UserRecord[]);
      } else if (res.success && res.users) {
        setUsers(res.users as unknown as UserRecord[]);
      } else {
        setErrorMessage(res.error || 'Failed to load user access requests.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load user access requests.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getUsersListAction()
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res)) {
          setUsers(res as unknown as UserRecord[]);
        } else if (res.success && res.users) {
          setUsers(res.users as unknown as UserRecord[]);
        } else {
          setErrorMessage(res.error || 'Failed to load user access requests.');
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load user access requests.';
          setErrorMessage(msg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (userId: string, email: string) => {
    setActionUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await approveUserAction(userId);
      if (res.success) {
        setSuccessMessage(`Approved access request for ${email}.`);
        await loadUsers();
      } else {
        setErrorMessage(res.error || 'Failed to approve user.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setErrorMessage(msg);
    } finally {
      setActionUserId(null);
    }
  };

  const handleReject = async (userId: string, email: string) => {
    setActionUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await rejectUserAction(userId);
      if (res.success) {
        setSuccessMessage(`Declined access request for ${email}.`);
        await loadUsers();
      } else {
        setErrorMessage(res.error || 'Failed to reject user.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setErrorMessage(msg);
    } finally {
      setActionUserId(null);
    }
  };

  const handleRevoke = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;

    setActionUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await revokeUserAction(userId);
      if (res.success) {
        setSuccessMessage(`Revoked access for ${email}.`);
        await loadUsers();
      } else {
        setErrorMessage(res.error || 'Failed to revoke user.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setErrorMessage(msg);
    } finally {
      setActionUserId(null);
    }
  };

  const handleReconsider = async (userId: string, email: string) => {
    setActionUserId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await reconsiderUserAction(userId);
      if (res.success) {
        setSuccessMessage(`Moved ${email} back to Pending Requests for review.`);
        await loadUsers();
      } else {
        setErrorMessage(res.error || 'Failed to reconsider user.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed.';
      setErrorMessage(msg);
    } finally {
      setActionUserId(null);
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  const approvedUsers = users.filter((u) => u.status === 'APPROVED');
  const rejectedUsers = users.filter((u) => u.status === 'REJECTED');

  const currentList =
    activeTab === 'pending'
      ? pendingUsers
      : activeTab === 'approved'
      ? approvedUsers
      : rejectedUsers;

  const filteredList = currentList.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
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
              Access Request Portal
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Review, approve, or reject user access requests for DocVault.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
          <span>Admin Controls</span>
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

      {/* Tabs & Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Pending ({pendingUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Approved ({approvedUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Rejected ({rejectedUsers.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-12 text-center text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">No {activeTab} user requests found.</p>
          <p className="text-zinc-500">New sign-ups will automatically appear in Pending Requests.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Requested At</th>
                  <th className="p-4">Reviewed Info</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredList.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-2">
                      {user.image ? (
                        // eslint-disable-next-html-element-suppression
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="h-7 w-7 rounded-full border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{user.name || 'Anonymous User'}</span>
                      {user.isAdmin && (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.2 text-[9px] font-bold text-amber-400">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">{user.email}</td>
                    <td className="p-4 text-zinc-400 text-[11px]">
                      {new Date(user.requestedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-zinc-400 text-[11px]">
                      {user.reviewedAt ? (
                        <span>
                          {new Date(user.reviewedAt).toLocaleDateString()} by {user.reviewedBy || 'admin'}
                        </span>
                      ) : (
                        <span className="text-zinc-600">Pending Review</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(user.id, user.email)}
                              disabled={actionUserId === user.id}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(user.id, user.email)}
                              disabled={actionUserId === user.id}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {activeTab === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(user.id, user.email)}
                            disabled={actionUserId === user.id || user.isAdmin}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Revoke Access</span>
                          </button>
                        )}

                        {activeTab === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleReconsider(user.id, user.email)}
                            disabled={actionUserId === user.id}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 text-xs font-semibold text-amber-400 hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reconsider</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

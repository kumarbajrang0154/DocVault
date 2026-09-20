import React from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAuth } from '@/lib/authGuard';
import { db } from '@/lib/db';
import {
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Calendar,
  Tag,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface DashboardContentProps {
  thresholdDays?: number;
}

async function DashboardContent({ thresholdDays = 30 }: DashboardContentProps) {
  const session = await requireAuth();
  const userId = session.user.id;
  const now = new Date();

  // 1. Fetch counts scoped strictly to logged-in user
  const totalDocs = await db.document.count({
    where: { userId },
  });

  const expiredDocsCount = await db.document.count({
    where: {
      userId,
      expiryDate: {
        not: null,
        lte: now,
      },
    },
  });

  const targetDate30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const targetDate60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const targetDate90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const expiring30Count = await db.document.count({
    where: {
      userId,
      expiryDate: {
        not: null,
        gt: now,
        lte: targetDate30,
      },
    },
  });

  const expiring60Count = await db.document.count({
    where: {
      userId,
      expiryDate: {
        not: null,
        gt: now,
        lte: targetDate60,
      },
    },
  });

  const expiring90Count = await db.document.count({
    where: {
      userId,
      expiryDate: {
        not: null,
        gt: now,
        lte: targetDate90,
      },
    },
  });

  // 2. Fetch expiring soon list scoped strictly to logged-in user
  const selectedTargetDate =
    thresholdDays === 90 ? targetDate90 : thresholdDays === 60 ? targetDate60 : targetDate30;

  const expiringSoonDocs = await db.document.findMany({
    where: {
      userId,
      expiryDate: {
        not: null,
        gt: now,
        lte: selectedTargetDate,
      },
    },
    orderBy: { expiryDate: 'asc' },
  });

  // 3. Fetch 5 most recent documents scoped strictly to logged-in user
  const recentDocs = await db.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-emerald-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Document Vault Dashboard
            </h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Encrypted & Isolated
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Manage your personal identity proofs, insurance policies, and certificates securely.
          </p>
        </div>

        <Link
          href="/documents/upload"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Documents
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalDocs}</span>
            <span className="text-xs text-zinc-500">stored in vault</span>
          </div>
        </div>

        {/* Expiring Soon (30 days) */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Expiring (30 Days)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{expiring30Count}</span>
            <span className="text-xs text-amber-300/70">require attention</span>
          </div>
        </div>

        {/* Expired Documents */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Expired Documents
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{expiredDocsCount}</span>
            <span className="text-xs text-rose-300/70">expired</span>
          </div>
        </div>

        {/* Encryption & Security */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Vault Protection
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-lg font-bold text-emerald-400">AES-256 GCM</span>
            <span className="text-xs text-emerald-300/70">Cloudinary Authenticated</span>
          </div>
        </div>
      </div>

      {/* Expiring Soon Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Expiring Soon</h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
              {expiringSoonDocs.length}
            </span>
          </div>

          {/* Filter Pills (30, 60, 90 days) */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 p-1">
            <Link
              href="/?days=30"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                thresholdDays === 30
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Days ({expiring30Count})
            </Link>
            <Link
              href="/?days=60"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                thresholdDays === 60
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              60 Days ({expiring60Count})
            </Link>
            <Link
              href="/?days=90"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                thresholdDays === 90
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              90 Days ({expiring90Count})
            </Link>
          </div>
        </div>

        {expiringSoonDocs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">
              No documents expiring in the next {thresholdDays} days.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              All your active documents with expiry dates are up to date!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expiringSoonDocs.map((doc) => {
              const daysLeft = doc.expiryDate
                ? Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

              return (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="group rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 transition-all hover:border-amber-500/40 hover:bg-amber-950/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                      {doc.category}
                    </span>
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                      {daysLeft} days left
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {doc.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {doc.expiryDate ? doc.expiryDate.toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 5 Most Recent Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Recent Uploads</h2>
          </div>
          <Link
            href="/documents"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All Documents <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">Your vault is currently empty.</p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Upload your first passport, driver&apos;s license, or insurance policy.
            </p>
            <Link
              href="/documents/upload"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {recentDocs.map((doc) => {
                    const isExpired = doc.expiryDate && doc.expiryDate <= now;
                    const isExpiringSoon =
                      doc.expiryDate &&
                      doc.expiryDate > now &&
                      doc.expiryDate <= targetDate30;

                    return (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <Link
                            href={`/documents/${doc.id}`}
                            className="hover:text-blue-400 transition-colors"
                          >
                            {doc.title}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-400">
                            {doc.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.length > 0 ? (
                              doc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400 flex items-center gap-0.5"
                                >
                                  <Tag className="h-2.5 w-2.5" /> {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-600 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {doc.expiryDate ? (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                isExpired
                                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                  : isExpiringSoon
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {doc.expiryDate.toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">No Expiry</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/documents/${doc.id}`}
                            className="inline-flex h-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2.5 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            View Detail
                          </Link>
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
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = params?.days ? parseInt(params.days, 10) : 30;

  return (
    <AuthGuard>
      <DashboardContent thresholdDays={days} />
    </AuthGuard>
  );
}

import React from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { requireAuth } from '@/lib/authGuard';
import { db } from '@/lib/db';
import {
  FileText,
  Search,
  Plus,
  Tag,
  Calendar,
  Filter,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'ID Proof',
  'Education',
  'Insurance',
  'Financial',
  'Medical',
  'Vehicle',
  'Other',
];

const EXPIRY_STATUSES = [
  'All',
  'Active',
  'Expiring Soon',
  'Expired',
  'No Expiry',
];

interface DocumentsContentProps {
  search?: string;
  category?: string;
  status?: string;
}

async function DocumentsContent({
  search = '',
  category = 'All',
  status = 'All',
}: DocumentsContentProps) {
  const session = await requireAuth();
  const userId = session.user.id;
  const now = new Date();
  const target30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Construct Prisma WHERE clause, strictly scoped to session.user.id
  const whereClause: Record<string, unknown> = {
    userId,
  };

  if (category && category !== 'All') {
    whereClause.category = category;
  }

  if (search.trim()) {
    const query = search.trim();
    whereClause.AND = [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
    ];
  }

  if (status === 'Expired') {
    whereClause.expiryDate = { not: null, lte: now };
  } else if (status === 'Expiring Soon') {
    whereClause.expiryDate = { not: null, gt: now, lte: target30Days };
  } else if (status === 'Active') {
    whereClause.OR = [
      { expiryDate: null },
      { expiryDate: { gt: target30Days } },
    ];
  } else if (status === 'No Expiry') {
    whereClause.expiryDate = null;
  }

  const documents = await db.document.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-7 w-7 text-blue-400" />
            All Documents
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Search, filter, and manage your encrypted document vault.
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

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5 space-y-4 shadow-xl">
        <form method="GET" action="/documents" className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by title, notes, or tags..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="h-10 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
            >
              Search
            </button>
            {(search || category !== 'All' || status !== 'All') && (
              <Link
                href="/documents"
                className="h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                Clear Filters
              </Link>
            )}
          </div>
        </form>

        {/* Category Pills */}
        <div className="space-y-2 border-t border-white/5 pt-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-blue-400" /> Category Filter:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = (category || 'All') === cat;
              const queryParams = new URLSearchParams();
              if (search) queryParams.set('search', search);
              if (cat !== 'All') queryParams.set('category', cat);
              if (status !== 'All') queryParams.set('status', status);

              const queryString = queryParams.toString();
              const targetUrl = queryString ? `/documents?${queryString}` : '/documents';

              return (
                <Link
                  key={cat}
                  href={targetUrl}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status Pills */}
        <div className="space-y-2 border-t border-white/5 pt-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-amber-400" /> Expiry Status Filter:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EXPIRY_STATUSES.map((st) => {
              const isSelected = (status || 'All') === st;
              const queryParams = new URLSearchParams();
              if (search) queryParams.set('search', search);
              if (category !== 'All') queryParams.set('category', category);
              if (st !== 'All') queryParams.set('status', st);

              const queryString = queryParams.toString();
              const targetUrl = queryString ? `/documents?${queryString}` : '/documents';

              return (
                <Link
                  key={st}
                  href={targetUrl}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {st}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Documents Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Showing <strong className="text-white">{documents.length}</strong> document(s)</span>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-zinc-900/40 p-12 text-center space-y-3">
            <FileText className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">No matching documents found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search keywords or clearing active category and expiry filters.
            </p>
            <Link
              href="/documents"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {documents.map((doc) => {
                    const isExpired = doc.expiryDate && doc.expiryDate <= now;
                    const isExpiringSoon =
                      doc.expiryDate &&
                      doc.expiryDate > now &&
                      doc.expiryDate <= target30Days;

                    return (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">
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
                          {doc.expiryDate ? doc.expiryDate.toLocaleDateString() : 'No Expiry'}
                        </td>
                        <td className="p-4">
                          {doc.expiryDate ? (
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isExpired
                                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                                  : isExpiringSoon
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {isExpired
                                ? 'EXPIRED'
                                : isExpiringSoon
                                ? 'EXPIRING SOON'
                                : 'ACTIVE'}
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400">
                              PERMANENT
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/documents/${doc.id}`}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3.5 w-3.5" />
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

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthGuard>
      <DocumentsContent
        search={params.search}
        category={params.category}
        status={params.status}
      />
    </AuthGuard>
  );
}

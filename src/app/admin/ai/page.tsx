import React from 'react';
import Link from 'next/link';
import { requireAdmin } from '@/lib/adminAuth';
import { db } from '@/lib/db';
import { 
  Sparkles, 
  Compass, 
  ListFilter, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { getAIDashboardStatsAction } from '@/app/admin/actions/ai';

export default async function AIAdminHubPage() {
  await requireAdmin();
  const stats = await getAIDashboardStatsAction();

  const [languages, categories] = await Promise.all([
    db.language.findMany({ where: { isActive: true } }),
    db.category.findMany({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/10 p-2 border border-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Music Assistant & Discovery</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Intelligent metadata extraction, automated release discovery, language & mood classification, and duplicate detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai/import"
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-950/40 hover:bg-purple-500 transition-all"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Import URL</span>
          </Link>

          <Link
            href="/admin/ai/discovery"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/5 transition-all"
          >
            <Compass className="h-4 w-4 text-amber-400" />
            <span>New Music Discovery</span>
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/ai/import"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 hover:border-purple-500/40 hover:bg-zinc-900/90 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400 border border-cyan-500/20">
              <LinkIcon className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">AI Music URL Import</h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
            Paste a YouTube URL to extract metadata, classify language and mood, and review before adding to CMS.
          </p>
        </Link>

        <Link
          href="/admin/ai/discovery"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 hover:border-amber-500/40 hover:bg-zinc-900/90 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">New Music Discovery</h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
            Automated candidates discovery from authorized releases matching canonical Mood preferences.
          </p>
        </Link>

        <Link
          href="/admin/ai/review"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 hover:border-emerald-500/40 hover:bg-zinc-900/90 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20">
              <ListFilter className="h-6 w-6" />
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="mt-4 text-sm font-bold text-white">AI Review Queue</h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
            Organized review queue with confidence indicators, duplicate alerts, and batch approval toolbar.
          </p>
        </Link>
      </div>

      {/* AI Dashboard Widgets */}
      <div>
        <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <span>AI Assistant Metrics & Queue</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <span className="text-xs text-zinc-400 block font-medium">New Candidates</span>
            <span className="text-2xl font-bold text-white mt-1 block">{stats.newDiscoveries}</span>
            <span className="text-[10px] text-zinc-500 mt-1 block">Awaiting admin review</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 block font-medium">High Confidence</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{stats.highConfidence}</span>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">90%+ AI Confidence</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 block font-medium">Needs Review</span>
              <HelpCircle className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{stats.needsReview}</span>
            <span className="text-[10px] text-amber-500/80 mt-1 block">Manual check required</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 block font-medium">Duplicates Risk</span>
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">{stats.possibleDuplicates}</span>
            <span className="text-[10px] text-rose-500/80 mt-1 block">Matches existing tracks</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <span className="text-xs text-zinc-400 block font-medium">Approved Today</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">{stats.approvedToday}</span>
            <span className="text-[10px] text-purple-500/80 mt-1 block">Published to Mood</span>
          </div>
        </div>
      </div>

      {/* AI Daily Music Brief */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>Today&apos;s Discovery Brief</span>
        </h2>
        
        {stats.newDiscoveries === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No new discoveries pending in the queue yet. Click <strong className="text-zinc-300">New Music Discovery</strong> to scan for candidate releases or paste a URL in <strong className="text-zinc-300">Import URL</strong>.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Found <strong className="text-purple-400">{stats.newDiscoveries} new release candidates</strong>. 
              {stats.highConfidence > 0 && ` ${stats.highConfidence} tracks have 90%+ confidence and are ready for 1-click batch approval.`}
              {stats.possibleDuplicates > 0 && ` ${stats.possibleDuplicates} potential duplicates detected requiring verification.`}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {stats.languageBreakdown.map((item) => (
                <div
                  key={item.languageName}
                  className="rounded-xl border border-white/5 bg-zinc-950/60 px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-2"
                >
                  <span className="font-semibold">{item.languageName}:</span>
                  <span className="rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/admin/ai/review"
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-all"
              >
                Review New Music Queue ({stats.newDiscoveries})
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Active System Configurations */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Active Database Languages & Categories Engine
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 text-xs text-zinc-400">
          <div>
            <span className="font-semibold text-zinc-300 block mb-1">
              Active Canonical Languages ({languages.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <span key={l.id} className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                  {l.name} ({l.code})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-semibold text-zinc-300 block mb-1">
              Active Canonical Categories/Moods ({categories.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <span key={c.id} className="rounded-lg bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

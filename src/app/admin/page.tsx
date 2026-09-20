import React from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/app/admin/actions/logs';
import { 
  Music2, 
  Users, 
  Disc, 
  Layers, 
  Globe, 
  ListMusic, 
  History,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import { getAIDashboardStatsAction } from '@/app/admin/actions/ai';
import { Sparkles } from 'lucide-react';

export default async function AdminDashboardPage() {
  const [stats, aiStats] = await Promise.all([
    getDashboardStats(),
    getAIDashboardStatsAction(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-purple-950/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Database Connected CMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Admin Portal Overview
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Manage catalog, mood categories, themes, AI music discovery, and application configurations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/ai"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-950/40 hover:bg-purple-500 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Music Hub</span>
            </Link>

            <Link
              href="/admin/songs"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-colors"
            >
              <Music2 className="h-4 w-4" />
              <span>Add New Song</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Assistant Widget Card */}
      <div className="rounded-3xl border border-purple-500/20 bg-purple-950/10 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">AI Music Assistant & Release Discovery</h2>
          </div>
          <Link href="/admin/ai" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
            <span>Open AI Hub</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
            <span className="text-zinc-400 block text-[11px]">New Discoveries</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{aiStats.newDiscoveries}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
            <span className="text-zinc-400 block text-[11px]">Needs Review</span>
            <span className="text-xl font-bold text-amber-400 mt-0.5 block">{aiStats.needsReview}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
            <span className="text-zinc-400 block text-[11px]">High Confidence</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{aiStats.highConfidence}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
            <span className="text-zinc-400 block text-[11px]">Duplicates Risk</span>
            <span className="text-xl font-bold text-rose-400 mt-0.5 block">{aiStats.possibleDuplicates}</span>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-3">
            <span className="text-zinc-400 block text-[11px]">Approved Today</span>
            <span className="text-xl font-bold text-purple-400 mt-0.5 block">{aiStats.approvedToday}</span>
          </div>
        </div>
      </div>

      {/* Real Analytics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        
        {/* Songs Card */}
        <Link 
          href="/admin/songs" 
          className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md hover:border-rose-500/40 transition-all group"
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <Music2 className="h-5 w-5" />
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {stats.publishedSongs} Live
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-rose-400 transition-colors">
            {stats.totalSongs}
          </p>
          <span className="mt-1 text-xs text-zinc-400 block font-medium">Total Songs</span>
        </Link>

        {/* Artists Card */}
        <Link 
          href="/admin/artists" 
          className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md hover:border-purple-500/40 transition-all group"
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-purple-400 transition-colors">
            {stats.totalArtists}
          </p>
          <span className="mt-1 text-xs text-zinc-400 block font-medium">Total Artists</span>
        </Link>

        {/* Albums Card */}
        <Link 
          href="/admin/albums" 
          className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md hover:border-cyan-400/40 transition-all group"
        >
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <Disc className="h-5 w-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-cyan-400 transition-colors">
            {stats.totalAlbums}
          </p>
          <span className="mt-1 text-xs text-zinc-400 block font-medium">Total Albums</span>
        </Link>

        {/* Categories / Moods Card */}
        <Link 
          href="/admin/categories" 
          className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-md hover:border-amber-400/40 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Layers className="h-5 w-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors">
            {stats.totalCategories}
          </p>
          <span className="mt-1 text-xs text-zinc-400 block font-medium">Mood Categories</span>
        </Link>

      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          href="/admin/languages" 
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-4 backdrop-blur-sm hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{stats.totalLanguages} Active Languages</p>
              <p className="text-[11px] text-zinc-400">Multi-lingual music catalog</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500" />
        </Link>

        <Link 
          href="/admin/playlists" 
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-4 backdrop-blur-sm hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ListMusic className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{stats.totalPlaylists} Curated Playlists</p>
              <p className="text-[11px] text-zinc-400">Admin curated collections</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500" />
        </Link>

        <Link 
          href="/admin/logs" 
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900/40 p-4 backdrop-blur-sm hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Activity Logs</p>
              <p className="text-[11px] text-zinc-400">Audit trail & history</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-zinc-500" />
        </Link>
      </div>

      {/* Recent Activity Log Stream */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Recent CMS Activity</h2>
          </div>
          <Link href="/admin/logs" className="text-xs text-rose-400 hover:underline">
            View All Logs
          </Link>
        </div>

        {stats.recentActivity.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No activity recorded yet. Perform actions in the CMS to populate the log.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-[10px]">
                    {log.action.slice(0, 3)}
                  </span>
                  <div>
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-zinc-400 ml-2">[{log.entityType}]</span>
                    {log.details && (
                      <span className="text-zinc-500 block text-[11px] truncate max-w-md">
                        {log.details}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-zinc-500 text-[11px]">
                  <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

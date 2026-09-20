'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Loader2, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ExternalLink,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  runDiscoveryAction, 
  approveDiscoveryAction, 
  batchApproveDiscoveryAction, 
  ignoreDiscoveryAction 
} from '@/app/admin/actions/ai';
import { getConfidenceBadge } from '@/lib/ai/config';

export interface AIDiscoveryItemData {
  id: string;
  sourceUrl: string;
  sourcePlatform: string;
  title: string;
  artistName: string;
  albumName?: string | null;
  thumbnailUrl?: string | null;
  duration?: number;
  publishedAt?: string | null;
  languageId?: string | null;
  categoryId?: string | null;
  confidence: number;
  duplicateStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AIDiscoveryClientProps {
  initialItems: AIDiscoveryItemData[];
  languages: Array<{ id: string; name: string; code: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function AIDiscoveryClient({ initialItems, languages, categories }: AIDiscoveryClientProps) {
  const [items, setItems] = useState<AIDiscoveryItemData[]>(initialItems);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('NEW');
  const [searchQueryInput, setSearchQueryInput] = useState<string>('new music 2026');

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRunScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsScanning(true);
    setMessage(null);

    try {
      const res = await runDiscoveryAction(searchQueryInput);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Scan complete! Found ${res.count} candidate tracks.`,
        });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: res.error || 'Scan failed.' });
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: (err as Error).message || 'Error running scan.' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await approveDiscoveryAction(id);
      if (res.success) {
        setItems(items.map((i) => (i.id === id ? { ...i, status: 'APPROVED' } : i)));
        setMessage({ type: 'success', text: 'Song approved and added to Mood catalog!' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to approve.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error approving track.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIgnore = async (id: string) => {
    setIsProcessing(true);
    try {
      await ignoreDiscoveryAction(id);
      setItems(items.map((i) => (i.id === id ? { ...i, status: 'IGNORED' } : i)));
    } catch {
      // Ignore
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await batchApproveDiscoveryAction(selectedIds);
      if (res.success && res.summary) {
        setMessage({
          type: 'success',
          text: `Batch summary: ${res.summary.approvedCount} approved, ${res.summary.skippedCount} skipped out of ${res.summary.total} selected.`,
        });
        setItems(
          items.map((i) => (selectedIds.includes(i.id) ? { ...i, status: 'APPROVED' } : i))
        );
        setSelectedIds([]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Error processing batch approval.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredItems = items.filter((item) => {
    if (selectedLanguage !== 'ALL' && item.languageId !== selectedLanguage) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    return true;
  });

  const selectAll = () => {
    const ids = filteredItems.filter((i) => i.status === 'NEW').map((i) => i.id);
    setSelectedIds(ids);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-2 border border-amber-500/20 text-amber-400">
              <Compass className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI New Music Discovery</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Scan official release feeds, classify candidate tracks, verify duplicate status, and approve to Mood catalog.
          </p>
        </div>

        {/* Scan Bar */}
        <form onSubmit={handleRunScan} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQueryInput}
            onChange={(e) => setSearchQueryInput(e.target.value)}
            placeholder="Scan keywords (e.g., new hindi songs)"
            className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isScanning}
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Scan New Music</span>
          </button>
        </form>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`rounded-2xl border p-4 text-xs font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['NEW', 'APPROVED', 'IGNORED', 'ALL'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedStatus === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {st === 'NEW' ? 'New Candidates' : st === 'APPROVED' ? 'Added' : st === 'IGNORED' ? 'Ignored' : 'All'}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white"
            >
              <option value="ALL">All Languages</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Actions Toolbar */}
        {selectedStatus === 'NEW' && filteredItems.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-zinc-400 hover:text-white flex items-center gap-1.5"
              >
                <CheckSquare className="h-4 w-4 text-amber-400" />
                <span>Select All New ({filteredItems.length})</span>
              </button>
              {selectedIds.length > 0 && (
                <span className="text-zinc-500">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBatchApprove}
                disabled={isProcessing}
                className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Approve Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Discovery Items List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center text-xs text-zinc-500">
          No discovery candidates match the selected filters. Click <strong className="text-zinc-300">Scan New Music</strong> above to scan YouTube for candidate releases.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const badge = getConfidenceBadge(item.confidence);
            const isSelected = selectedIds.includes(item.id);
            const langObj = languages.find((l) => l.id === item.languageId);
            const catObj = categories.find((c) => c.id === item.categoryId);

            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl border bg-zinc-900/80 p-4 space-y-3 transition-all ${
                  isSelected ? 'border-amber-500/50 bg-amber-950/20' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Select Checkbox & Status */}
                <div className="flex items-center justify-between">
                  {item.status === 'NEW' ? (
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-amber-400" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                    {item.confidence}% AI
                  </span>
                </div>

                {/* Track Media */}
                <div className="flex gap-3">
                  <img
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                  <div className="overflow-hidden space-y-1">
                    <h3 className="text-xs font-bold text-white truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate">{item.artistName}</p>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {langObj && <span className="text-emerald-400 font-medium">{langObj.name}</span>}
                      {catObj && <span className="text-purple-400 font-medium">• {catObj.name}</span>}
                    </div>
                  </div>
                </div>

                {/* Duplicate Badge */}
                {item.duplicateStatus !== 'NONE' && (
                  <div className="rounded-lg bg-amber-500/10 p-2 text-[10px] text-amber-300 flex items-center gap-1.5 border border-amber-500/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                    <span>Duplicate Risk: {item.duplicateStatus}</span>
                  </div>
                )}

                {/* Actions */}
                {item.status === 'NEW' && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleIgnore(item.id)}
                        disabled={isProcessing}
                        className="text-zinc-500 hover:text-rose-400 text-[11px]"
                      >
                        Ignore
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        disabled={isProcessing}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add to Mood</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

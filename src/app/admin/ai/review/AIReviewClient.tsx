'use client';

import React, { useState } from 'react';
import { 
  ListFilter, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { getConfidenceBadge, AI_CONFIG } from '@/lib/ai/config';
import { approveDiscoveryAction, ignoreDiscoveryAction } from '@/app/admin/actions/ai';

export interface AIReviewItem {
  id: string;
  sourceUrl: string;
  sourcePlatform: string;
  title: string;
  artistName: string;
  albumName?: string | null;
  thumbnailUrl?: string | null;
  duration?: number;
  confidence: number;
  duplicateStatus: string;
  status: string;
  languageId?: string | null;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AIReviewClientProps {
  discoveryItems: AIReviewItem[];
  importRecords: unknown[];
  languages: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function AIReviewClient({ discoveryItems, languages, categories }: AIReviewClientProps) {
  const [activeTab, setActiveTab] = useState<string>('NEEDS_REVIEW');
  const [items, setItems] = useState<AIReviewItem[]>(discoveryItems);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await approveDiscoveryAction(id);
      if (res.success) {
        setItems(items.map((i) => (i.id === id ? { ...i, status: 'APPROVED' } : i)));
      }
    } catch {
      // Ignore
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

  const filteredItems = items.filter((item) => {
    if (activeTab === 'HIGH_CONFIDENCE') return item.status === 'NEW' && item.confidence >= AI_CONFIG.CONFIDENCE_HIGH;
    if (activeTab === 'NEEDS_REVIEW') return item.status === 'NEW' && item.confidence < AI_CONFIG.CONFIDENCE_HIGH;
    if (activeTab === 'DUPLICATE') return item.duplicateStatus !== 'NONE';
    if (activeTab === 'APPROVED') return item.status === 'APPROVED';
    if (activeTab === 'IGNORED') return item.status === 'IGNORED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 text-emerald-400">
            <ListFilter className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Review Queue</h1>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Review and approve AI-analyzed candidate tracks with confidence thresholds and duplicate warnings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'NEEDS_REVIEW', label: 'Needs Review (<90%)', icon: HelpCircle, color: 'text-amber-400' },
          { id: 'HIGH_CONFIDENCE', label: 'High Confidence (90%+)', icon: CheckCircle2, color: 'text-emerald-400' },
          { id: 'DUPLICATE', label: 'Possible Duplicates', icon: AlertTriangle, color: 'text-rose-400' },
          { id: 'APPROVED', label: 'Approved', icon: CheckCircle2, color: 'text-purple-400' },
          { id: 'ALL', label: 'All Items', icon: ListFilter, color: 'text-zinc-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center text-xs text-zinc-500">
          No queue items found in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const badge = getConfidenceBadge(item.confidence);
            const langObj = languages.find((l) => l.id === item.languageId);
            const catObj = categories.find((c) => c.id === item.categoryId);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'}
                    alt={item.title}
                    className="h-14 w-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {item.confidence}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{item.artistName}</p>
                    <div className="flex items-center gap-2 text-[10px] mt-1">
                      {langObj && <span className="text-emerald-400 font-semibold">{langObj.name}</span>}
                      {catObj && <span className="text-purple-400 font-semibold">• {catObj.name}</span>}
                      {item.duplicateStatus !== 'NONE' && (
                        <span className="text-amber-400 font-semibold">• Duplicate: {item.duplicateStatus}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {item.status === 'NEW' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleIgnore(item.id)}
                        disabled={isProcessing}
                        className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700"
                      >
                        Ignore
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        disabled={isProcessing}
                        className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 shadow-md shadow-purple-950/40 flex items-center gap-1"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Approve</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

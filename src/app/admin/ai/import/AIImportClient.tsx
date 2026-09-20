'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Link as LinkIcon, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Edit3
} from 'lucide-react';
import { analyzeUrlAction, approveImportAction, rejectImportAction } from '@/app/admin/actions/ai';
import { getConfidenceBadge } from '@/lib/ai/config';
import { Modal } from '@/components/admin/ui/Modal';

interface AIImportClientProps {
  languages: Array<{ id: string; name: string; code: string }>;
  categories: Array<{ id: string; name: string }>;
}

export interface AIImportAnalysisData {
  importRecord?: { id: string };
  metadata?: { sourceUrl: string; thumbnailUrl: string; title: string; channelTitle: string };
  classification?: { title: string; artistName: string; albumName?: string; languageId: string; categoryId: string; confidence: number; description?: string; reasoning?: string };
  duplicateResult?: { duplicateStatus: string; similarity: number; matchingSongTitle?: string; matchingArtistName?: string };
}

export function AIImportClient({ languages, categories }: AIImportClientProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AIImportAnalysisData | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artistName: '',
    albumName: '',
    languageId: '',
    categoryId: '',
    audioUrl: '',
    coverImageUrl: '',
    description: '',
    isDownloadable: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setSuccessMessage(null);
    setAnalysisData(null);

    try {
      const res = await analyzeUrlAction(urlInput);
      if (res.success && res.classification && res.metadata) {
        setAnalysisData(res);
        setFormData({
          title: res.classification.title,
          artistName: res.classification.artistName,
          albumName: res.classification.albumName || 'Single',
          languageId: res.classification.languageId,
          categoryId: res.classification.categoryId,
          audioUrl: res.metadata.sourceUrl,
          coverImageUrl: res.metadata.thumbnailUrl,
          description: res.classification.description || '',
          isDownloadable: true,
        });
      } else {
        setError(res.error || 'Failed to analyze URL.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while analyzing the URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!analysisData?.importRecord?.id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await approveImportAction(analysisData.importRecord.id, formData);
      if (res.success) {
        setSuccessMessage(`Song '${formData.title}' successfully published to Mood database!`);
        setAnalysisData(null);
        setUrlInput('');
      } else {
        setError(res.error || 'Failed to approve song.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Error publishing song.');
    } finally {
      setIsSubmitting(false);
      setIsEditModalOpen(false);
    }
  };

  const handleReject = async () => {
    if (!analysisData?.importRecord?.id) return;
    setIsSubmitting(true);
    try {
      await rejectImportAction(analysisData.importRecord.id);
      setAnalysisData(null);
      setUrlInput('');
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const badge = analysisData?.classification?.confidence !== undefined ? getConfidenceBadge(analysisData.classification.confidence) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/20 text-cyan-400">
            <LinkIcon className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Music URL Import Assistant</h1>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Paste a YouTube music URL to extract metadata, run AI classification, verify duplicate status, and review before adding to CMS.
        </p>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleAnalyze} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 space-y-4">
        <label className="block text-xs font-semibold text-zinc-300">
          Paste Supported YouTube Music URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            required
            className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !urlInput.trim()}
            className="rounded-xl bg-cyan-600 px-6 py-3 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        </div>
        <span className="text-[11px] text-zinc-500 block">
          * Note: YouTube Data API extracts metadata only. Legal streaming rights remain enforced.
        </span>
      </form>

      {/* Success Notification */}
      {successMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-medium text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI Analysis Review Screen */}
      {analysisData && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">AI Classification Review</h2>
            </div>
            {badge && (
              <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${badge.color}`}>
                {badge.label} ({analysisData.classification?.confidence ?? 0}%)
              </span>
            )}
          </div>

          {/* Duplicate Alert */}
          {analysisData.duplicateResult?.duplicateStatus && analysisData.duplicateResult.duplicateStatus !== 'NONE' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>
                  {analysisData.duplicateResult.duplicateStatus === 'MATCH' ? 'Duplicate Song Match Found!' : 'Possible Duplicate Detected!'}
                </span>
              </div>
              <p>
                Existing Track in CMS: <strong>{analysisData.duplicateResult.matchingSongTitle}</strong> by <strong>{analysisData.duplicateResult.matchingArtistName}</strong> ({analysisData.duplicateResult.similarity}% similarity).
              </p>
            </div>
          )}

          {/* Song Card Preview */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <img
                src={analysisData.metadata?.thumbnailUrl || ''}
                alt={analysisData.classification?.title || ''}
                className="w-full aspect-video sm:aspect-square object-cover rounded-xl border border-white/10 shadow-lg"
              />
              <a
                href={analysisData.metadata?.sourceUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-[11px] text-cyan-400 hover:underline flex items-center justify-center gap-1"
              >
                <span>View Source Track</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="sm:col-span-2 space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Song Title</span>
                <span className="text-base font-bold text-white">{formData.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Artist</span>
                  <span className="font-semibold text-zinc-200">{formData.artistName}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Album</span>
                  <span className="font-semibold text-zinc-200">{formData.albumName}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Language</span>
                  <span className="font-semibold text-emerald-400">
                    {languages.find((l) => l.id === formData.languageId)?.name || 'Language'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Mood / Category</span>
                  <span className="font-semibold text-purple-400">
                    {categories.find((c) => c.id === formData.categoryId)?.name || 'Category'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">AI Reasoning</span>
                <p className="text-zinc-400 italic bg-zinc-950/60 p-2.5 rounded-lg border border-white/5">
                  &quot;{analysisData.classification?.reasoning}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-all flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4 text-cyan-400" />
              <span>Edit Metadata</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 shadow-lg shadow-purple-950/40 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Approve & Add to Mood</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit AI Classification Metadata"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Song Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Artist Name</label>
              <input
                type="text"
                value={formData.artistName}
                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Album Name</label>
              <input
                type="text"
                value={formData.albumName}
                onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Language</label>
                <select
                  value={formData.languageId}
                  onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Category / Mood</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

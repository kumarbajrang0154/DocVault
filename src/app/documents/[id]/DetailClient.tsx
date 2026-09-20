'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { updateDocumentAction, deleteDocumentAction } from '@/app/actions/documents';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Modal } from '@/components/admin/ui/Modal';

interface DocumentDetailClientProps {
  document: {
    id: string;
    title: string;
    category: string;
    tags: string[];
    notes: string | null;
    fileKey: string;
    fileType: string;
    expiryDate: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

const CATEGORIES = [
  'ID Proof',
  'Education',
  'Insurance',
  'Financial',
  'Medical',
  'Vehicle',
  'Other',
];

export function DocumentDetailClient({ document: doc }: DocumentDetailClientProps) {
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(doc.title);
  const [category, setCategory] = useState(doc.category);
  const [tags, setTags] = useState(doc.tags.join(', '));
  const [notes, setNotes] = useState(doc.notes || '');
  const [expiryDate, setExpiryDate] = useState(
    doc.expiryDate ? doc.expiryDate.split('T')[0] : ''
  );

  const [editError, setEditError] = useState<string | null>(null);

  const isPdf = doc.fileType.toLowerCase().includes('pdf');
  const now = new Date();
  const expiry = doc.expiryDate ? new Date(doc.expiryDate) : null;
  const isExpired = expiry && expiry <= now;
  const daysLeft = expiry
    ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setEditError('Title is required');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await updateDocumentAction(doc.id, {
        title,
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes,
        expiryDate: expiryDate || null,
      });

      if (res.success) {
        setIsEditOpen(false);
        router.refresh();
      } else {
        setEditError(res.error || 'Failed to update metadata.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed.';
      setEditError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteDocumentAction(doc.id);
      if (res.success) {
        router.push('/documents');
      }
    } catch (err) {
      console.error('Delete document failed:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const fileApiUrl = `/api/documents/${doc.id}/file`;
  const downloadUrl = `${fileApiUrl}?download=true`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                {doc.category}
              </span>
              {expiry && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    isExpired
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      : daysLeft && daysLeft <= 30
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {isExpired ? 'EXPIRED' : `${daysLeft} DAYS LEFT`}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {doc.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={downloadUrl}
            download
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </a>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Metadata</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata Cards */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-3">
              Document Information
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block">Category</span>
                <span className="font-semibold text-white">{doc.category}</span>
              </div>

              <div>
                <span className="text-zinc-500 block">Expiry Date</span>
                <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'Permanent (No Expiry)'}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.length > 0 ? (
                    doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-zinc-300 flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3 text-purple-400" /> {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-600">No tags added</span>
                  )}
                </div>
              </div>

              {doc.notes && (
                <div>
                  <span className="text-zinc-500 block">Notes</span>
                  <p className="text-zinc-300 bg-zinc-950/60 rounded-xl p-3 border border-white/5 mt-1 leading-relaxed">
                    {doc.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-3 text-[11px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-5 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>AES-256 Decrypted Stream</span>
            </div>
            <p className="text-emerald-300/80 leading-relaxed text-[11px]">
              This preview is streamed live after server-side decryption. No decrypted files or R2 URLs are written to public storage.
            </p>
          </div>
        </div>

        {/* Right Column: Secure Decrypted Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-blue-400" /> Decrypted Document Preview
            </h2>
            <a
              href={downloadUrl}
              download
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Direct Download
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-2 sm:p-4 min-h-[600px] flex items-center justify-center shadow-2xl">
            {isPdf ? (
              <iframe
                src={fileApiUrl}
                className="w-full h-[650px] rounded-2xl border border-white/10 bg-zinc-900"
                title={doc.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4">
                {/* eslint-disable-next-html-element-suppression */}
                <img
                  src={fileApiUrl}
                  alt={doc.title}
                  className="max-h-[650px] w-auto max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Metadata Modal */}
      {isEditOpen && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Document Metadata">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
                {editError}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="h-9 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Document"
          message={`Are you sure you want to permanently delete "${doc.title}"? This will remove the encrypted file from Cloudflare R2 and delete its record from DocVault.`}
          confirmLabel="Yes, Delete Permanently"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  FileText,
  ArrowLeft,
  Lock,
  Tag,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { uploadDocumentAction } from '@/app/actions/documents';

const CATEGORIES = [
  'ID Proof',
  'Education',
  'Insurance',
  'Financial',
  'Medical',
  'Vehicle',
  'Other',
];

export default function DocumentUploadPage() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('Selected file exceeds the 15MB size limit.');
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);

      // Auto fill title if empty
      if (!title) {
        const autoTitle = file.name.replace(/\.[0-9a-z]+$/i, '').replace(/[-_]/g, ' ');
        setTitle(autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('notes', notes);
      if (expiryDate) {
        formData.append('expiryDate', expiryDate);
      }

      const res = await uploadDocumentAction(formData);

      if (res.success && res.documentId) {
        setSuccessMessage('Document uploaded and encrypted successfully!');
        setTimeout(() => {
          router.push(`/documents/${res.documentId}`);
        }, 1000);
      } else {
        setErrorMessage(res.error || 'Upload failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <UploadCloud className="h-6 w-6 text-emerald-400" />
              Upload Document
            </h1>
            <p className="text-xs text-zinc-400">
              Files are AES-256 encrypted server-side before R2 private storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Lock className="h-3.5 w-3.5" />
          <span>AES-256 Encrypted</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Document File (PDF or Image, max 15MB) <span className="text-rose-400">*</span>
            </label>

            <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-zinc-950/60 p-6 text-center transition-all hover:border-blue-500/50 hover:bg-zinc-950/90">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/jpg,image/png,image/webp,image/heic"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-white">{selectedFile.name}</span>
                  <span className="text-xs text-zinc-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                  </span>
                  <span className="mt-1 text-[11px] text-blue-400 font-semibold underline">
                    Click to replace file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">
                    Click to browse or drag & drop file
                  </span>
                  <span className="text-xs text-zinc-500">
                    PDF, JPEG, PNG, WEBP supported (Up to 15MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Document Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passport - India, Car Insurance Policy"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>Expiry Date (Optional)</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500">
                Leave empty if document does not expire (e.g. Birth Certificate).
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-purple-400" />
                <span>Tags (Comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Identity, Official, 2026"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Notes / Additional Details (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Policy number, issuer details, renewal reference notes..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <Link
              href="/documents"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Encrypting & Uploading...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Encrypt & Save Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

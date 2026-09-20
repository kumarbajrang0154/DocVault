'use client';

import React, { useState, useEffect } from 'react';
import { getLanguages, createLanguage, updateLanguage, toggleLanguageStatus, deleteLanguage } from '@/app/admin/actions/languages';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { Globe, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface LanguageItem {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  _count?: { songs: number };
}

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LanguageItem | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', displayOrder: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLanguages = async () => {
    try {
      const res = await getLanguages({ search, page, limit: 15 });
      setLanguages(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch languages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getLanguages({ search, page, limit: 15 })
      .then((res) => {
        if (isMounted) {
          setLanguages(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch languages');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', code: '', displayOrder: languages.length + 1 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LanguageItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, code: item.code, displayOrder: item.displayOrder });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateLanguage(editingItem.id, formData);
        setSuccessMessage('Language updated successfully.');
      } else {
        await createLanguage(formData);
        setSuccessMessage('Language created successfully.');
      }
      setIsModalOpen(false);
      fetchLanguages();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: LanguageItem) => {
    try {
      await toggleLanguageStatus(item.id, !item.isActive);
      fetchLanguages();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteLanguage(deletingId);
      setSuccessMessage('Language deleted safely.');
      setDeletingId(null);
      fetchLanguages();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-400" />
            <span>Languages Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure music languages for discovery and user preferences.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Language</span>
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-3 backdrop-blur-md">
        <Search className="h-4 w-4 text-zinc-400 ml-2" />
        <input
          type="text"
          placeholder="Search languages by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Assigned Songs</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    Loading languages...
                  </td>
                </tr>
              ) : languages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No languages found. Click &quot;Add Language&quot; to create one.
                  </td>
                </tr>
              ) : (
                languages.map((lang) => (
                  <tr key={lang.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-400">#{lang.displayOrder}</td>
                    <td className="px-6 py-4 font-bold text-white">{lang.name}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400">{lang.code}</td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">{lang._count?.songs || 0} songs</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(lang)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          lang.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        {lang.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{lang.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(lang)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(lang.id)}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Language' : 'Create Language'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Language Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Hindi, English, Spanish"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Language Code / Slug</label>
            <input
              type="text"
              required
              placeholder="e.g. hindi, english"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Order</label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Language'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Language"
        message="Are you sure you want to delete this language? This action is permanent. If songs reference this language, deletion will be blocked."
        confirmLabel="Delete Language"
        isLoading={isDeleting}
      />
    </div>
  );
}

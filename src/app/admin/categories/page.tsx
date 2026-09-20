'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, toggleCategoryStatus, deleteCategory } from '@/app/admin/actions/categories';
import { getThemes } from '@/app/admin/actions/themes';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { Layers, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Palette } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  themeId: string | null;
  theme?: { id: string; name: string } | null;
  _count?: { songCategories: number };
}

interface ThemeItem {
  id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Music',
    displayOrder: 0,
    themeId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadCategoriesData = async () => {
    try {
      const [catRes, themesRes] = await Promise.all([
        getCategories({ search, page, limit: 15 }),
        getThemes(),
      ]);
      setCategories(catRes.items);
      setTotal(catRes.total);
      setTotalPages(catRes.totalPages);
      setThemes(themesRes);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getCategories({ search, page, limit: 15 }),
      getThemes(),
    ])
      .then(([catRes, themesRes]) => {
        if (isMounted) {
          setCategories(catRes.items);
          setTotal(catRes.total);
          setTotalPages(catRes.totalPages);
          setThemes(themesRes);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch categories');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Music',
      displayOrder: categories.length + 1,
      themeId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CategoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      icon: item.icon || 'Music',
      displayOrder: item.displayOrder,
      themeId: item.themeId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateCategory(editingItem.id, formData);
        setSuccessMessage('Category / Mood updated successfully.');
      } else {
        await createCategory(formData);
        setSuccessMessage('Category / Mood created successfully.');
      }
      setIsModalOpen(false);
      reloadCategoriesData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: CategoryItem) => {
    try {
      await toggleCategoryStatus(item.id, !item.isActive);
      reloadCategoriesData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deletingId);
      setSuccessMessage('Category deleted safely.');
      setDeletingId(null);
      reloadCategoriesData();
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
            <Layers className="h-6 w-6 text-amber-400" />
            <span>Categories & Moods Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage emotion-based mood categories and assign visual themes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Mood Category</span>
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
          placeholder="Search categories by name, slug, or description..."
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
                <th className="px-6 py-4">Category / Mood</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Theme</th>
                <th className="px-6 py-4">Songs</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No categories found. Click &quot;Add Mood Category&quot; to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-400">#{cat.displayOrder}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{cat.name}</div>
                      {cat.description && (
                        <div className="text-[11px] text-zinc-500 truncate max-w-xs">{cat.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-400">{cat.slug}</td>
                    <td className="px-6 py-4">
                      {cat.theme ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300">
                          <Palette className="h-3 w-3 text-purple-400" />
                          <span>{cat.theme.name}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500 italic">Default Theme</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">{cat._count?.songCategories || 0} songs</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          cat.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        {cat.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{cat.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(cat.id)}
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
        title={editingItem ? 'Edit Category / Mood' : 'Create Category / Mood'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Mood Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Romantic, Sad, Banger"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">URL Slug</label>
              <input
                type="text"
                placeholder="e.g. romantic, one-side-love"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of this mood category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Icon Identifier</label>
              <input
                type="text"
                placeholder="e.g. Heart, Zap, CloudRain"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
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

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Assign Theme</label>
              <select
                value={formData.themeId}
                onChange={(e) => setFormData({ ...formData, themeId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="">-- No Specific Theme --</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Mood Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? If songs are assigned to this category, deletion will be safely blocked."
        confirmLabel="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getThemes, createTheme, updateTheme, deleteTheme, ThemeInput } from '@/app/admin/actions/themes';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Palette, Plus, Edit2, Trash2, Eye } from 'lucide-react';

interface ThemeItem extends ThemeInput {
  id: string;
  categories: Array<{ id: string; name: string }>;
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ThemeItem | null>(null);
  const [formData, setFormData] = useState<ThemeInput>({
    name: '',
    background: '#09090b',
    backgroundImage: '',
    primaryColor: '#f43f5e',
    secondaryColor: '#a855f7',
    accentColor: '#06b6d4',
    textColor: '#ffffff',
    cardStyle: 'bg-zinc-900/60 border-white/10',
    buttonStyle: 'bg-rose-500 hover:bg-rose-600 text-white',
    playerStyle: 'from-rose-500/20 via-purple-600/20 to-cyan-500/20',
    animationPreset: 'pulse',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadThemesData = async () => {
    try {
      const res = await getThemes();
      setThemes(res);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch themes');
    }
  };

  useEffect(() => {
    let isMounted = true;
    getThemes()
      .then((res) => {
        if (isMounted) {
          setThemes(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch themes');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      background: '#09090b',
      backgroundImage: '',
      primaryColor: '#f43f5e',
      secondaryColor: '#a855f7',
      accentColor: '#06b6d4',
      textColor: '#ffffff',
      cardStyle: 'bg-rose-950/30 border-rose-500/20 shadow-rose-950/50',
      buttonStyle: 'bg-rose-600 hover:bg-rose-500 text-white',
      playerStyle: 'from-rose-500/20 via-pink-600/20 to-purple-600/20',
      animationPreset: 'pulse',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ThemeItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      background: item.background,
      backgroundImage: item.backgroundImage || '',
      primaryColor: item.primaryColor,
      secondaryColor: item.secondaryColor,
      accentColor: item.accentColor,
      textColor: item.textColor,
      cardStyle: item.cardStyle || '',
      buttonStyle: item.buttonStyle || '',
      playerStyle: item.playerStyle || '',
      animationPreset: item.animationPreset || 'pulse',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateTheme(editingItem.id, formData);
        setSuccessMessage('Theme updated successfully.');
      } else {
        await createTheme(formData);
        setSuccessMessage('Theme created successfully.');
      }
      setIsModalOpen(false);
      reloadThemesData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteTheme(deletingId);
      setSuccessMessage('Theme deleted safely.');
      setDeletingId(null);
      reloadThemesData();
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
            <Palette className="h-6 w-6 text-purple-400" />
            <span>Theme Tokens & Visual Styling</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage visual themes bound to Mood categories and overall music experience.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Theme</span>
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

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-zinc-500">
            Loading visual themes...
          </div>
        ) : themes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-zinc-500">
            No themes defined yet. Click &quot;Create Theme&quot; to design one.
          </div>
        ) : (
          themes.map((theme) => (
            <div
              key={theme.id}
              className="rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl backdrop-blur-xl transition-all hover:border-white/20"
              style={{ backgroundColor: theme.background }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-white">{theme.name}</h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(theme)}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(theme.id)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: theme.primaryColor }} />
                  <span className="text-[9px] text-zinc-400 mt-1 font-mono">Primary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: theme.secondaryColor }} />
                  <span className="text-[9px] text-zinc-400 mt-1 font-mono">Secondary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: theme.accentColor }} />
                  <span className="text-[9px] text-zinc-400 mt-1 font-mono">Accent</span>
                </div>
              </div>

              {/* Bound Categories */}
              <div className="border-t border-white/10 pt-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Bound Categories
                </span>
                {theme.categories.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No assigned categories</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {theme.categories.map((c) => (
                      <span key={c.id} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal with Live Preview */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Theme' : 'Create Visual Theme'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Theme Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Romantic Red, Neon Banger"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Background Hex Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="h-9 w-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="h-8 w-8 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Card Style Tailwind Classes</label>
            <input
              type="text"
              value={formData.cardStyle || ''}
              onChange={(e) => setFormData({ ...formData, cardStyle: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Interactive Live Theme Preview Card */}
          <div className="rounded-2xl border border-white/10 p-4 space-y-3 bg-zinc-950">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Eye className="h-4 w-4 text-cyan-400" />
              <span>Live Theme Preview</span>
            </div>
            <div 
              className="p-5 rounded-xl border space-y-3 transition-all"
              style={{ backgroundColor: formData.background }}
            >
              <h4 className="text-sm font-extrabold" style={{ color: formData.textColor }}>
                Sample Music Card Preview
              </h4>
              <p className="text-xs opacity-80" style={{ color: formData.textColor }}>
                This is how player cards and mood banners will render with theme tokens.
              </p>
              <div className="flex gap-2">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold shadow-md"
                  style={{ backgroundColor: formData.primaryColor, color: '#ffffff' }}
                >
                  Primary Token
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold shadow-md"
                  style={{ backgroundColor: formData.accentColor, color: '#000000' }}
                >
                  Accent Token
                </span>
              </div>
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Theme' : 'Create Theme'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Theme"
        message="Are you sure you want to delete this theme? If categories are attached to this theme, deletion will be blocked."
        confirmLabel="Delete Theme"
        isLoading={isDeleting}
      />
    </div>
  );
}

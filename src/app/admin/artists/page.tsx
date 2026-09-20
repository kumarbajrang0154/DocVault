'use client';

import React, { useState, useEffect } from 'react';
import { getArtists, createArtist, updateArtist, toggleArtistStatus, deleteArtist } from '@/app/admin/actions/artists';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { Users, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, User } from 'lucide-react';

interface ArtistItem {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  _count?: { songs: number; albums: number };
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ArtistItem | null>(null);
  const [formData, setFormData] = useState({ name: '', imageUrl: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadArtists = async () => {
    try {
      const res = await getArtists({ search, page, limit: 15 });
      setArtists(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch artists');
    }
  };

  useEffect(() => {
    let isMounted = true;
    getArtists({ search, page, limit: 15 })
      .then((res) => {
        if (isMounted) {
          setArtists(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch artists');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', imageUrl: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ArtistItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, imageUrl: item.imageUrl || '', description: item.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateArtist(editingItem.id, formData);
        setSuccessMessage('Artist updated successfully.');
      } else {
        await createArtist(formData);
        setSuccessMessage('Artist created successfully.');
      }
      setIsModalOpen(false);
      reloadArtists();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: ArtistItem) => {
    try {
      await toggleArtistStatus(item.id, !item.isActive);
      reloadArtists();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteArtist(deletingId);
      setSuccessMessage('Artist deleted safely.');
      setDeletingId(null);
      reloadArtists();
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
            <Users className="h-6 w-6 text-purple-400" />
            <span>Artists Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage musical artists, vocalists, and composers.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Artist</span>
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
          placeholder="Search artists by name..."
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
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Bio / Description</th>
                <th className="px-6 py-4">Catalog Stats</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Loading artists...
                  </td>
                </tr>
              ) : artists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No artists found. Click &quot;Add Artist&quot; to create one.
                  </td>
                </tr>
              ) : (
                artists.map((artist) => (
                  <tr key={artist.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center shrink-0">
                          {artist.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="font-bold text-white text-sm">{artist.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {artist.description ? (
                        <span className="truncate max-w-xs block">{artist.description}</span>
                      ) : (
                        <span className="text-zinc-600 italic">No description</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">
                      {artist._count?.songs || 0} songs · {artist._count?.albums || 0} albums
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(artist)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          artist.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        {artist.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{artist.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(artist)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(artist.id)}
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
        title={editingItem ? 'Edit Artist' : 'Create Artist'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Arijit Singh, Ed Sheeran"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/artist.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist Description / Bio</label>
            <textarea
              rows={3}
              placeholder="Brief biography..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Artist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Artist"
        message="Are you sure you want to delete this artist? If songs or albums are assigned to this artist, deletion will be blocked."
        confirmLabel="Delete Artist"
        isLoading={isDeleting}
      />
    </div>
  );
}

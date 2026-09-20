'use client';

import React, { useState, useEffect } from 'react';
import { getAlbums, createAlbum, updateAlbum, deleteAlbum } from '@/app/admin/actions/albums';
import { getArtists } from '@/app/admin/actions/artists';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { DiscAlbum, Plus, Search, Edit2, Trash2, Disc } from 'lucide-react';

interface AlbumItem {
  id: string;
  title: string;
  artistId: string;
  artist: { id: string; name: string };
  coverImageUrl: string | null;
  releaseDate: string | null;
  description: string | null;
  _count?: { songs: number };
}

interface ArtistOption {
  id: string;
  name: string;
}

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlbumItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    coverImageUrl: '',
    releaseDate: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadAlbums = async () => {
    try {
      const [albumRes, artistRes] = await Promise.all([
        getAlbums({ search, page, limit: 15 }),
        getArtists({ limit: 100 }),
      ]);
      setAlbums(albumRes.items);
      setTotal(albumRes.total);
      setTotalPages(albumRes.totalPages);
      setArtists(artistRes.items);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch albums');
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getAlbums({ search, page, limit: 15 }),
      getArtists({ limit: 100 }),
    ])
      .then(([albumRes, artistRes]) => {
        if (isMounted) {
          setAlbums(albumRes.items);
          setTotal(albumRes.total);
          setTotalPages(albumRes.totalPages);
          setArtists(artistRes.items);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch albums');
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
      title: '',
      artistId: artists[0]?.id || '',
      coverImageUrl: '',
      releaseDate: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AlbumItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      artistId: item.artistId,
      coverImageUrl: item.coverImageUrl || '',
      releaseDate: item.releaseDate || '',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateAlbum(editingItem.id, formData);
        setSuccessMessage('Album updated successfully.');
      } else {
        await createAlbum(formData);
        setSuccessMessage('Album created successfully.');
      }
      setIsModalOpen(false);
      reloadAlbums();
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
      await deleteAlbum(deletingId);
      setSuccessMessage('Album deleted safely.');
      setDeletingId(null);
      reloadAlbums();
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
            <DiscAlbum className="h-6 w-6 text-cyan-400" />
            <span>Albums Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Organize songs into studio albums and EPs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Album</span>
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
          placeholder="Search albums by title or artist..."
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
                <th className="px-6 py-4">Album</th>
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Release Date</th>
                <th className="px-6 py-4">Track Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Loading albums...
                  </td>
                </tr>
              ) : albums.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No albums found. Click &quot;Add Album&quot; to create one.
                  </td>
                </tr>
              ) : (
                albums.map((album) => (
                  <tr key={album.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-zinc-800 flex items-center justify-center shrink-0">
                          {album.coverImageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={album.coverImageUrl} alt={album.title} className="h-full w-full object-cover" />
                          ) : (
                            <Disc className="h-5 w-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="font-bold text-white text-sm">{album.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-purple-300">{album.artist?.name}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{album.releaseDate || 'N/A'}</td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">{album._count?.songs || 0} tracks</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(album)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(album.id)}
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
        title={editingItem ? 'Edit Album' : 'Create Album'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Album Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Rockstar, Aashiqui 2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Select Artist</label>
              <select
                required
                value={formData.artistId}
                onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="">-- Select Artist --</option>
                {artists.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Cover Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Release Date</label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Album Description</label>
            <textarea
              rows={3}
              placeholder="Brief description..."
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Album'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Album"
        message="Are you sure you want to delete this album? If songs belong to this album, delete or reassign them first."
        confirmLabel="Delete Album"
        isLoading={isDeleting}
      />
    </div>
  );
}

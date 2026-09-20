'use client';

import React, { useState, useEffect } from 'react';
import { 
  getPlaylists, 
  createPlaylist, 
  updatePlaylist, 
  togglePlaylistPublish, 
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '@/app/admin/actions/playlists';
import { getSongs } from '@/app/admin/actions/songs';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { ListMusic, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Music, X } from 'lucide-react';

interface PlaylistSongItem {
  id: string;
  songId: string;
  position: number;
  song: {
    id: string;
    title: string;
    artist: { id: string; name: string };
    language: { name: string };
  };
}

interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  playlistSongs: PlaylistSongItem[];
  _count?: { playlistSongs: number };
}

interface SongOption {
  id: string;
  title: string;
  artist: { name: string };
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [availableSongs, setAvailableSongs] = useState<SongOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlaylistItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    coverImageUrl: '',
    isPublished: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manage songs modal state
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistItem | null>(null);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadPlaylistsData = async () => {
    try {
      const [plRes, songRes] = await Promise.all([
        getPlaylists({ search, page, limit: 15 }),
        getSongs({ limit: 100 }),
      ]);
      setPlaylists(plRes.items);
      setTotal(plRes.total);
      setTotalPages(plRes.totalPages);
      setAvailableSongs(songRes.items.map((s) => ({ id: s.id, title: s.title, artist: s.artist })));
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch playlists');
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getPlaylists({ search, page, limit: 15 }),
      getSongs({ limit: 100 }),
    ])
      .then(([plRes, songRes]) => {
        if (isMounted) {
          setPlaylists(plRes.items);
          setTotal(plRes.total);
          setTotalPages(plRes.totalPages);
          setAvailableSongs(songRes.items.map((s) => ({ id: s.id, title: s.title, artist: s.artist })));
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch playlists');
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
      slug: '',
      description: '',
      coverImageUrl: '',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PlaylistItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      description: item.description || '',
      coverImageUrl: item.coverImageUrl || '',
      isPublished: item.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updatePlaylist(editingItem.id, formData);
        setSuccessMessage('Playlist updated successfully.');
      } else {
        await createPlaylist(formData);
        setSuccessMessage('Playlist created successfully.');
      }
      setIsModalOpen(false);
      reloadPlaylistsData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: PlaylistItem) => {
    try {
      await togglePlaylistPublish(item.id, !item.isPublished);
      reloadPlaylistsData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleAddSong = async () => {
    if (!selectedPlaylist || !selectedSongToAdd) return;
    try {
      await addSongToPlaylist(selectedPlaylist.id, selectedSongToAdd);
      setSelectedSongToAdd('');
      reloadPlaylistsData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleRemoveSong = async (playlistId: string, songId: string) => {
    try {
      await removeSongFromPlaylist(playlistId, songId);
      reloadPlaylistsData();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deletePlaylist(deletingId);
      setSuccessMessage('Playlist deleted safely.');
      setDeletingId(null);
      reloadPlaylistsData();
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
            <ListMusic className="h-6 w-6 text-emerald-400" />
            <span>Curated Playlists Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Build and manage admin-curated song collections.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Playlist</span>
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
          placeholder="Search playlists by title or slug..."
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
                <th className="px-6 py-4">Playlist Title</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Songs Count</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    Loading playlists...
                  </td>
                </tr>
              ) : playlists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No playlists found. Click &quot;Create Playlist&quot; to build one.
                  </td>
                </tr>
              ) : (
                playlists.map((pl) => (
                  <tr key={pl.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{pl.title}</div>
                      {pl.description && <div className="text-[11px] text-zinc-500 truncate max-w-xs">{pl.description}</div>}
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-400">{pl.slug}</td>
                    <td className="px-6 py-4 text-zinc-300 font-semibold">
                      <button
                        onClick={() => setSelectedPlaylist(pl)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3 py-1 text-xs text-white hover:bg-white/10"
                      >
                        <Music className="h-3.5 w-3.5 text-rose-400" />
                        <span>{pl.playlistSongs?.length || 0} songs (Manage)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(pl)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          pl.isPublished
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        {pl.isPublished ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{pl.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(pl)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(pl.id)}
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
        title={editingItem ? 'Edit Playlist' : 'Create Playlist'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Playlist Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Top 50 Romantic Hits"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">URL Slug</label>
              <input
                type="text"
                placeholder="e.g. top-50-romantic"
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
              placeholder="Playlist description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/playlist-cover.jpg"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Playlist Song Management Modal */}
      <Modal
        isOpen={!!selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
        title={`Manage Songs — ${selectedPlaylist?.title}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedSongToAdd}
              onChange={(e) => setSelectedSongToAdd(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              <option value="">-- Select Song to Add --</option>
              {availableSongs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {s.artist.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddSong}
              type="button"
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shrink-0"
            >
              Add Track
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-950 divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
            {playlists.find((p) => p.id === selectedPlaylist?.id)?.playlistSongs.map((ps, idx) => (
              <div key={ps.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-500 font-bold">#{idx + 1}</span>
                  <div>
                    <span className="font-bold text-white">{ps.song.title}</span>
                    <span className="text-purple-300 ml-2">({ps.song.artist.name})</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSong(selectedPlaylist!.id, ps.songId)}
                  className="rounded-md p-1 text-rose-400 hover:bg-rose-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Playlist"
        message="Are you sure you want to delete this curated playlist?"
        confirmLabel="Delete Playlist"
        isLoading={isDeleting}
      />
    </div>
  );
}

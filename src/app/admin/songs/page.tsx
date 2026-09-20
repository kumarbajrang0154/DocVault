'use client';

import React, { useState, useEffect } from 'react';
import { getSongs, createSong, updateSong, toggleSongPublish, toggleSongDownload, deleteSong } from '@/app/admin/actions/songs';
import { getLanguages } from '@/app/admin/actions/languages';
import { getCategories } from '@/app/admin/actions/categories';
import { getArtists } from '@/app/admin/actions/artists';
import { getAlbums } from '@/app/admin/actions/albums';
import { Modal } from '@/components/admin/ui/Modal';
import { ConfirmDialog } from '@/components/admin/ui/ConfirmDialog';
import { Pagination } from '@/components/admin/ui/Pagination';
import { 
  Music, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Play, 
  Globe
} from 'lucide-react';

interface SongItem {
  id: string;
  title: string;
  artistId: string;
  artist: { id: string; name: string };
  albumId: string | null;
  album: { id: string; title: string; coverImageUrl: string | null } | null;
  languageId: string;
  language: { id: string; name: string; code: string };
  audioUrl: string;
  coverImageUrl: string | null;
  duration: number;
  description: string | null;
  isDownloadable: boolean;
  isPublished: boolean;
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
}

interface SelectOption {
  id: string;
  name: string;
}

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [languages, setLanguages] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [artists, setArtists] = useState<SelectOption[]>([]);
  const [albums, setAlbums] = useState<SelectOption[]>([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SongItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    albumId: '',
    languageId: '',
    audioUrl: '',
    coverImageUrl: '',
    duration: 180,
    description: '',
    isDownloadable: true,
    isPublished: true,
    categoryIds: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadSongs = async () => {
    try {
      const res = await getSongs({
        search,
        languageId: filterLang || undefined,
        categoryId: filterCat || undefined,
        artistId: filterArtist || undefined,
        page,
        limit: 15,
      });
      setSongs(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to fetch songs');
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getLanguages({ limit: 100 }),
      getCategories({ limit: 100 }),
      getArtists({ limit: 100 }),
      getAlbums({ limit: 100 }),
    ])
      .then(([langRes, catRes, artRes, albRes]) => {
        if (isMounted) {
          setLanguages(langRes.items);
          setCategories(catRes.items);
          setArtists(artRes.items);
          setAlbums(albRes.items.map((a) => ({ id: a.id, name: a.title })));
        }
      })
      .catch((err) => console.error('Error fetching dependencies:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getSongs({
      search,
      languageId: filterLang || undefined,
      categoryId: filterCat || undefined,
      artistId: filterArtist || undefined,
      page,
      limit: 15,
    })
      .then((res) => {
        if (isMounted) {
          setSongs(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to fetch songs');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [filterArtist, filterCat, filterLang, page, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      artistId: artists[0]?.id || '',
      albumId: '',
      languageId: languages[0]?.id || '',
      audioUrl: '',
      coverImageUrl: '',
      duration: 180,
      description: '',
      isDownloadable: true,
      isPublished: true,
      categoryIds: categories.length > 0 ? [categories[0].id] : [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (song: SongItem) => {
    setEditingItem(song);
    setFormData({
      title: song.title,
      artistId: song.artistId,
      albumId: song.albumId || '',
      languageId: song.languageId,
      audioUrl: song.audioUrl,
      coverImageUrl: song.coverImageUrl || '',
      duration: song.duration,
      description: song.description || '',
      isDownloadable: song.isDownloadable,
      isPublished: song.isPublished,
      categoryIds: song.categories.map((c) => c.category.id),
    });
    setIsModalOpen(true);
  };

  const handleCategoryToggle = (catId: string) => {
    setFormData((prev) => {
      const exists = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: exists
          ? prev.categoryIds.filter((id) => id !== catId)
          : [...prev.categoryIds, catId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      if (editingItem) {
        await updateSong(editingItem.id, formData);
        setSuccessMessage('Song updated successfully.');
      } else {
        await createSong(formData);
        setSuccessMessage('Song created successfully.');
      }
      setIsModalOpen(false);
      reloadSongs();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (song: SongItem) => {
    try {
      await toggleSongPublish(song.id, !song.isPublished);
      reloadSongs();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleToggleDownload = async (song: SongItem) => {
    try {
      await toggleSongDownload(song.id, !song.isDownloadable);
      reloadSongs();
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteSong(deletingId);
      setSuccessMessage('Song deleted safely.');
      setDeletingId(null);
      reloadSongs();
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
            <Music className="h-6 w-6 text-rose-400" />
            <span>Songs Catalog Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage audio tracks, languages, moods, cover images, and audio sources.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Song</span>
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

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-md">
        <div className="sm:col-span-1 flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 border border-white/10">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search song title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="">All Mood Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterArtist}
          onChange={(e) => setFilterArtist(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="">All Artists</option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Song Track</th>
                <th className="px-6 py-4">Artist & Album</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Mood Categories</th>
                <th className="px-6 py-4">Downloadable</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    Loading songs catalog...
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No songs found matching criteria. Click &quot;Add New Song&quot; to upload one.
                  </td>
                </tr>
              ) : (
                songs.map((song) => (
                  <tr key={song.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-zinc-800 flex items-center justify-center shrink-0">
                          {song.coverImageUrl || song.album?.coverImageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                              src={song.coverImageUrl || song.album?.coverImageUrl || ''} 
                              alt={song.title} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <Music className="h-5 w-5 text-rose-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{song.title}</span>
                            <a
                              href={song.audioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-cyan-400"
                              title="Listen audio preview"
                            >
                              <Play className="h-3 w-3 fill-current" />
                            </a>
                          </div>
                          <span className="text-[11px] text-zinc-500 block font-mono">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-purple-300">{song.artist?.name}</div>
                      {song.album && <div className="text-[11px] text-zinc-500">{song.album.title}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                        <Globe className="h-3 w-3" />
                        <span>{song.language?.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {song.categories.map((c) => (
                          <span
                            key={c.category.id}
                            className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300"
                          >
                            {c.category.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleDownload(song)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          song.isDownloadable
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        <Download className="h-3 w-3" />
                        <span>{song.isDownloadable ? 'Yes' : 'No'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(song)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                          song.isPublished
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 border-white/10 text-zinc-500'
                        }`}
                      >
                        {song.isPublished ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{song.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(song)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(song.id)}
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
        title={editingItem ? 'Edit Song Track' : 'Add New Song Track'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Song Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Tum Hi Ho, Kesariya"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist</label>
              <select
                required
                value={formData.artistId}
                onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="">-- Select Artist --</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Language</label>
              <select
                required
                value={formData.languageId}
                onChange={(e) => setFormData({ ...formData, languageId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="">-- Select Language --</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Album (Optional)</label>
              <select
                value={formData.albumId}
                onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="">-- Single / No Album --</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {alb.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Authorized Audio URL (.mp3 / stream)</label>
            <input
              type="url"
              required
              placeholder="https://example.com/authorized/audio.mp3"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Enter authorized HTTP/HTTPS stream or audio URL.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Song Artwork Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/artwork.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Duration (Seconds)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mood Categories Multi-Select Checklist */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Assign Mood Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border border-white/10 bg-zinc-950 p-3 max-h-36 overflow-y-auto custom-scrollbar">
              {categories.map((c) => {
                const checked = formData.categoryIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    onClick={() => handleCategoryToggle(c.id)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded border-zinc-700 text-rose-600 focus:ring-0"
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDownloadable}
                onChange={(e) => setFormData({ ...formData, isDownloadable: e.target.checked })}
                className="rounded border-zinc-700 text-rose-600"
              />
              <span>Permit Audio Download</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-zinc-700 text-rose-600"
              />
              <span>Publish Immediately</span>
            </label>
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Song Track'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Song"
        message="Are you sure you want to delete this song track from the catalog?"
        confirmLabel="Delete Song"
        isLoading={isDeleting}
      />
    </div>
  );
}

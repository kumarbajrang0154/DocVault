'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/mood/Navbar';
import { Footer } from '@/components/mood/Footer';
import { OnboardingModal } from '@/components/mood/OnboardingModal';
import { useMoodPreferences } from '@/hooks/useMoodPreferences';
import { 
  Music2, 
  Globe, 
  Heart, 
  RefreshCw, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Download, 
  Disc,
  Info
} from 'lucide-react';

interface SongTrack {
  id: string;
  title: string;
  audioUrl: string;
  coverImageUrl: string | null;
  duration: number;
  description: string | null;
  isDownloadable: boolean;
  artist: { id: string; name: string; imageUrl: string | null };
  album: { id: string; title: string; coverImageUrl: string | null } | null;
  language: { id: string; name: string };
  categories: Array<{ category: { name: string; theme: { primaryColor: string; background: string } | null } }>;
}

export default function MusicPage() {
  const { preferences, completeOnboarding } = useMoodPreferences();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [songs, setSongs] = useState<SongTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoadingSongs, setIsLoadingSongs] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedLang = preferences?.language;
  const selectedMood = preferences?.mood;

  const handleNextTrack = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  }, [songs.length]);

  const handlePrevTrack = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  }, [songs.length]);

  // Fetch published songs matching user selection
  useEffect(() => {
    async function loadMatchingSongs() {
      if (!selectedLang && !selectedMood) return;
      setIsLoadingSongs(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedLang) queryParams.set('language', selectedLang);
        if (selectedMood) queryParams.set('mood', selectedMood);

        const res = await fetch(`/api/songs?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSongs(data.songs || []);
          setCurrentTrackIndex(0);
          setIsPlaying(false);
        }
      } catch (err) {
        console.error('Failed to load matching songs:', err);
      } finally {
        setIsLoadingSongs(false);
      }
    }

    loadMatchingSongs();
  }, [selectedLang, selectedMood]);

  const currentSong = songs[currentTrackIndex] || null;

  // Audio Playback Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || currentSong?.duration || 0);
    const handleEnded = () => handleNextTrack();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, handleNextTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.error('Audio playback error:', e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpdatePreferences = (language: string, mood: string) => {
    completeOnboarding(language, mood);
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 bg-ambient-gradient">
      <Navbar onStartListening={() => setIsModalOpen(true)} />

      {/* Hidden Audio Element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          preload="metadata"
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                  <Music2 className="h-5 w-5 text-rose-400" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-extrabold text-white">Mood Music Player</h1>
                <p className="text-xs text-zinc-400">Live DB Stream</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10"
            >
              <RefreshCw className="h-3.5 w-3.5 text-rose-400" />
              <span>Change Vibe</span>
            </button>
          </div>

          {/* Active Badges */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
                <Globe className="h-3 w-3" /> Language
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{selectedLang || 'Not Selected'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-3">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block flex items-center gap-1">
                <Heart className="h-3 w-3" /> Mood
              </span>
              <p className="text-sm font-bold text-white mt-0.5">{selectedMood || 'Not Selected'}</p>
            </div>
          </div>

          {/* Player Main Content */}
          {isLoadingSongs ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
              <p className="text-xs text-zinc-400">Querying database for published songs...</p>
            </div>
          ) : songs.length === 0 ? (
            /* Empty State when no matching songs published in DB */
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 text-zinc-500">
                <Disc className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Tracks Found in Catalog</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  No published songs matching <span className="font-bold text-cyan-300">{selectedLang}</span> + <span className="font-bold text-rose-300">{selectedMood}</span> are available in the catalog yet.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Different Mood/Language</span>
                </button>
                <Link
                  href="/admin/songs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10"
                >
                  <Info className="h-3.5 w-3.5 text-amber-400" />
                  <span>Admin: Upload Song Tracks</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Active Song Player Card */
            <div className="space-y-6">
              {/* Cover Artwork & Track Info */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-zinc-950/80 p-6 rounded-2xl border border-white/10">
                <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-xl group">
                  {currentSong?.coverImageUrl || currentSong?.album?.coverImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={currentSong.coverImageUrl || currentSong.album?.coverImageUrl || ''} 
                      alt={currentSong.title} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/20 to-purple-600/20">
                      <Music2 className="h-10 w-10 text-rose-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                    Track {currentTrackIndex + 1} of {songs.length}
                  </span>
                  <h2 className="text-xl font-extrabold text-white truncate">{currentSong?.title}</h2>
                  <p className="text-sm font-semibold text-purple-300 mt-0.5">{currentSong?.artist.name}</p>
                  {currentSong?.album && (
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">{currentSong.album.title}</p>
                  )}
                </div>

                {/* Download Button if permitted */}
                {currentSong?.isDownloadable && (
                  <a
                    href={currentSong.audioUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all shrink-0"
                    title="Download authorized audio file"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                )}
              </div>

              {/* Progress Bar & Seek Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-zinc-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevTrack}
                    className="p-2.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-950/50 hover:bg-rose-500 transition-all"
                  >
                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-2.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                <div className="w-24 text-right">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                    {currentSong?.language.name}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Preference Edit Modal */}
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleUpdatePreferences}
        initialLanguage={preferences?.language}
        initialMood={preferences?.mood}
        canDismiss={true}
      />
    </div>
  );
}

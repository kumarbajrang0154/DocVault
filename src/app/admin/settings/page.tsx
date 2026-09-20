'use client';

import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/app/admin/actions/settings';
import { getLanguages } from '@/app/admin/actions/languages';
import { getCategories } from '@/app/admin/actions/categories';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface SelectOption {
  id: string;
  name: string;
}

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    appName: 'Mood',
    appDescription: 'Choose your language. Choose your mood. Feel the music.',
    defaultLanguage: 'Hindi',
    defaultCategory: 'Romantic',
    pwaThemeColor: '#09090b',
  });

  const [languages, setLanguages] = useState<SelectOption[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getSettings(),
      getLanguages({ limit: 100 }),
      getCategories({ limit: 100 }),
    ])
      .then(([settingsRes, langRes, catRes]) => {
        if (isMounted) {
          setFormData({
            appName: settingsRes.appName || 'Mood',
            appDescription: settingsRes.appDescription || 'Choose your language. Choose your mood. Feel the music.',
            defaultLanguage: settingsRes.defaultLanguage || 'Hindi',
            defaultCategory: settingsRes.defaultCategory || 'Romantic',
            pwaThemeColor: settingsRes.pwaThemeColor || '#09090b',
          });
          setLanguages(langRes.items);
          setCategories(catRes.items);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage((err as Error).message || 'Failed to fetch site settings');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await updateSettings(formData);
      setSuccessMessage('Site settings updated and persisted successfully.');
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-zinc-500">
        Loading application settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-cyan-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure platform branding, initial defaults, and PWA theme colors.
        </p>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Application Name</label>
            <input
              type="text"
              required
              value={formData.appName}
              onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">PWA Theme Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.pwaThemeColor}
                onChange={(e) => setFormData({ ...formData, pwaThemeColor: e.target.value })}
                className="h-9 w-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={formData.pwaThemeColor}
                onChange={(e) => setFormData({ ...formData, pwaThemeColor: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">Application Tagline / Description</label>
          <textarea
            rows={3}
            value={formData.appDescription}
            onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Default Preference Language</label>
            <select
              value={formData.defaultLanguage}
              onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">Default Preference Mood Category</label>
            <select
              value={formData.defaultCategory}
              onChange={(e) => setFormData({ ...formData, defaultCategory: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Assistant Configuration Section */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              <span>AI Music Assistant & Discovery Engine Settings</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Control automated release discovery, classification threshold, and duplicate verification rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">AI Assistant Enabled</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Enables URL import metadata extraction, AI language & mood classification.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">New Release Discovery</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">ENABLED</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Scans official feeds for candidate track releases.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Duplicate Similarity Detection</span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">ENFORCED</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Multi-signal title, artist, and duration duplicate matching.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-950/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200">Minimum AI Confidence Threshold</span>
                <span className="text-[10px] font-bold text-purple-400">70%</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Candidates below 70% require mandatory manual admin verification.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-4 text-[11px] text-purple-300">
            <strong>Mandatory Governance Rule:</strong> Auto-publishing automation is explicitly disabled. Workflow is strictly locked to:
            <span className="block mt-1 font-mono text-[10px] text-purple-200">
              AI discovers → AI analyzes → Admin reviews → Admin approves → Song published.
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 hover:bg-rose-500 transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Saving Settings...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

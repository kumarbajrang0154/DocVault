'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Sparkles,
  RotateCcw,
  Layout,
  Type,
  Maximize2,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  getSiteConfigAction,
  updateSiteConfigAction,
  revertSiteConfigAction,
} from '@/app/actions/siteConfig';
import { SiteConfigData, DEFAULT_SITE_CONFIG } from '@/lib/siteConfigTypes';
import { uploadLogoAction } from '@/app/actions/branding';
import { Login3DBackground } from '@/components/3d/Login3DBackground';

export function AdminBrandingClient() {
  const [config, setConfig] = useState<SiteConfigData>(DEFAULT_SITE_CONFIG);
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'content' | 'layout' | 'ai'>('branding');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // AI Assist State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProposal, setAiProposal] = useState<Partial<SiteConfigData> | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getSiteConfigAction();
        if (data) {
          setConfig(data);
        }
      } catch (err: unknown) {
        console.error('Failed to load site config:', err);
        setErrorMessage('Failed to load site configuration.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl' | 'loginPageLogoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLogoAction(formData);

      if (res.success && res.logoUrl) {
        setConfig((prev) => ({
          ...prev,
          branding: {
            ...prev.branding,
            [field]: res.logoUrl,
          },
        }));
        setSuccessMessage(`Image asset uploaded successfully to Cloudinary.`);
      } else {
        setErrorMessage(res.error || 'Upload failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateSiteConfigAction({
        branding: config.branding,
        theme: config.theme,
        content: config.content,
        loginLayout: config.loginLayout,
      });

      if (res.success && res.config) {
        setConfig(res.config);
        setSuccessMessage('Site configuration and theme settings saved & published globally!');
      } else {
        setErrorMessage(res.error || 'Failed to save configuration.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving configuration.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm('Are you sure you want to revert to the previous site configuration?')) {
      return;
    }

    setIsReverting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await revertSiteConfigAction();
      if (res.success && res.config) {
        setConfig(res.config);
        setSuccessMessage('Successfully reverted to previous site configuration.');
      } else {
        setErrorMessage(res.error || 'Failed to revert configuration.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reverting configuration.';
      setErrorMessage(msg);
    } finally {
      setIsReverting(false);
    }
  };

  const handleGenerateAiTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentConfig: config,
        }),
      });

      const data = await res.json();
      if (data.success && data.proposal) {
        setAiProposal(data.proposal);
        setSuccessMessage('AI theme proposal generated! Preview the proposed theme on the right.');
      } else {
        setErrorMessage(data.error || 'AI generation failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI assist request failed.';
      setErrorMessage(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiProposal = () => {
    if (!aiProposal) return;
    setConfig((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...aiProposal.branding },
      theme: { ...prev.theme, ...aiProposal.theme },
      content: { ...prev.content, ...aiProposal.content },
      loginLayout: { ...prev.loginLayout, ...aiProposal.loginLayout },
    }));
    setAiProposal(null);
    setSuccessMessage('AI proposed theme applied to editor! Click "Save & Publish Globally" to make it live.');
  };

  const activeDisplayConfig = aiProposal
    ? {
        ...config,
        branding: { ...config.branding, ...aiProposal.branding },
        theme: { ...config.theme, ...aiProposal.theme },
        content: { ...config.content, ...aiProposal.content },
        loginLayout: { ...config.loginLayout, ...aiProposal.loginLayout },
      }
    : config;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Palette className="h-7 w-7 text-indigo-400" />
              Site Control & AI Theme Portal
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Customize visual identity, 3D WebGL background, copy, and AI theming in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRevert}
            disabled={isReverting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            {isReverting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 text-amber-400" />
            )}
            <span>Revert to Previous</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save & Publish Globally</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-950/30 p-4 text-xs font-semibold text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* AI Proposal Banner if active */}
      {aiProposal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/40 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white">AI Theme Proposal Active</h3>
              <p className="text-xs text-indigo-200/70 mt-0.5">
                Review the live preview on the right. Apply changes to populate controls or discard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAiProposal(null)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10"
            >
              Discard Proposal
            </button>
            <button
              type="button"
              onClick={handleApplyAiProposal}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
            >
              Apply Proposed Theme
            </button>
          </div>
        </div>
      )}

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Control Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900/80 p-1.5 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'branding'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Branding</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'theme'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Theme</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'content'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Content</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'layout'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>3D & Layout</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>AI Assist</span>
            </button>
          </div>

          {/* TAB 1: BRANDING */}
          {activeTab === 'branding' && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white border-b border-white/5 pb-3">
                Brand Identity & Logos
              </h2>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={config.branding.siteName}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, siteName: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Header Logo */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Main Header Logo Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploadingLogo ? 'Uploading...' : 'Upload Header Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'logoUrl')}
                      className="hidden"
                    />
                  </label>
                  {config.branding.logoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, logoUrl: null },
                        }))
                      }
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Login Page Logo */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Login Page Dedicated Logo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Login Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'loginPageLogoUrl')}
                      className="hidden"
                    />
                  </label>
                  {config.branding.loginPageLogoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          branding: { ...prev.branding, loginPageLogoUrl: null },
                        }))
                      }
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Favicon URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Favicon Image URL
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Favicon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, 'faviconUrl')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={config.branding.faviconUrl || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, faviconUrl: e.target.value },
                      }))
                    }
                    placeholder="/favicon-v2.svg"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THEME COLORS & TYPOGRAPHY */}
          {activeTab === 'theme' && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white border-b border-white/5 pb-3">
                Color Palette & Typography
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                    />
                    <input
                      type="text"
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme.secondaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                    />
                    <input
                      type="text"
                      value={config.theme.secondaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme.accentColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, accentColor: e.target.value },
                        }))
                      }
                      className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                    />
                    <input
                      type="text"
                      value={config.theme.accentColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, accentColor: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.theme.backgroundColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, backgroundColor: e.target.value },
                        }))
                      }
                      className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                    />
                    <input
                      type="text"
                      value={config.theme.backgroundColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, backgroundColor: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Typography Font Family
                </label>
                <select
                  value={config.theme.fontFamily}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, fontFamily: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white"
                >
                  <option value="Inter">Inter (Clean Modern)</option>
                  <option value="Geist">Geist (Tech & Minimalist)</option>
                  <option value="Roboto">Roboto (Google Standard)</option>
                  <option value="Outfit">Outfit (Geometric)</option>
                  <option value="Playfair Display">Playfair Display (Serif Elegance)</option>
                  <option value="Fira Code">Fira Code (Developer Mono)</option>
                </select>
              </div>

              {/* Border Radius Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase mb-1">
                  <span>Border Radius</span>
                  <span className="font-mono text-indigo-400">{config.theme.borderRadius}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={parseInt(config.theme.borderRadius || '16', 10)}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, borderRadius: `${e.target.value}px` },
                    }))
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT & COPY */}
          {activeTab === 'content' && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white border-b border-white/5 pb-3">
                Content & Micro-Copy
              </h2>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Login Screen Headline
                </label>
                <input
                  type="text"
                  value={config.content.loginHeadline}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      content: { ...prev.content, loginHeadline: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Login Subtext / Description
                </label>
                <textarea
                  value={config.content.loginSubtext}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      content: { ...prev.content, loginSubtext: e.target.value },
                    }))
                  }
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Sign-In CTA Button Text
                </label>
                <input
                  type="text"
                  value={config.content.ctaButtonText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      content: { ...prev.content, ctaButtonText: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Footer Rights Text
                </label>
                <input
                  type="text"
                  value={config.content.footerText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      content: { ...prev.content, footerText: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 4: 3D & LOGIN LAYOUT */}
          {activeTab === 'layout' && (
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white border-b border-white/5 pb-3">
                3D Background & Login Layout
              </h2>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                  Login Layout Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['centered', 'split', 'fullBackground'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          loginLayout: { ...prev.loginLayout, style },
                        }))
                      }
                      className={`rounded-2xl border p-3 text-center text-xs font-bold capitalize transition-all cursor-pointer ${
                        config.loginLayout.style === style
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-md'
                          : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Background Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950 p-4">
                <div>
                  <h3 className="text-xs font-bold text-white">Enable 3D WebGL Background</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Animated Three.js WebGL canvas on login page.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.loginLayout.show3DBackground}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      loginLayout: { ...prev.loginLayout, show3DBackground: e.target.checked },
                    }))
                  }
                  className="h-5 w-5 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* 3D Background Theme Presets */}
              {config.loginLayout.show3DBackground && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-2">
                    3D Visual Effect Theme Preset
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'aurora', name: 'Aurora Plane Mesh' },
                      { id: 'particles', name: 'Floating Particles Field' },
                      { id: 'waves', name: 'Sine Wave Mesh' },
                      { id: 'cybergrid', name: 'Cyberpunk Grid' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            loginLayout: { ...prev.loginLayout, backgroundTheme: preset.id },
                          }))
                        }
                        className={`rounded-2xl border p-3 text-left text-xs font-bold transition-all cursor-pointer ${
                          config.loginLayout.backgroundTheme === preset.id
                            ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                            : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI ASSIST CHAT */}
          {activeTab === 'ai' && (
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-zinc-900/60 to-zinc-900/80 p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 border-b border-indigo-500/20 pb-3">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">AI Natural Language Theme Assistant</h2>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Describe the visual style or vibe you want (e.g. <i>&quot;Neon Cyberpunk vault with bright cyan accents, dark midnight background, and floating particle grid&quot;</i>).
              </p>

              <form onSubmit={handleGenerateAiTheme} className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Modern Minimalist Emerald theme with clean fonts, subtle aurora background wave, and soft rounded corners..."
                  className="w-full rounded-2xl border border-white/15 bg-zinc-950/80 p-4 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Theme with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Generate Theme Proposal</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Preview Frame (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-400" />
              Real-Time Live Canvas Preview
            </h2>
            <div className="flex items-center gap-2 border border-white/10 rounded-xl p-1 bg-zinc-900">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`mx-auto overflow-hidden rounded-3xl border border-white/20 transition-all duration-500 shadow-2xl relative min-h-[580px] flex flex-col justify-center items-center p-6 ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}
            style={{
              backgroundColor: activeDisplayConfig.theme.backgroundColor || '#09090b',
            }}
          >
            {/* 3D Background Render in Preview */}
            {activeDisplayConfig.loginLayout.show3DBackground && (
              <Login3DBackground
                themePreset={activeDisplayConfig.loginLayout.backgroundTheme}
                primaryColor={activeDisplayConfig.theme.primaryColor}
                secondaryColor={activeDisplayConfig.theme.secondaryColor}
                accentColor={activeDisplayConfig.theme.accentColor}
                backgroundColor={activeDisplayConfig.theme.backgroundColor}
              />
            )}

            {/* PREVIEW CONTAINER */}
            <div
              className="w-full max-w-md overflow-hidden border border-white/15 p-8 text-center shadow-2xl backdrop-blur-2xl space-y-5"
              style={{
                borderRadius: activeDisplayConfig.theme.borderRadius || '24px',
                backgroundColor: 'rgba(18, 18, 24, 0.85)',
              }}
            >
              {/* Preview Logo */}
              <div className="flex justify-center">
                {activeDisplayConfig.branding.loginPageLogoUrl || activeDisplayConfig.branding.logoUrl ? (
                  // eslint-disable-next-html-element-suppression
                  <img
                    src={
                      activeDisplayConfig.branding.loginPageLogoUrl ||
                      activeDisplayConfig.branding.logoUrl ||
                      ''
                    }
                    alt="Preview"
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl p-0.5 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${activeDisplayConfig.theme.primaryColor}, ${activeDisplayConfig.theme.secondaryColor})`,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
                      <Shield
                        className="h-7 w-7"
                        style={{ color: activeDisplayConfig.theme.accentColor }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${activeDisplayConfig.theme.primaryColor}20`,
                  borderColor: `${activeDisplayConfig.theme.primaryColor}40`,
                  color: activeDisplayConfig.theme.primaryColor,
                }}
              >
                <Lock className="h-3 w-3" />
                <span>Encrypted Personal Vault</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {activeDisplayConfig.content.loginHeadline}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {activeDisplayConfig.content.loginSubtext}
                </p>
              </div>

              <button
                type="button"
                className="w-full py-3 text-xs font-bold text-white shadow-lg cursor-pointer"
                style={{
                  backgroundColor: activeDisplayConfig.theme.primaryColor,
                  borderRadius: activeDisplayConfig.theme.borderRadius || '9999px',
                }}
              >
                {activeDisplayConfig.content.ctaButtonText || 'Sign in with Google'}
              </button>

              <p className="text-[10px] text-zinc-500 pt-2 border-t border-white/5">
                {activeDisplayConfig.content.footerText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

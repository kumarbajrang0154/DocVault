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
} from 'lucide-react';
import {
  getSiteBrandingAction,
  updateSiteBrandingAction,
  uploadLogoAction,
} from '@/app/actions/branding';

export default function AdminBrandingPage() {
  const [siteName, setSiteName] = useState('DocVault');
  const [tagline, setTagline] = useState('Secure Personal Document Vault');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconEmoji, setFaviconEmoji] = useState('🔒');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [backgroundColor, setBackgroundColor] = useState('#09090b');
  const [accentColor, setAccentColor] = useState('#22d3ee');
  const [welcomeMessage, setWelcomeMessage] = useState('Secure personal document manager with server-side encryption.');
  const [footerText, setFooterText] = useState('DocVault Personal Vault • End-to-End Encrypted');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBranding() {
      try {
        const branding = await getSiteBrandingAction();
        if (branding) {
          setSiteName(branding.siteName);
          setTagline(branding.tagline || '');
          setLogoUrl(branding.logoUrl || '');
          setFaviconEmoji(branding.faviconEmoji || '🔒');
          setPrimaryColor(branding.primaryColor || '#6366f1');
          setSecondaryColor(branding.secondaryColor || '#8b5cf6');
          setBackgroundColor(branding.backgroundColor || '#09090b');
          setAccentColor(branding.accentColor || '#22d3ee');
          setWelcomeMessage(branding.welcomeMessage || '');
          setFooterText(branding.footerText || '');
        }
      } catch (err: unknown) {
        console.error('Failed to load site branding:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBranding();
  }, []);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadLogoAction(formData);

      if (res.success && res.logoUrl) {
        setLogoUrl(res.logoUrl);
        setSuccessMessage('Logo image uploaded successfully to Cloudinary.');
      } else {
        setErrorMessage(res.error || 'Logo upload failed.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logo upload failed.';
      setErrorMessage(msg);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      setErrorMessage('Site Name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updateSiteBrandingAction({
        siteName,
        tagline,
        logoUrl,
        faviconEmoji,
        primaryColor,
        secondaryColor,
        backgroundColor,
        accentColor,
        welcomeMessage,
        footerText,
      });

      if (res.success) {
        setSuccessMessage('Site branding and design portal settings saved globally!');
      } else {
        setErrorMessage(res.error || 'Failed to save branding.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving branding.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
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
              Site Branding & Design Portal
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Customize DocVault&apos;s global visual theme, colors, logos, and copy in real-time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Theme...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Save & Apply Globally</span>
            </>
          )}
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Branding Form Controls */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              1. Brand Identity & Copy
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Site Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  required
                  placeholder="DocVault"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Favicon Emoji
                </label>
                <input
                  type="text"
                  value={faviconEmoji}
                  onChange={(e) => setFaviconEmoji(e.target.value)}
                  placeholder="🔒"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Secure Personal Document Vault"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Custom Logo Upload (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>{isUploadingLogo ? 'Uploading...' : 'Choose Logo Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              {logoUrl && (
                <div className="mt-2 p-2 rounded-xl border border-white/10 bg-zinc-950 inline-block">
                  {/* eslint-disable-next-html-element-suppression */}
                  <img src={logoUrl} alt="Site Logo" className="h-8 w-auto object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Welcome Message (Login Screen)
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={2}
                placeholder="Secure personal document manager..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                Footer Text
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="DocVault Personal Vault • End-to-End Encrypted"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Palette Controls */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              2. Color Palette Customization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Primary Color (Buttons & Highlights)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Secondary Color (Accents & Badges)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Background Color (Global canvas)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300 uppercase">
                  Accent Color (Pills & Special Highlights)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-zinc-950 p-1"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Right Column: Live Interactive Preview Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-indigo-400" />
              Live Theme Preview
            </h2>
            <span className="text-xs text-zinc-500">Real-time dynamic rendering</span>
          </div>

          <div
            className="rounded-3xl border border-white/15 p-6 space-y-6 transition-all duration-300 shadow-2xl"
            style={{ backgroundColor: backgroundColor }}
          >
            {/* Mock Header Component Preview */}
            <div className="rounded-2xl border border-white/10 p-4 bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  // eslint-disable-next-html-element-suppression
                  <img src={logoUrl} alt="Preview Logo" className="h-7 w-auto object-contain" />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl p-0.5"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                      <Shield className="h-4 w-4" style={{ color: accentColor }} />
                    </div>
                  </div>
                )}
                <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  {siteName || 'DocVault'}
                  <span
                    className="rounded-full px-2 py-0.2 text-[9px] font-bold"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      borderColor: `${primaryColor}40`,
                      color: primaryColor,
                    }}
                  >
                    Vault
                  </span>
                </span>
              </div>

              <button
                type="button"
                className="h-8 rounded-xl px-3 text-xs font-bold text-white transition-transform cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Upload File
              </button>
            </div>

            {/* Mock Login Screen Preview */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-6 text-center space-y-4 shadow-xl">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl p-0.5 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-zinc-950">
                  <Shield className="h-6 w-6" style={{ color: accentColor }} />
                </div>
              </div>

              <div
                className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}
              >
                <Lock className="h-3 w-3" />
                <span>Protected Vault</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{siteName}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {welcomeMessage || tagline}
                </p>
              </div>

              <button
                type="button"
                className="w-full rounded-full border border-white/15 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Sign in with Google
              </button>
            </div>

            {/* Mock Footer */}
            <div className="text-center text-[11px] text-zinc-500 pt-2 border-t border-white/5">
              {footerText || `${siteName} Personal Vault`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

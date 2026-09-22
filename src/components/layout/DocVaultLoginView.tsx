'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { signIn } from 'next-auth/react';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { SiteConfigData, DEFAULT_SITE_CONFIG } from '@/lib/siteConfigTypes';

// Lazy load 3D background component (ssr: false)
const Login3DBackground = dynamic(
  () =>
    import('@/components/3d/Login3DBackground').then((mod) => mod.Login3DBackground),
  { ssr: false }
);

interface DocVaultLoginViewProps {
  config?: SiteConfigData;
}

export function DocVaultLoginView({ config = DEFAULT_SITE_CONFIG }: DocVaultLoginViewProps) {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const branding = config.branding || DEFAULT_SITE_CONFIG.branding;
  const theme = config.theme || DEFAULT_SITE_CONFIG.theme;
  const content = config.content || DEFAULT_SITE_CONFIG.content;
  const loginLayout = config.loginLayout || DEFAULT_SITE_CONFIG.loginLayout;

  const logoSrc = branding.loginPageLogoUrl || branding.logoUrl;
  const headline = content.loginHeadline || branding.siteName || 'DocVault';
  const subtext =
    content.loginSubtext ||
    'Secure personal document manager with automatic expiry reminders.';
  const ctaText = content.ctaButtonText || 'Sign in with Google';
  const footerText = content.footerText || 'DocVault Personal Vault • End-to-End Encrypted';

  const layoutStyle = loginLayout.style || 'centered';

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme.backgroundColor || '#09090b' }}
    >
      {/* 3D Animated WebGL Background */}
      {loginLayout.show3DBackground && (
        <Login3DBackground
          themePreset={loginLayout.backgroundTheme || 'aurora'}
          primaryColor={theme.primaryColor}
          secondaryColor={theme.secondaryColor}
          accentColor={theme.accentColor}
          backgroundColor={theme.backgroundColor}
        />
      )}

      {/* Fallback ambient background glow */}
      {!loginLayout.show3DBackground && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30 transition-all"
          style={{
            background: `radial-gradient(circle, ${theme.primaryColor} 0%, ${theme.secondaryColor} 50%, transparent 100%)`,
          }}
        />
      )}

      {/* RENDER LAYOUT STYLE: SPLIT SCREEN */}
      {layoutStyle === 'split' ? (
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-2">
          {/* Left Hero Column */}
          <div
            className="p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.secondaryColor}10 100%)`,
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                {logoSrc ? (
                  // eslint-disable-next-html-element-suppression
                  <img src={logoSrc} alt={headline} className="h-10 w-auto object-contain" />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl p-0.5 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
                      <Shield className="h-6 w-6" style={{ color: theme.accentColor }} />
                    </div>
                  </div>
                )}
                <span className="text-xl font-extrabold tracking-tight text-white">
                  {headline}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Your Secure Personal Vault, Reimagined.
              </h2>
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{subtext}</p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: theme.accentColor }} />
                  <span>AES-256 Server-Side Encryption</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: theme.accentColor }} />
                  <span>Automated Expiry & Renewal Reminders</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: theme.accentColor }} />
                  <span>Strict Owner Session Isolation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-xs text-zinc-500">
              {footerText}
            </div>
          </div>

          {/* Right Action Column */}
          <div className="p-8 sm:p-12 flex flex-col justify-center text-center">
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300 mb-6">
              <Lock className="h-3.5 w-3.5" />
              <span>Owner Access Only</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Sign in to your Vault</h3>
            <p className="text-xs text-zinc-400 mb-8">
              Authenticate via Google OAuth to unlock your encrypted documents.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-white/15 px-6 py-4 text-sm font-semibold text-white transition-all hover:border-white/30 hover:shadow-2xl active:scale-98 cursor-pointer"
              style={{
                backgroundColor: theme.primaryColor,
                borderRadius: theme.borderRadius,
              }}
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>{ctaText}</span>
            </button>
          </div>
        </div>
      ) : (
        /* RENDER LAYOUT STYLE: CENTERED & FULL BACKGROUND */
        <div
          className={`w-full max-w-md overflow-hidden border border-white/10 bg-zinc-900/85 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center transition-all ${
            layoutStyle === 'fullBackground' ? 'scale-105 border-white/20' : ''
          }`}
          style={{ borderRadius: theme.borderRadius || '24px' }}
        >
          {/* Logo or Shield Icon */}
          <div className="mb-6 flex justify-center">
            {logoSrc ? (
              // eslint-disable-next-html-element-suppression
              <img src={logoSrc} alt={headline} className="h-14 w-auto object-contain" />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl p-0.5 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
                  <Shield className="h-8 w-8" style={{ color: theme.accentColor }} />
                </div>
              </div>
            )}
          </div>

          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-medium mb-3"
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              borderColor: `${theme.primaryColor}30`,
              color: theme.primaryColor,
            }}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Encrypted Personal Vault</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {headline}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{subtext}</p>

          {/* Google Authentication Action */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group relative flex w-full items-center justify-center gap-3 border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:shadow-xl active:scale-98 cursor-pointer"
              style={{
                backgroundColor: theme.primaryColor,
                borderRadius: theme.borderRadius || '9999px',
              }}
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>{ctaText}</span>
            </button>
          </div>

          <p className="mt-6 text-[11px] text-zinc-500">{footerText}</p>
        </div>
      )}
    </div>
  );
}

export const AdminLoginView = DocVaultLoginView;

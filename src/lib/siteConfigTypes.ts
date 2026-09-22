export interface SiteBrandingConfig {
  siteName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  loginPageLogoUrl?: string | null;
}

export interface SiteThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface SiteContentConfig {
  loginHeadline: string;
  loginSubtext: string;
  footerText: string;
  ctaButtonText: string;
  emptyStateMessages?: Record<string, string>;
}

export interface SiteLoginLayoutConfig {
  style: 'centered' | 'split' | 'fullBackground';
  show3DBackground: boolean;
  backgroundTheme: string;
}

export interface SiteConfigData {
  id?: string;
  branding: SiteBrandingConfig;
  theme: SiteThemeConfig;
  content: SiteContentConfig;
  loginLayout: SiteLoginLayoutConfig;
  updatedBy?: string | null;
  updatedAt?: Date | string;
}

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  id: 'singleton',
  branding: {
    siteName: 'DocVault',
    logoUrl: null,
    faviconUrl: null,
    loginPageLogoUrl: null,
  },
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#22d3ee',
    backgroundColor: '#09090b',
    textColor: '#f4f4f5',
    fontFamily: 'Inter',
    borderRadius: '16px',
  },
  content: {
    loginHeadline: 'DocVault',
    loginSubtext: 'Secure document manager with automatic expiry reminders.',
    footerText: 'DocVault Personal Vault • End-to-End Encrypted',
    ctaButtonText: 'Sign in with Google',
    emptyStateMessages: {
      noDocuments: 'Your vault is currently empty. Upload your first passport, driver license, or insurance policy.',
      noExpiring: 'All active documents in your vault are up to date.',
    },
  },
  loginLayout: {
    style: 'centered',
    show3DBackground: true,
    backgroundTheme: 'aurora',
  },
};

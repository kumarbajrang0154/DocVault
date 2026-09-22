import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { getSiteConfigAction } from '@/app/actions/siteConfig';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfigAction();
  const siteName = config.branding.siteName || 'DocVault';
  const description =
    config.content.loginSubtext ||
    'Secure personal document manager with server-side encryption and expiry warnings.';

  return {
    title: `${siteName} — Secure Personal Vault`,
    description,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteName,
    },
    icons: config.branding.faviconUrl
      ? {
          icon: config.branding.faviconUrl,
          apple: config.branding.faviconUrl,
        }
      : {
          icon: '/icon-v2.svg',
          apple: '/apple-icon-v2.svg',
        },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfigAction();

  const customCss = `
    :root {
      --primary-color: ${config.theme.primaryColor || '#6366f1'};
      --secondary-color: ${config.theme.secondaryColor || '#8b5cf6'};
      --accent-color: ${config.theme.accentColor || '#22d3ee'};
      --bg-color: ${config.theme.backgroundColor || '#09090b'};
      --text-color: ${config.theme.textColor || '#f4f4f5'};
      --font-family: ${config.theme.fontFamily ? `'${config.theme.fontFamily}', var(--font-geist-sans), system-ui, sans-serif` : 'var(--font-geist-sans), system-ui, sans-serif'};
      --radius: ${config.theme.borderRadius || '16px'};
      --color-primary: ${config.theme.primaryColor || '#6366f1'};
      --color-secondary: ${config.theme.secondaryColor || '#8b5cf6'};
      --color-background: ${config.theme.backgroundColor || '#09090b'};
      --color-accent: ${config.theme.accentColor || '#22d3ee'};
    }
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="apple-touch-icon"
          href={config.branding.faviconUrl || '/apple-icon-v2.svg'}
        />
        <link
          rel="icon"
          href={config.branding.faviconUrl || '/favicon-v2.svg'}
          type="image/svg+xml"
        />
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-500/30 selection:text-white">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

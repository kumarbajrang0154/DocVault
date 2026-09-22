import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/pwa/PwaRegister';
import { getSiteBrandingAction } from '@/app/actions/branding';

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
  const branding = await getSiteBrandingAction();
  const title = branding.tagline
    ? `${branding.siteName} — ${branding.tagline}`
    : branding.siteName;
  const description =
    branding.welcomeMessage ||
    'Secure personal document manager with server-side encryption and expiry warnings.';

  return {
    title,
    description,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: branding.siteName,
    },
    icons: branding.faviconEmoji
      ? {
          icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${branding.faviconEmoji}</text></svg>`,
          apple: '/apple-icon-v2.svg',
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
  const branding = await getSiteBrandingAction();

  const customCss = `
    :root {
      --color-primary: ${branding.primaryColor || '#6366f1'};
      --color-secondary: ${branding.secondaryColor || '#8b5cf6'};
      --color-background: ${branding.backgroundColor || '#09090b'};
      --color-accent: ${branding.accentColor || '#22d3ee'};
    }
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-icon-v2.svg" />
        <link rel="icon" href="/favicon-v2.svg" type="image/svg+xml" />
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-500/30 selection:text-white">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SITE_CONFIG = {
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

async function main() {
  console.log('Seeding initial DocVault database config...');

  await prisma.siteBranding.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'DocVault',
      tagline: 'Secure Personal Document Vault with Expiry Reminders',
      faviconEmoji: '🔒',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#09090b',
      accentColor: '#22d3ee',
      welcomeMessage: 'Secure personal document manager with server-side encryption and expiry warnings.',
      footerText: 'DocVault Personal Vault • End-to-End Encrypted',
    },
  });

  await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      branding: DEFAULT_SITE_CONFIG.branding,
      theme: DEFAULT_SITE_CONFIG.theme,
      content: DEFAULT_SITE_CONFIG.content,
      loginLayout: DEFAULT_SITE_CONFIG.loginLayout,
    },
  });

  console.log('DocVault database seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

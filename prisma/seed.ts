import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

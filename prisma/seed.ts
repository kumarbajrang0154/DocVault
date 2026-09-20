import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial DocVault multi-user database config...');
  const adminEmail = 'kumarbajrang325@gmail.com';

  await prisma.authorizedEmail.upsert({
    where: { email: adminEmail },
    update: { hasLoggedIn: false },
    create: {
      email: adminEmail,
      addedByAdmin: 'system',
      hasLoggedIn: false,
    },
  });

  console.log(`DocVault database seeding completed. Pre-seeded admin allowlist for ${adminEmail}.`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

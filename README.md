# DocVault — Secure Personal Document Manager & Expiry Reminders

DocVault is an end-to-end encrypted personal document vault built on Next.js 15 (App Router), Prisma, PostgreSQL, NextAuth (Google OAuth), and Cloudinary private authenticated asset storage.

## Key Features

- 🔒 **Server-Side AES-256-GCM Encryption**: Files (PDFs, images up to 15MB) are encrypted before uploading to Cloudinary storage.
- 🛡️ **Authenticated Cloudinary Storage**: Cloudinary assets set to `authenticated` type with private signed URLs. Files are decrypted server-side and streamed only to verified document owner sessions.
- 🔑 **Multi-User Google OAuth Security**: Admin allowlist system (`AuthorizedEmail`) with single-owner isolation per account.
- ⏰ **Automated Expiry Reminders**: Tracks document expiration dates (Passports, Driver Licenses, Insurance Policies) with customizable warning thresholds via Vercel Cron.
- 📁 **Searchable & Categorized Organization**: Categorize by ID Proof, Education, Insurance, Financial, Medical, Vehicle, or Other with tag support and full-text search.
- 📜 **Audit Activity Log**: Comprehensive tracking of document uploads, view sessions, metadata edits, and expiry reminder triggers.

## Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Google OAuth with Admin Allowlist)
- **Object Storage**: Cloudinary (Authenticated Raw Assets)
- **Encryption**: Node.js `crypto` (AES-256-GCM)
- **Styling**: Tailwind CSS & Lucide Icons

## Production Database Deployment & Schema Push

Whenever deploying schema updates to production:

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Apply database schema changes to the production database:
   ```bash
   npx prisma db push --accept-data-loss
   ```

3. Seed initial admin allowlist entry (`kumarbajrang325@gmail.com`):
   ```bash
   npx prisma db seed
   ```

4. Start development or deployment build:
   ```bash
   npm run build
   ```

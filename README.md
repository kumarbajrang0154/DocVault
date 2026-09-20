# DocVault — Secure Personal Document Manager & Expiry Reminders

DocVault is an end-to-end encrypted personal document vault built on Next.js 15 (App Router), Prisma, PostgreSQL, NextAuth (Google OAuth), and Cloudflare R2 private bucket storage.

## Key Features

- 🔒 **Server-Side AES-256-GCM Encryption**: Files (PDFs, images up to 15MB) are encrypted before uploading to Cloudflare R2 storage.
- 🛡️ **Zero Public R2 Exposure**: Private Cloudflare R2 bucket with direct public access disabled. Files are decrypted server-side and streamed only to authorized owner sessions.
- 🔑 **Single-Owner Google OAuth Security**: Restricted access tied strictly to authorized owner account (`kumarbajrang325@gmail.com`).
- ⏰ **Automated Expiry Reminders**: Tracks document expiration dates (Passports, Driver Licenses, Insurance Policies) with 30/60/90 day warning thresholds via Vercel Cron.
- 📁 **Searchable & Categorized Organization**: Categorize by ID Proof, Education, Insurance, Financial, Medical, Vehicle, or Other with tag support and full-text search.
- 📜 **Audit Activity Log**: Comprehensive tracking of document uploads, view sessions, metadata edits, and expiry reminder triggers.

## Tech Stack

- **Framework**: Next.js 15 (App Router) & React 19
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Object Storage**: Cloudflare R2 (S3 API Client)
- **Encryption**: Node.js `crypto` (AES-256-GCM)
- **Styling**: Tailwind CSS & Lucide Icons

## Getting Started

1. Copy `.env.example` to `.env.local` and set required environment variables.
2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Run database migrations:
   ```bash
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

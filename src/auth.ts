import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';

export const ADMIN_EMAIL = 'kumarbajrang325@gmail.com';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      const email = user.email.toLowerCase();

      try {
        // a. If User record already exists -> allow sign-in
        const existingUser = await db.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          return true;
        }

        // b. Check if email exists in AuthorizedEmail allowlist
        const authorizedEntry = await db.authorizedEmail.findUnique({
          where: { email },
        });

        if (authorizedEntry) {
          const isAdmin = email === ADMIN_EMAIL.toLowerCase();
          await db.user.create({
            data: {
              email,
              name: user.name || null,
              image: user.image || null,
              isAdmin,
            },
          });

          await db.authorizedEmail.update({
            where: { email },
            data: { hasLoggedIn: true },
          });

          return true;
        }

        // c. Hardcoded primary admin fallback
        if (email === ADMIN_EMAIL.toLowerCase()) {
          await db.user.create({
            data: {
              email,
              name: user.name || null,
              image: user.image || null,
              isAdmin: true,
            },
          });

          await db.authorizedEmail.upsert({
            where: { email },
            update: { hasLoggedIn: true },
            create: {
              email,
              addedByAdmin: 'system',
              hasLoggedIn: true,
            },
          });

          return true;
        }

        // d. Email not authorized -> deny sign-in
        return false;
      } catch (err) {
        console.error('Error during Google OAuth sign-in allowlist check:', err);
        return false;
      }
    },

    async session({ session }) {
      if (session.user && session.user.email) {
        const email = session.user.email.toLowerCase();
        const dbUser = await db.user.findUnique({
          where: { email },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.isAdmin = dbUser.isAdmin;
        }
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

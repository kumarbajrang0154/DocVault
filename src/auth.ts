import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/lib/db';

export const ADMIN_EMAIL = 'kumarbajrang325@gmail.com';

export type UserStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      isSuspended: boolean;
      status: UserStatusType;
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
        const existingUser = await db.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return true;
        }

        // Hardcoded primary admin bypasses PENDING state
        const isAdmin = email === ADMIN_EMAIL.toLowerCase();

        await db.user.create({
          data: {
            email,
            name: user.name || null,
            image: user.image || null,
            isAdmin,
            status: isAdmin ? 'APPROVED' : 'PENDING',
            requestedAt: new Date(),
            reviewedAt: isAdmin ? new Date() : null,
            reviewedBy: isAdmin ? 'system' : null,
          },
        });

        return true;
      } catch (err) {
        console.error('[DocVault OAuth SignIn Error] Detailed database error during user creation/check:', {
          email,
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        return false;
      }
    },

    async session({ session }) {
      if (session.user && session.user.email) {
        const email = session.user.email.toLowerCase();
        try {
          const dbUser = await db.user.findUnique({
            where: { email },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.isAdmin = dbUser.isAdmin;
            session.user.isSuspended = dbUser.isSuspended || false;
            session.user.status = dbUser.status as UserStatusType;
          }
        } catch (err) {
          console.error('[DocVault Session Error] Detailed database error fetching user profile:', {
            email,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          });
        }
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

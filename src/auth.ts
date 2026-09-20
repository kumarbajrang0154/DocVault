import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const AUTHORIZED_ADMIN_EMAIL = 'kumarbajrang325@gmail.com';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
    async authorized({ auth }) {
      // Server-side authorization check for protected admin routes
      if (!auth?.user?.email) return false;
      return auth.user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
    },
  },
  secret: process.env.AUTH_SECRET,
});

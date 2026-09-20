import { auth } from '@/auth';

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return null;
  }
  return session;
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized: Authentication required.');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session.user.isAdmin) {
    throw new Error('Forbidden: Administrator access required.');
  }
  return session;
}

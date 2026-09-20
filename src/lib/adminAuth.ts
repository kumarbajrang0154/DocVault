import { auth, AUTHORIZED_ADMIN_EMAIL } from '@/auth';

export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  if (session.user.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || !session.user?.email) {
    throw new Error('Unauthorized: Admin access required.');
  }
  return session;
}

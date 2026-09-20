import { getAuthSession, requireAdmin, requireAuth } from '@/lib/authGuard';

export const getAdminSession = getAuthSession;
export { requireAdmin, requireAuth };

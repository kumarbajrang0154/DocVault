import { getAuthSession, requireAuth, requireAdmin } from '@/lib/authGuard';

export const getOwnerSession = getAuthSession;
export const requireOwner = requireAuth;
export { requireAdmin, requireAuth };

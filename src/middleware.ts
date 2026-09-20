import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth?.user?.id;
  const isAdmin = !!req.auth?.user?.isAdmin;

  const isProtectedApiRoute = nextUrl.pathname.startsWith('/api/documents');
  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin');

  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  if (isAdminApiRoute && (!isAuthenticated || !isAdmin)) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/api/documents/:path*', '/api/admin/:path*'],
};

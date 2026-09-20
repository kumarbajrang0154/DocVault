import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth?.user;
  const isAuthorizedAdmin = 
    req.auth?.user?.email?.toLowerCase() === 'kumarbajrang325@gmail.com';

  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin');

  // Protect /api/admin/* endpoints
  if (isAdminApiRoute) {
    if (!isAuthenticated || !isAuthorizedAdmin) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }
  }

  // Allow access to /admin page handler to render login/access-denied/dashboard based on server state
  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type ProtectedPrefix = '/command' | '/operations' | '/organizer';

const ALLOWED_ROLES: Record<ProtectedPrefix, string[]> = {
  '/organizer': ['organizer'],
  '/command': ['security', 'organizer'],
  '/operations': ['staff', 'organizer'],
};

function matchProtectedPrefix(pathname: string): ProtectedPrefix | null {
  return (Object.keys(ALLOWED_ROLES) as ProtectedPrefix[]).find((prefix) =>
    pathname.startsWith(prefix)
  ) ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPrefix = matchProtectedPrefix(pathname);
  if (!protectedPrefix) return NextResponse.next();

  const role = request.cookies.get('arena_user_role')?.value;
  const isAuthorized = role !== undefined && ALLOWED_ROLES[protectedPrefix].includes(role);

  if (!isAuthorized) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('unauthorized', protectedPrefix);
    return NextResponse.redirect(redirectUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/command/:path*', '/operations/:path*', '/organizer/:path*'],
};

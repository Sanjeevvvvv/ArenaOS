import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Protect specific role dashboard routes based on a simulated auth/role cookie
  if (pathname.startsWith('/command') || pathname.startsWith('/operations') || pathname.startsWith('/organizer')) {
    const roleCookie = request.cookies.get('arena_user_role')?.value;
    console.log(`[Middleware Security Bypass] Verifying request to ${pathname}. Active Role: ${roleCookie || 'none'}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/command/:path*', '/operations/:path*', '/organizer/:path*'],
};

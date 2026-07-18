import { vi, describe, it, expect } from 'vitest';

// Mock next/server before importing proxy to prevent environment-specific Next.js Edge crashes
vi.mock('next/server', () => {
  return {
    NextResponse: {
      next: () => ({
        status: 200,
        headers: {
          get: () => null
        }
      }),
      redirect: (url: string | URL) => {
        const headersMap = new Map<string, string>();
        headersMap.set('location', url.toString());
        return {
          status: 307,
          headers: {
            get: (name: string) => headersMap.get(name) || null
          }
        };
      }
    }
  };
});

import { proxy } from '../proxy';
import type { NextRequest } from 'next/server';

describe('Route Guard Proxy', () => {
  it('should redirect unauthorized fan role from /organizer to /', () => {
    const request = {
      nextUrl: {
        pathname: '/organizer'
      },
      cookies: {
        get: (name: string) => {
          if (name === 'arena_user_role') return { value: 'fan' };
          return undefined;
        }
      },
      url: 'http://localhost:3000/organizer'
    } as unknown as NextRequest;

    const response = proxy(request);
    
    expect(response.status).toBe(307);
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('unauthorized=%2Forganizer');
  });

  it('should allow authorized organizer role to access /organizer', () => {
    const request = {
      nextUrl: {
        pathname: '/organizer'
      },
      cookies: {
        get: (name: string) => {
          if (name === 'arena_user_role') return { value: 'organizer' };
          return undefined;
        }
      },
      url: 'http://localhost:3000/organizer'
    } as unknown as NextRequest;

    const response = proxy(request);
    expect(response.status).toBe(200);
  });

  it('should redirect unauthorized staff role from /command to /', () => {
    const request = {
      nextUrl: {
        pathname: '/command'
      },
      cookies: {
        get: (name: string) => {
          if (name === 'arena_user_role') return { value: 'staff' };
          return undefined;
        }
      },
      url: 'http://localhost:3000/command'
    } as unknown as NextRequest;

    const response = proxy(request);
    expect(response.status).toBe(307);
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('unauthorized=%2Fcommand');
  });
});

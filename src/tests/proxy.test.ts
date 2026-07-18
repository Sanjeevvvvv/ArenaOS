import { describe, it, expect } from 'vitest';
import { proxy } from '../proxy';
import { NextRequest } from 'next/server';

describe('Route Guard Proxy', () => {
  it('should redirect unauthorized fan role from /organizer to /', () => {
    const url = 'http://localhost:3000/organizer';
    const request = new NextRequest(url, {
      headers: {
        cookie: 'arena_user_role=fan'
      }
    });

    const response = proxy(request);
    
    expect(response.status).toBe(307);
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('unauthorized=%2Forganizer');
  });

  it('should allow authorized organizer role to access /organizer', () => {
    const url = 'http://localhost:3000/organizer';
    const request = new NextRequest(url, {
      headers: {
        cookie: 'arena_user_role=organizer'
      }
    });

    const response = proxy(request);
    expect(response.status).toBe(200);
  });

  it('should redirect unauthorized staff role from /command to /', () => {
    const url = 'http://localhost:3000/command';
    const request = new NextRequest(url, {
      headers: {
        cookie: 'arena_user_role=staff'
      }
    });

    const response = proxy(request);
    expect(response.status).toBe(307);
    const redirectUrl = response.headers.get('location');
    expect(redirectUrl).toContain('unauthorized=%2Fcommand');
  });
});

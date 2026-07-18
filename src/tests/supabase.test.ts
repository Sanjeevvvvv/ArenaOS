import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('MockSupabaseClient Auth and Data Methods', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    
    // Set up high-fidelity mock browser environment for supabase client testing
    global.document = {
      cookie: ''
    } as unknown as Document;
    
    const mockStorage: Storage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => { mockStore[key] = val; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
      key: (_index: number) => null,
      length: 0
    };
    
    global.window = {
      localStorage: mockStorage
    } as unknown as Window & typeof globalThis;
    
    global.localStorage = mockStorage;
  });

  it('should authenticate user and return mock session & sync cookie', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'security@arenaos.fifa',
      password: 'securepassword123'
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe('security@arenaos.fifa');
    expect(data.user?.user_metadata?.role).toBe('security');
    
    // Verify cookie was synced
    expect(global.document.cookie).toContain('arena_user_role=security');
  });

  it('should sign up user and return data structure', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'fan@arenaos.fifa',
      password: 'fanpassword123',
      options: {
        data: { name: 'FIFA Fan', role: 'fan' }
      }
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe('fan@arenaos.fifa');
    expect(data.user?.user_metadata?.role).toBe('fan');
    expect(global.document.cookie).toContain('arena_user_role=fan');
  });

  it('should clear user session & role cookie on signOut', async () => {
    // Login first
    await supabase.auth.signInWithPassword({
      email: 'organizer@arenaos.fifa',
      password: 'organizerpassword'
    });
    expect(global.document.cookie).toContain('arena_user_role=organizer');

    // Sign out
    const { error } = await supabase.auth.signOut();
    expect(error).toBeNull();
    expect(mockStore['arena_user']).toBeUndefined();
    expect(global.document.cookie).toBe('arena_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;');
  });

  it('should return empty mock array from public tables', async () => {
    const res = await supabase.from('alerts').select('*').eq('status', 'active');
    expect(res.data).toEqual([]);
    expect(res.error).toBeNull();
  });

  it('should enforce role-based RLS on security_logs table', async () => {
    // 1. Check blocked access for logged-out/anonymous/fan roles
    mockStore['arena_user'] = JSON.stringify({ user_metadata: { role: 'fan' } });
    const resFan = await supabase.from('security_logs').select('*');
    expect(resFan.data).toEqual([]);
    expect(resFan.error?.message).toContain('Permission denied');

    // 2. Check allowed access for security role
    mockStore['arena_user'] = JSON.stringify({ user_metadata: { role: 'security' } });
    const resSec = await supabase.from('security_logs').select('*');
    expect(resSec.data).toEqual([]);
    expect(resSec.error).toBeNull();

    // 3. Check allowed access for organizer role
    mockStore['arena_user'] = JSON.stringify({ user_metadata: { role: 'organizer' } });
    const resOrg = await supabase.from('security_logs').select('*');
    expect(resOrg.data).toEqual([]);
    expect(resOrg.error).toBeNull();
  });

  it('should enforce role-based RLS on financial_kpis table', async () => {
    // 1. Blocked for staff
    mockStore['arena_user'] = JSON.stringify({ user_metadata: { role: 'staff' } });
    const resStaff = await supabase.from('financial_kpis').select('*');
    expect(resStaff.error?.message).toContain('Permission denied');

    // 2. Allowed for organizer
    mockStore['arena_user'] = JSON.stringify({ user_metadata: { role: 'organizer' } });
    const resOrg = await supabase.from('financial_kpis').select('*');
    expect(resOrg.error).toBeNull();
  });
});

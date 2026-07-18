import { describe, it, expect } from 'vitest';
import { supabase } from '../lib/supabase';

describe('MockSupabaseClient Auth and Data Methods', () => {
  it('should authenticate user and return mock session', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'organizer@arenaos.fifa',
      password: 'mypassword123'
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe('organizer@arenaos.fifa');
    expect(data.user?.user_metadata?.role).toBe('organizer');
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
  });

  it('should return empty mock array from select queries', async () => {
    const res = await supabase.from('alerts').select('*').eq('status', 'active');
    expect(res.data).toEqual([]);
    expect(res.error).toBeNull();
  });
});

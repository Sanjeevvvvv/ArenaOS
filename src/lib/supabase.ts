import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// A high-fidelity Mock Supabase Client that runs entirely in memory / LocalStorage
class MockSupabaseClient {
  auth = {
    getUser: async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('arena_user');
        if (stored) return { data: { user: JSON.parse(stored) }, error: null };
      }
      return { data: { user: null }, error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const user = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        email,
        user_metadata: options?.data || {},
        created_at: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arena_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const user = {
        id: 'usr-admin-101',
        email,
        user_metadata: { name: 'Admin User', role: 'organizer' },
        created_at: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arena_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    },
    signOut: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arena_user');
      }
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      // Return unsubscribe dummy function
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  };

  from(table: string) {
    return {
      select: () => this,
      insert: () => this,
      update: () => this,
      delete: () => this,
      eq: () => this,
      order: () => this,
      single: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null })
    };
  }

  channel() {
    return {
      on: () => this,
      subscribe: () => ({ unsubscribe: () => {} })
    };
  }
}

// Export active Supabase client based on configuration
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as any);

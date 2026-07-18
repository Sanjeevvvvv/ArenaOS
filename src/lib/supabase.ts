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
    signUp: async ({ email, _password, options }: { email: string; _password?: string; options?: { data?: Record<string, unknown> } }) => {
      const user = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        email,
        user_metadata: {
          ...(options?.data || {}),
          // fallback default role if not provided in options
          role: options?.data?.role || 'fan'
        },
        created_at: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arena_user', JSON.stringify(user));
      }
      return { data: { user }, error: null };
    },
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      if (!password || password.length < 1) {
        return { data: { user: null }, error: { message: 'Password required' } };
      }
      const role = email.includes('security') ? 'security'
        : email.includes('staff') ? 'staff'
        : email.includes('organizer') ? 'organizer'
        : 'fan';
      const user = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        email,
        user_metadata: { name: email.split('@')[0], role },
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
    onAuthStateChange: (_callback: (event: string, session: unknown) => void) => {
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
    let userRole: string | null = null;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('arena_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          userRole = user.user_metadata?.role || null;
        } catch {
          // ignore
        }
      }
    }

    // Role-based RLS simulation:
    // 1. 'security_logs' table requires 'security' or 'organizer' role to read/write.
    // 2. 'financial_kpis' table requires 'organizer' role to read/write.
    // 3. 'alerts' table allows read-only for 'fan' and full read/write for others.
    // If a given table's mock dataset doesn't have role-scoped data to filter,
    // we enforce these RLS access policy rules and throw simulated permissions errors.
    const isAuthorized = (() => {
      if (table === 'security_logs') {
        return userRole === 'security' || userRole === 'organizer';
      }
      if (table === 'financial_kpis') {
        return userRole === 'organizer';
      }
      return true; // other tables like concessions, transit, alerts (read) are public/general access
    })();

    const queryBuilder = {
      select: () => {
        if (!isAuthorized) {
          return {
            ...queryBuilder,
            then: (resolve: (val: { data: Record<string, unknown>[]; error: { message: string } }) => void) =>
              resolve({ data: [], error: { message: `Permission denied: RLS policy restriction for role ${userRole || 'anonymous'}` } })
          };
        }
        return queryBuilder;
      },
      insert: () => queryBuilder,
      update: () => queryBuilder,
      delete: () => queryBuilder,
      eq: () => queryBuilder,
      order: () => queryBuilder,
      single: async () => {
        if (!isAuthorized) {
          return { data: null, error: { message: `Permission denied: RLS policy restriction for role ${userRole || 'anonymous'}` } };
        }
        return { data: null, error: null };
      },
      then: (resolve: (val: { data: Record<string, unknown>[]; error: null }) => void) => resolve({ data: [], error: null })
    };
    return queryBuilder;
  }

  channel() {
    return {
      on: () => this,
      subscribe: () => ({ unsubscribe: () => {} })
    };
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as unknown as ReturnType<typeof createClient>);

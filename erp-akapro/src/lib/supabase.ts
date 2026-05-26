import { createBrowserClient } from '@supabase/ssr';

// Helper to get environment variables safely
const getEnv = (name: string) => {
    const value = process.env[name];
    // During build time on Vercel, if keys are missing, we return a dummy string
    // that passes the library's internal validation but won't work for actual requests.
    // This prevents the build from crashing during static generation.
    return value || 'https://placeholder-url.supabase.co';
};

const getAnonKey = () => {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
};

// Lazy initialization pattern
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
    if (!_supabase) {
        _supabase = createBrowserClient(
            getEnv('NEXT_PUBLIC_SUPABASE_URL'),
            getAnonKey()
        );
    }
    return _supabase;
};

// Proxy to maintain the exact same import interface: import { supabase } from '@/lib/supabase'
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
    get(_, prop) {
        const client = getSupabase();
        const value = (client as any)[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});

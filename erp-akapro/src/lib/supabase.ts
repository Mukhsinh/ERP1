import { createBrowserClient } from '@supabase/ssr';

// Note: Next.js requires literal access to process.env.NEXT_PUBLIC_* for static replacement.
// We cannot use dynamic property access like process.env[name].

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Lazy initialization pattern
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
    // If we're still using placeholder values, check if the environment variables 
    // are available (this shouldn't happen if they are correctly set in Vercel)
    if (!_supabase) {
        _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
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

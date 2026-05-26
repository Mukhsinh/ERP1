import { createBrowserClient } from '@supabase/ssr';

// CRITICAL: Next.js only replaces these if accessed directly as process.env.NAME
// If they are missing at BUILD TIME, this will fall back to the strings below.
// This is why they MUST be set in Vercel Dashboard BEFORE building.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization pattern
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = () => {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
            // If still missing, try to read from global window (if injected) or just log a clear error
            console.error("SUPABASE ERROR: Environment variables are missing or still using placeholders.");
            console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.");
        }

        _supabase = createBrowserClient(
            supabaseUrl || 'https://jerjmoswkyqfceapamiq.supabase.co', // Fallback to your actual URL as a last resort
            supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implcmptb3N3a3lxZmNlYXBhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjQ0MTYsImV4cCI6MjA5NTA0MDQxNn0.kjGsH2B_rgwR5JK2Qi8DBDa2C_vk62YFaUPj08BljzM'
        );
    }
    return _supabase;
};

// Proxy to maintain the exact same import interface
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

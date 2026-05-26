import { createBrowserClient } from '@supabase/ssr';

// Literal access for static analysis
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use hardcoded fallbacks to guarantee functionality even if Vercel envs are missing
const DEFAULT_URL = 'https://jerjmoswkyqfceapamiq.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implcmptb3N3a3lxZmNlYXBhbWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjQ0MTYsImV4cCI6MjA5NTA0MDQxNn0.kjGsH2B_rgwR5JK2Qi8DBDa2C_vk62YFaUPj08BljzM';

const finalUrl = (publicUrl && !publicUrl.includes('placeholder')) ? publicUrl : DEFAULT_URL;
const finalAnonKey = (publicAnonKey && !publicAnonKey.includes('placeholder')) ? publicAnonKey : DEFAULT_ANON_KEY;

// Export the client directly. 
// Standard Supabase pattern to avoid Proxy issues.
export const supabase = createBrowserClient(finalUrl, finalAnonKey);

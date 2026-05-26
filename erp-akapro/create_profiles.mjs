import fs from 'fs';
import 'dotenv/config';

async function executeSql(sql) {
    const projectRef = 'jerjmoswkyqfceapamiq';
    const token = process.env.SUPABASE_ACCESS_TOKEN;
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });
    return await response.json();
}

async function main() {
    const profilesSql = `
        CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            full_name TEXT,
            avatar_url TEXT,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    `;
    console.log("Creating profiles table...");
    await executeSql(profilesSql);
    console.log("Profiles table created.");
}

main();

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

    const result = await response.json();
    if (!response.ok) {
        throw new Error(`API Error: ${JSON.stringify(result)}`);
    }
    return result;
}

async function main() {
    try {
        console.log("Applying Public Schema Migration (20260525)...");
        const publicMigration = fs.readFileSync('supabase/migrations/20260525_public_schema_tables.sql', 'utf8');
        await executeSql(publicMigration);
        console.log("Public schema migration applied successfully.");
    } catch (err) {
        console.error("Execution failed:", err.message);
    }
}

main();

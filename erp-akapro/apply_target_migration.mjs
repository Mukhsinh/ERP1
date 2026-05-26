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
    return result;
}

async function main() {
    try {
        console.log("Applying Public Schema Migration (20260525) with sanitized references...");
        let publicMigration = fs.readFileSync('supabase/migrations/20260525_public_schema_tables.sql', 'utf8');

        // Ensure accounting schema exists
        await executeSql("CREATE SCHEMA IF NOT EXISTS accounting;");

        // Create coa table if not exists since it's referenced
        const coaSql = `
            CREATE TABLE IF NOT EXISTS accounting.chart_of_accounts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code TEXT NOT NULL,
                name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
            );
        `;
        await executeSql(coaSql);

        const r = await executeSql(publicMigration);
        console.log("Result:", JSON.stringify(r));
    } catch (err) {
        console.error("Execution failed:", err.message);
    }
}

main();

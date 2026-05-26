import fs from 'fs';
import 'dotenv/config';

async function executeSql(sql) {
    const projectRef = 'jerjmoswkyqfceapamiq';
    const token = process.env.SUPABASE_ACCESS_TOKEN;

    console.log(`Sending SQL to project ${projectRef}...`);

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
        // 1. Run Master Schema (if not already applied)
        console.log("Reading master schema...");
        const masterSchema = fs.readFileSync('../database/schema.sql', 'utf8');
        await executeSql(masterSchema);
        console.log("Master schema applied or already exists.");

        // 2. Run Public Schema Migration
        console.log("Reading public schema migration...");
        const publicMigration = fs.readFileSync('supabase/migrations/20260525_public_schema_tables.sql', 'utf8');
        await executeSql(publicMigration);
        console.log("Public schema migration applied.");

        console.log("All tables created successfully.");
    } catch (err) {
        console.error("Execution failed:", err.message);
    }
}

main();

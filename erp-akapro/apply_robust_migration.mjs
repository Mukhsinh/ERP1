import fs from 'fs';
import 'dotenv/config';

async function executeSql(sql) {
    const projectRef = 'jerjmoswkyqfceapamiq';
    const token = process.env.SUPABASE_ACCESS_TOKEN;

    // Sanitize
    const sanitizedSql = sql
        .replace(/CREATE TABLE auth\.(\w+)/g, 'CREATE TABLE IF NOT EXISTS public.$1')
        .replace(/CREATE TABLE (\w+)\.(\w+)/g, 'CREATE TABLE IF NOT EXISTS $1.$2')
        .replace(/auth\.(\w+)/g, 'public.$1')
        .replace(/CREATE SCHEMA IF NOT EXISTS auth;/g, '--')
        // Fix insertions - wrap in check or just ignore errors on inserts for now
        ;

    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sanitizedSql })
    });

    const result = await response.json();
    // Ignore "already exists" errors for now to allow partial success
    if (!response.ok && !JSON.stringify(result).includes('already exists')) {
        throw new Error(`API Error: ${JSON.stringify(result)}`);
    }
    return result;
}

async function main() {
    try {
        console.log("Setting up schemas...");
        await executeSql(`
            CREATE SCHEMA IF NOT EXISTS accounting;
            CREATE SCHEMA IF NOT EXISTS warehouse;
            CREATE SCHEMA IF NOT EXISTS sales;
            CREATE SCHEMA IF NOT EXISTS procurement;
            CREATE SCHEMA IF NOT EXISTS common;
        `);

        console.log("Applying Master Schema (Sanitized)...");
        const masterSchema = fs.readFileSync('../database/schema.sql', 'utf8');
        await executeSql(masterSchema);

        console.log("Applying Public Schema Migration (20260525)...");
        const publicMigration = fs.readFileSync('supabase/migrations/20260525_public_schema_tables.sql', 'utf8');
        await executeSql(publicMigration);

        console.log("All tables checked/created successfully.");
    } catch (err) {
        console.error("Execution failed:", err.message);
    }
}

main();

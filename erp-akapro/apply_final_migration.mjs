import fs from 'fs';
import 'dotenv/config';

async function executeSql(sql) {
    const projectRef = 'jerjmoswkyqfceapamiq';
    const token = process.env.SUPABASE_ACCESS_TOKEN;

    // Replace auth. references that we want in public
    const sanitizedSql = sql
        .replace(/auth\.tenants/g, 'public.tenants')
        .replace(/auth\.branches/g, 'public.branches')
        .replace(/auth\.users/g, 'public.users')
        .replace(/auth\.roles/g, 'public.roles')
        .replace(/auth\.permissions/g, 'public.permissions')
        .replace(/auth\.role_permissions/g, 'public.role_permissions')
        .replace(/auth\.user_roles/g, 'public.user_roles')
        .replace(/CREATE SCHEMA IF NOT EXISTS auth;/g, '--')
        // Ensure we don't accidentally replace Supabase Auth functions if any
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
    if (!response.ok) {
        throw new Error(`API Error: ${JSON.stringify(result)}`);
    }
    return result;
}

async function main() {
    try {
        console.log("Setting up schemas...");
        const setupSchemasSql = `
            CREATE SCHEMA IF NOT EXISTS accounting;
            CREATE SCHEMA IF NOT EXISTS warehouse;
            CREATE SCHEMA IF NOT EXISTS sales;
            CREATE SCHEMA IF NOT EXISTS procurement;
            CREATE SCHEMA IF NOT EXISTS common;
        `;
        await executeSql(setupSchemasSql);

        console.log("Applying Master Schema (Sanitized)...");
        const masterSchema = fs.readFileSync('../database/schema.sql', 'utf8');
        await executeSql(masterSchema);

        console.log("Applying Public Schema Migration (20260525)...");
        const publicMigration = fs.readFileSync('supabase/migrations/20260525_public_schema_tables.sql', 'utf8');
        await executeSql(publicMigration);

        console.log("All tables created successfully.");
    } catch (err) {
        console.error("Execution failed:", err.message);
    }
}

main();

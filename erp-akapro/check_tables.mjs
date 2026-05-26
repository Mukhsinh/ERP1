import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jerjmoswkyqfceapamiq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implcmptb3N3a3lxZmNlYXBhbWlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDQxNiwiZXhwIjoyMDk1MDQwNDE2fQ.EP89hGM_Czagq2k3Sm-QSbzawzoP4VlGacwgOjFeZac';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log("Checking tables in public schema...");
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (error) {
        // information_schema might not be accessible via postgrest easily if not exposed
        // fallback to a simple query
        const { data: tables, error: sqlError } = await supabase.rpc('get_tables_count'); // if exists
        // actually let's just try to select from a known table
        console.error("Error accessing information_schema:", error.message);
    } else {
        console.log("Tables found:", data.map(t => t.table_name));
    }

    // Better way: use the SQL API via fetch
    const fetch = (await import('node-fetch')).default;
    const sqlQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'";
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/is_table_exists`, { // This is not standard
        // Use the proper management API or just try to select from required tables
    });
}

// Actually, I'll just use a more direct approach: try to find each table from my list
async function analyze() {
    const requiredTables = [
        'tenants', 'branches', 'profiles', 'chart_of_accounts',
        'budget_fiscal_years', 'budget_items', 'budget_approvals', 'budget_revisions',
        'asset_register', 'asset_disposals', 'asset_depreciation_logs',
        'opex_vouchers', 'accounting_journals', 'accounting_general_ledger',
        'warehouse_stock_movements'
    ];

    console.log("Analyzing existing tables...");
    for (const table of requiredTables) {
        const { error } = await supabase.from(table).select('*').limit(0);
        if (error) {
            if (error.code === 'PGRST116' || error.code === '42P01') {
                console.log(`[MISSING] ${table}`);
            } else {
                console.log(`[ERROR] ${table}: ${error.message} (${error.code})`);
            }
        } else {
            console.log(`[EXISTS] ${table}`);
        }
    }
}

analyze();

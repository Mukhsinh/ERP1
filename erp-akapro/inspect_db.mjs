import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jerjmoswkyqfceapamiq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implcmptb3N3a3lxZmNlYXBhbWlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2NDQxNiwiZXhwIjoyMDk1MDQwNDE2fQ.EP89hGM_Czagq2k3Sm-QSbzawzoP4VlGacwgOjFeZac';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTenants() {
    console.log("Inspecting 'tenants' table...");
    // Try to get one row
    const { data, error } = await supabase.from('tenants').select('*').limit(1);
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Data sample:", data);
    }
}

inspectTenants();

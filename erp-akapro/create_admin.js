const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
    const email = 'mukhsin9@gmail.com';
    const password = 'Jlamprang233!!';

    console.log(`Creating user ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user.id);

        // Add to public.profiles or similar if needed for Role Based Access Control
        // In our schema, we might have a users table in the public schema or similar.
        // Let's check the schema if there's a specialized user table.
    }
}

createSuperAdmin();

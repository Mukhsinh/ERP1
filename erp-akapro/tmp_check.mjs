import 'dotenv/config';

async function main() {
    const token = process.env.SUPABASE_ACCESS_TOKEN;
    try {
        const r = await fetch('https://api.supabase.com/v1/projects', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const projects = await r.json();
        console.log("=== PROJECTS WITH NEW TOKEN ===");
        console.log(JSON.stringify(projects, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}
main();

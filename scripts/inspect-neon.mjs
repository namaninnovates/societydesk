import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function run() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log("Tables in public schema:", tables.map(t => t.table_name));

  for (const t of tables) {
    const cols = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${t.table_name}
    `;
    console.log(`\nTable ${t.table_name}:`, cols.map(c => `${c.column_name} (${c.data_type})`));
  }
}

run().catch(console.error);

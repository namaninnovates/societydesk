import pg from "pg";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new pg.Pool({ connectionString: databaseUrl });

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT schema_name FROM information_schema.schemata");
    console.log("Schemas:", res.rows.map(r => r.schema_name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}
run();

import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function run() {
  const profiles = await sql`SELECT * FROM profiles`;
  console.log("Profiles in Neon:", profiles);
}

run().catch(console.error);

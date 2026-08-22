import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function run() {
  const adminHash = await bcrypt.hash("SocietyDesk@2026!", 10);
  const resHash = await bcrypt.hash("Resident@2026!", 10);

  await sql`UPDATE profiles SET password_hash = ${adminHash} WHERE email = 'admin@societydesk.com'`;
  await sql`UPDATE profiles SET password_hash = ${resHash} WHERE email = 'resident@societydesk.com'`;

  const rows = await sql`SELECT id, email, role, substring(password_hash from 1 for 15) as hash_preview FROM profiles`;
  console.log("Updated accounts with Bcrypt password hashes:", rows);
}

run().catch(console.error);

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

const SALT = "societydesk_auth_salt_2026";
function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 10000, 64, "sha512").toString("hex");
}
function verifyPassword(password, hash) {
  const calculated = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash));
}

async function test() {
  console.log("Checking Neon profiles...");
  // Re-hash admin with SALT
  const adminHash = hashPassword("SocietyDesk@2026!");
  await sql`UPDATE profiles SET password_hash = ${adminHash} WHERE email = 'admin@societydesk.com'`;

  const resHash = hashPassword("Resident@2026!");
  await sql`UPDATE profiles SET password_hash = ${resHash} WHERE email = 'resident@societydesk.com'`;

  const [admin] = await sql`SELECT id, email, password_hash, role FROM profiles WHERE email = 'admin@societydesk.com'`;
  console.log("Admin verified:", verifyPassword("SocietyDesk@2026!", admin.password_hash));

  const [resident] = await sql`SELECT id, email, password_hash, role FROM profiles WHERE email = 'resident@societydesk.com'`;
  console.log("Resident verified:", verifyPassword("Resident@2026!", resident.password_hash));
}
test().catch(console.error);

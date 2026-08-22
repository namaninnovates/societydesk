import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const databaseUrl = "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

export function hashPassword(password) {
  const salt = "societydesk_salt_2026";
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

async function run() {
  console.log("Upgrading profiles table in Neon DB...");
  await sql`
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS email text UNIQUE,
    ADD COLUMN IF NOT EXISTS password_hash text
  `;
  console.log("Columns added.");

  // Also check complaint_photos column for storing data url or path
  await sql`
    ALTER TABLE complaint_photos
    ADD COLUMN IF NOT EXISTS photo_data text
  `;

  // Seed Admin user
  const adminEmail = "admin@societydesk.com";
  const adminPass = "SocietyDesk@2026!";
  const adminHash = hashPassword(adminPass);

  const existingAdmin = await sql`SELECT id FROM profiles WHERE email = ${adminEmail}`;
  if (existingAdmin.length === 0) {
    const [admin] = await sql`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, unit_number, block, phone
      ) VALUES (
        gen_random_uuid(), 'Society Administrator', ${adminEmail}, ${adminHash}, 'admin', 'OFFICE-101', 'Clubhouse', '+91 98765 43210'
      ) RETURNING *
    `;
    console.log("Seeded Admin user:", admin);
  } else {
    await sql`
      UPDATE profiles 
      SET password_hash = ${adminHash}, role = 'admin', full_name = 'Society Administrator'
      WHERE email = ${adminEmail}
    `;
    console.log("Updated Admin credentials in Neon.");
  }

  // Seed Demo Resident
  const resEmail = "resident@societydesk.com";
  const resPass = "Resident@2026!";
  const resHash = hashPassword(resPass);

  const existingRes = await sql`SELECT id FROM profiles WHERE email = ${resEmail}`;
  if (existingRes.length === 0) {
    const [resident] = await sql`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, unit_number, block, phone
      ) VALUES (
        gen_random_uuid(), 'Rahul Sharma', ${resEmail}, ${resHash}, 'resident', 'B-1204', 'Tower B', '+91 98765 12345'
      ) RETURNING *
    `;
    console.log("Seeded Demo Resident user:", resident);
  } else {
    await sql`
      UPDATE profiles 
      SET password_hash = ${resHash}, role = 'resident', full_name = 'Rahul Sharma'
      WHERE email = ${resEmail}
    `;
    console.log("Updated Resident credentials in Neon.");
  }

  const all = await sql`SELECT id, full_name, email, role, unit_number, block FROM profiles`;
  console.log("Current profiles in Neon DB:", all);
}

run().catch(console.error);

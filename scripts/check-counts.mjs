import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env['DATABASE_URL'] ||
  "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(databaseUrl);

async function check() {
  const profiles = await sql`SELECT count(*) FROM profiles`;
  const complaints = await sql`SELECT count(*) FROM complaints`;
  const history = await sql`SELECT count(*) FROM complaint_history`;
  const comments = await sql`SELECT count(*) FROM complaint_comments`;
  const feedback = await sql`SELECT count(*) FROM resolution_feedback`;
  const notices = await sql`SELECT count(*) FROM notices`;
  const thresholds = await sql`SELECT count(*) FROM overdue_thresholds`;

  console.log({
    profiles: profiles[0].count,
    complaints: complaints[0].count,
    history: history[0].count,
    comments: comments[0].count,
    feedback: feedback[0].count,
    notices: notices[0].count,
    thresholds: thresholds[0].count,
  });
}

check().catch(console.error);

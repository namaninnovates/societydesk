// Server-side Neon database client.
// SECURITY: Only use this for server-side operations (server functions, server handlers, SSR).
// Never import this into client-side components to avoid leaking credentials.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function createNeonClient(): NeonQueryFunction<false, false> {
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    const message = "Missing DATABASE_URL environment variable. Please check your .env file.";
    console.error(`[Neon DB] ${message}`);
    throw new Error(message);
  }

  return neon(databaseUrl);
}

let _sql: NeonQueryFunction<false, false> | undefined;

export const sql: NeonQueryFunction<false, false> = ((...args: Parameters<NeonQueryFunction<false, false>>) => {
  if (!_sql) {
    _sql = createNeonClient();
  }
  return _sql(...args);
}) as unknown as NeonQueryFunction<false, false>;

export { neon };

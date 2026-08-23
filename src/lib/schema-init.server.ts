let initialized = false;

export async function ensureDatabaseSchema() {
  if (initialized) return;
  try {
    const { sql } = await import("@/integrations/neon/client.server");
    // Ensure 'staff' enum value is present
    await sql`
      DO $$ BEGIN
        ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN undefined_object THEN null;
      END $$;
    `;
    // Ensure assigned_to column exists on complaints
    await sql`
      ALTER TABLE public.complaints
      ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    `;
    initialized = true;
  } catch (err) {
    // Non-blocking schema check
    console.warn("[Schema Init] Schema check notice:", err);
  }
}

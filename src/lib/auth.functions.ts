import { createServerFn } from "@tanstack/react-start";

export type AuthProfile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "resident";
  unit_number: string | null;
  block: string | null;
  phone: string | null;
  created_at: string;
};

type DbProfile = AuthProfile & {
  password_hash: string;
};

export const signInServerFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const { email, password } = data;
    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    const { verifyPassword, createJwtToken } = await import("@/lib/auth.server");

    const rows = (await sql`
      SELECT id, email, password_hash, full_name, role, unit_number, block, phone, created_at
      FROM profiles
      WHERE LOWER(email) = LOWER(${email.trim()})
      LIMIT 1
    `) as unknown as DbProfile[];

    const user = rows[0];
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = user.password_hash ? await verifyPassword(password, user.password_hash) : false;
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = await createJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const profile: AuthProfile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      unit_number: user.unit_number,
      block: user.block,
      phone: user.phone,
      created_at: user.created_at,
    };

    return { token, profile };
  });

export const signUpServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      full_name: string;
      email: string;
      password: string;
      unit_number: string;
      block: string;
      phone: string;
      role?: "admin" | "staff" | "resident";
    }) => d,
  )
  .handler(async ({ data }) => {
    const { full_name, email, password, unit_number, block, phone, role = "resident" } = data;
    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    const { hashPassword, createJwtToken } = await import("@/lib/auth.server");

    const existing = await sql`
      SELECT id FROM profiles WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
    `;

    if (existing.length > 0) {
      throw new Error("An account with this email already exists");
    }

    const password_hash = await hashPassword(password);

    const rows = (await sql`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, unit_number, block, phone
      ) VALUES (
        gen_random_uuid(),
        ${full_name.trim()},
        ${email.trim().toLowerCase()},
        ${password_hash},
        ${role},
        ${unit_number.trim()},
        ${block.trim()},
        ${phone.trim()}
      )
      RETURNING id, email, full_name, role, unit_number, block, phone, created_at
    `) as unknown as AuthProfile[];

    const newUser = rows[0];
    if (!newUser) {
      throw new Error("Failed to create profile");
    }

    const token = await createJwtToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const profile: AuthProfile = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      unit_number: newUser.unit_number,
      block: newUser.block,
      phone: newUser.phone,
      created_at: newUser.created_at,
    };

    return { token, profile };
  });

export const getCurrentUserServerFn = createServerFn({ method: "GET" })
  .validator((token?: string | null) => token)
  .handler(async ({ data: clientToken }) => {
    const token = clientToken;
    if (!token) return null;

    const { verifyJwtToken } = await import("@/lib/auth.server");
    const session = await verifyJwtToken(token);
    if (!session) return null;

    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    const rows = (await sql`
      SELECT id, email, full_name, role, unit_number, block, phone, created_at
      FROM profiles
      WHERE id = ${session.id}
      LIMIT 1
    `) as unknown as AuthProfile[];

    const user = rows[0];
    if (!user) return null;

    const profile: AuthProfile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      unit_number: user.unit_number,
      block: user.block,
      phone: user.phone,
      created_at: user.created_at,
    };

    return profile;
  });

export const updateProfileServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      token: string;
      full_name: string;
      unit_number?: string | null;
      block?: string | null;
      phone?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { token, full_name, unit_number, block, phone } = data;
    const { verifyJwtToken } = await import("@/lib/auth.server");
    const session = await verifyJwtToken(token);
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { sql } = await import("@/integrations/neon/client.server");
    const rows = (await sql`
      UPDATE profiles
      SET 
        full_name = ${full_name.trim()},
        unit_number = ${unit_number?.trim() ?? null},
        block = ${block?.trim() ?? null},
        phone = ${phone?.trim() ?? null}
      WHERE id = ${session.id}
      RETURNING id, email, full_name, role, unit_number, block, phone, created_at
    `) as unknown as AuthProfile[];

    const updated = rows[0];
    if (!updated) {
      throw new Error("Profile not found");
    }

    return updated;
  });

export const fetchResidentsServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
  await ensureDatabaseSchema();

  const { sql } = await import("@/integrations/neon/client.server");
  const rows = (await sql`
    SELECT id, full_name, email, role, unit_number, block, phone, created_at
    FROM profiles
    ORDER BY role ASC, block ASC, unit_number ASC
  `) as unknown as AuthProfile[];
  return rows;
});

export const fetchStaffMembersServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
  await ensureDatabaseSchema();

  const { sql } = await import("@/integrations/neon/client.server");
  const rows = (await sql`
    SELECT id, full_name, email, role, unit_number, block, phone, created_at
    FROM profiles
    WHERE role = 'staff'
    ORDER BY full_name ASC
  `) as unknown as AuthProfile[];
  return rows;
});

export const createUserByAdminServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      full_name: string;
      email: string;
      password: string;
      role: "admin" | "staff" | "resident";
      unit_number?: string | null;
      block?: string | null;
      phone?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { full_name, email, password, role, unit_number, block, phone } = data;
    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    const { hashPassword } = await import("@/lib/auth.server");

    const existing = await sql`
      SELECT id FROM profiles WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1
    `;

    if (existing.length > 0) {
      throw new Error("A user with this email already exists");
    }

    const password_hash = await hashPassword(password || "SocietyDesk@2026");

    const rows = (await sql`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, unit_number, block, phone
      ) VALUES (
        gen_random_uuid(),
        ${full_name.trim()},
        ${email.trim().toLowerCase()},
        ${password_hash},
        ${role},
        ${unit_number?.trim() || null},
        ${block?.trim() || null},
        ${phone?.trim() || null}
      )
      RETURNING id, email, full_name, role, unit_number, block, phone, created_at
    `) as unknown as AuthProfile[];

    return rows[0];
  });

export const updateUserRoleServerFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; role: "admin" | "staff" | "resident" }) => d)
  .handler(async ({ data }) => {
    const { userId, role } = data;
    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    await sql`
      UPDATE profiles
      SET role = ${role}
      WHERE id = ${userId}
    `;
    return { success: true };
  });

export const updateUserServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      userId: string;
      full_name: string;
      email: string;
      role: "admin" | "staff" | "resident";
      unit_number?: string | null;
      block?: string | null;
      phone?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    const { userId, full_name, email, role, unit_number, block, phone } = data;
    const { ensureDatabaseSchema } = await import("@/lib/schema-init.server");
    await ensureDatabaseSchema();

    const { sql } = await import("@/integrations/neon/client.server");
    await sql`
      UPDATE profiles
      SET 
        full_name = ${full_name.trim()},
        email = ${email.trim().toLowerCase()},
        role = ${role},
        unit_number = ${unit_number?.trim() || null},
        block = ${block?.trim() || null},
        phone = ${phone?.trim() || null}
      WHERE id = ${userId}
    `;
    return { success: true };
  });

export const deleteUserServerFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    const { userId } = data;
    const { sql } = await import("@/integrations/neon/client.server");
    await sql`DELETE FROM profiles WHERE id = ${userId}`;
    return { success: true };
  });

export const signOutServerFn = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});

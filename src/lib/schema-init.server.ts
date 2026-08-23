let initialized = false;

export async function ensureDatabaseSchema() {
  if (initialized) return;
  try {
    const { sql } = await import("@/integrations/neon/client.server");
    const { hashPassword } = await import("@/lib/auth.server");

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

    // 3. Seed exact 3 Admins, 5 Staff, and Residents
    const seedUsers = [
      // 1. Super Admin (Naman Gupta)
      {
        email: "naman@societydesk.com",
        full_name: "Naman Gupta",
        role: "admin" as const,
        block: "Tower A",
        unit_number: "Penthouse 01",
        phone: "+91 98765 00001",
        password: "SocietyDesk@2026!",
      },

      // 2. 2 Committee Admins
      {
        email: "rohit.admin@societydesk.com",
        full_name: "Rohit Khanna",
        role: "admin" as const,
        block: "Clubhouse",
        unit_number: "Admin Office 1",
        phone: "+91 98765 00002",
        password: "SocietyDesk@2026!",
      },
      {
        email: "meera.admin@societydesk.com",
        full_name: "Meera Sengupta",
        role: "admin" as const,
        block: "Clubhouse",
        unit_number: "Admin Office 2",
        phone: "+91 98765 00003",
        password: "SocietyDesk@2026!",
      },

      // 3. 5 Staff Workers / Technicians
      {
        email: "ramesh.staff@societydesk.com",
        full_name: "Ramesh Kumar (Electrician & Lift)",
        role: "staff" as const,
        block: "Tower B",
        unit_number: "Electrical Room",
        phone: "+91 98765 11001",
        password: "Staff@2026!",
      },
      {
        email: "suresh.staff@societydesk.com",
        full_name: "Suresh Sharma (Head Plumber)",
        role: "staff" as const,
        block: "Basement 1",
        unit_number: "Pump House",
        phone: "+91 98765 11002",
        password: "Staff@2026!",
      },
      {
        email: "manoj.staff@societydesk.com",
        full_name: "Manoj Verma (Security Head)",
        role: "staff" as const,
        block: "Main Gate",
        unit_number: "Gate 1",
        phone: "+91 98765 11003",
        password: "Staff@2026!",
      },
      {
        email: "amit.staff@societydesk.com",
        full_name: "Amit Singh (HVAC & Generator)",
        role: "staff" as const,
        block: "Service Block",
        unit_number: "DG Yard",
        phone: "+91 98765 11004",
        password: "Staff@2026!",
      },
      {
        email: "rajesh.staff@societydesk.com",
        full_name: "Rajesh Patel (Civil & Carpentry)",
        role: "staff" as const,
        block: "Service Block",
        unit_number: "Maintenance Shed",
        phone: "+91 98765 11005",
        password: "Staff@2026!",
      },

      // 4. Residents
      {
        email: "resident@societydesk.com",
        full_name: "Priya Sharma",
        role: "resident" as const,
        block: "Tower B",
        unit_number: "Flat 402",
        phone: "+91 98765 22001",
        password: "Resident@2026!",
      },
      {
        email: "vikram.malhotra@societydesk.com",
        full_name: "Vikram Malhotra",
        role: "resident" as const,
        block: "Tower A",
        unit_number: "Flat 801",
        phone: "+91 98765 22002",
        password: "Resident@2026!",
      },
      {
        email: "ananya.desai@societydesk.com",
        full_name: "Ananya Desai",
        role: "resident" as const,
        block: "Tower C",
        unit_number: "Flat 304",
        phone: "+91 98765 22003",
        password: "Resident@2026!",
      },
      {
        email: "rohit.joshi@societydesk.com",
        full_name: "Rohit Joshi",
        role: "resident" as const,
        block: "Tower B",
        unit_number: "Flat 1102",
        phone: "+91 98765 22004",
        password: "Resident@2026!",
      },
      {
        email: "kavita.rao@societydesk.com",
        full_name: "Kavita Rao",
        role: "resident" as const,
        block: "Tower D",
        unit_number: "Flat 505",
        phone: "+91 98765 22005",
        password: "Resident@2026!",
      },
    ];

    for (const u of seedUsers) {
      const existing = (await sql`
        SELECT id FROM public.profiles WHERE LOWER(email) = LOWER(${u.email}) LIMIT 1
      `) as unknown as { id: string }[];

      const password_hash = await hashPassword(u.password);

      if (existing.length > 0) {
        // Update user information and role
        await sql`
          UPDATE public.profiles
          SET full_name = ${u.full_name},
              role = ${u.role}::public.app_role,
              block = ${u.block},
              unit_number = ${u.unit_number},
              phone = ${u.phone},
              password_hash = ${password_hash}
          WHERE id = ${existing[0]!.id}
        `;
      } else {
        // Insert new user
        await sql`
          INSERT INTO public.profiles (
            id, full_name, email, password_hash, role, unit_number, block, phone
          ) VALUES (
            gen_random_uuid(),
            ${u.full_name},
            ${u.email.toLowerCase()},
            ${password_hash},
            ${u.role}::public.app_role,
            ${u.unit_number},
            ${u.block},
            ${u.phone}
          )
        `;
      }
    }

    // Strictly enforce exactly 3 total admins in the system
    await sql`
      UPDATE public.profiles
      SET role = 'resident'::public.app_role
      WHERE role = 'admin'::public.app_role
        AND LOWER(email) NOT IN ('naman@societydesk.com', 'rohit.admin@societydesk.com', 'meera.admin@societydesk.com')
    `;

    // Remove legacy placeholder admin email
    await sql`
      DELETE FROM public.profiles
      WHERE LOWER(email) = 'admin@societydesk.com'
    `;

    initialized = true;
  } catch (err) {
    console.warn("[Schema Init] Notice:", err);
  }
}

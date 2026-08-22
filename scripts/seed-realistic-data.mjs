import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const databaseUrl =
  process.env['DATABASE_URL'] ||
  "postgresql://neondb_owner:npg_A1Y6EKQLqSPI@ep-late-resonance-azp3y5ii-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function seed() {
  console.log("🌱 Starting realistic data seeding for SocietyDesk...");

  const defaultPassword = await bcrypt.hash("SocietyDesk@2026!", 10);
  const residentPassword = await bcrypt.hash("Resident@2026!", 10);

  // 1. CLEAR EXISTING DUMMY DATA CLEANLY
  await sql`DELETE FROM resolution_feedback`;
  await sql`DELETE FROM complaint_comments`;
  await sql`DELETE FROM complaint_history`;
  await sql`DELETE FROM complaint_photos`;
  await sql`DELETE FROM complaints`;
  await sql`DELETE FROM notices`;
  await sql`DELETE FROM overdue_thresholds`;
  await sql`DELETE FROM profiles`;

  console.log("✓ Cleared past test records");

  // 2. SEED PROFILES (Admins + Diverse Residents)
  const adminProfiles = [
    {
      id: "4d634d69-44c8-44bb-8317-99b337352066",
      full_name: "Rajesh Nair (Estate Manager)",
      email: "admin@societydesk.com",
      role: "admin",
      unit_number: "OFFICE-101",
      block: "Clubhouse",
      phone: "+91 98201 54321",
    },
    {
      id: "6e218b44-33a1-4cf1-9022-bb583a270119",
      full_name: "Col. Suresh Menon (RWA Secretary)",
      email: "secretary@societydesk.com",
      role: "admin",
      unit_number: "A-1402",
      block: "Tower A",
      phone: "+91 98110 87654",
    },
  ];

  const residentProfiles = [
    {
      id: "25672acc-842d-4731-8526-f0e7e55def43",
      full_name: "Rahul Sharma",
      email: "resident@societydesk.com",
      role: "resident",
      unit_number: "B-1204",
      block: "Tower B",
      phone: "+91 98765 12345",
    },
    {
      id: "a1111111-1111-4111-8111-111111111111",
      full_name: "Priya Sengupta",
      email: "priya.s@gmail.com",
      role: "resident",
      unit_number: "A-402",
      block: "Tower A",
      phone: "+91 98450 11223",
    },
    {
      id: "a2222222-2222-4222-8222-222222222222",
      full_name: "Vikramaditya Mehta",
      email: "vikram.mehta@outlook.com",
      role: "resident",
      unit_number: "C-801",
      block: "Tower C",
      phone: "+91 99200 44556",
    },
    {
      id: "a3333333-3333-4333-8333-333333333333",
      full_name: "Dr. Ananya Iyer",
      email: "ananya.iyer@apollo.org",
      role: "resident",
      unit_number: "B-603",
      block: "Tower B",
      phone: "+91 97170 88990",
    },
    {
      id: "a4444444-4444-4444-8444-444444444444",
      full_name: "Rohan & Sneha Desai",
      email: "rohan.desai@tcs.com",
      role: "resident",
      unit_number: "D-1102",
      block: "Tower D",
      phone: "+91 98230 67890",
    },
    {
      id: "a5555555-5555-4555-8555-555555555555",
      full_name: "Meera Patel",
      email: "meera.patel@designstudio.in",
      role: "resident",
      unit_number: "A-905",
      block: "Tower A",
      phone: "+91 99400 23456",
    },
  ];

  for (const p of [...adminProfiles, ...residentProfiles]) {
    const pwd = p.role === "admin" ? defaultPassword : residentPassword;
    await sql`
      INSERT INTO profiles (id, full_name, email, password_hash, role, unit_number, block, phone)
      VALUES (${p.id}, ${p.full_name}, ${p.email}, ${pwd}, ${p.role}, ${p.unit_number}, ${p.block}, ${p.phone})
    `;
  }
  console.log(`✓ Seeded ${adminProfiles.length} Admins and ${residentProfiles.length} Residents`);

  // 3. SEED SLA OVERDUE THRESHOLDS
  const thresholds = [
    { category: "Elevator", days: 1 },
    { category: "Plumbing", days: 1 },
    { category: "Electrical", days: 1 },
    { category: "Security", days: 1 },
    { category: "Cleaning", days: 2 },
    { category: "Parking", days: 3 },
    { category: "Gardening", days: 4 },
    { category: "Pest Control", days: 3 },
    { category: "Other", days: 3 },
  ];

  for (const t of thresholds) {
    await sql`
      INSERT INTO overdue_thresholds (id, category, days)
      VALUES (gen_random_uuid(), ${t.category}, ${t.days})
    `;
  }
  console.log("✓ Seeded SLA Overdue Thresholds");

  // 4. SEED NOTICES (Society Announcements)
  const notices = [
    {
      title: "Overhead Water Tank Deep Cleaning Schedule (28th - 29th Aug)",
      body: "Please note that all overhead tanks for Towers A, B, C & D will undergo bi-annual deep pressure jet cleaning and disinfection.\n\nWater supply schedule:\n- Morning: Normal supply till 10:30 AM\n- Afternoon: Intermittent/low pressure\n- Evening: Normal supply resumes after 6:00 PM\n\nPlease store adequate drinking water in advance.",
      is_important: true,
      author_id: adminProfiles[0].id,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      title: "New EV Charging Bays Activated in Basement 2 (Slots E1-E8)",
      body: "Phase 2 of society EV infrastructure is now live. 8 shared 7.4kW Type-2 AC chargers have been commissioned near Pillar B2-18.\n\nResidents can tap their RFID access cards or use the ChargeGrid app. Tariff is subsidised at ₹9.50/unit as approved in the last AGM.",
      is_important: false,
      author_id: adminProfiles[0].id,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    },
    {
      title: "Swimming Pool & Clubhouse Deck Maintenance Every Monday",
      body: "The main swimming pool, toddler pool, and adjacent deck area will remain closed every Monday from 6:00 AM to 4:00 PM for water filtration backwash, vacuum sweeping, and chemical dosing.\n\nClubhouse gym and badminton courts will operate as normal.",
      is_important: false,
      author_id: adminProfiles[1].id,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    },
    {
      title: "Fire Safety Drill & Smoke Detector Inspection Notice",
      body: "Mandatory fire safety inspection will be conducted by the certified safety audit team across all floor common lobbies on Saturday from 11:00 AM. Smoke alarms will beep intermittently for 10-15 seconds during sensor testing. No evacuation required.",
      is_important: true,
      author_id: adminProfiles[0].id,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
    },
  ];

  for (const n of notices) {
    await sql`
      INSERT INTO notices (id, author_id, title, body, is_important, created_at)
      VALUES (gen_random_uuid(), ${n.author_id}, ${n.title}, ${n.body}, ${n.is_important}, ${n.created_at})
    `;
  }
  console.log(`✓ Seeded ${notices.length} Realistic Society Notices`);

  // 5. SEED REALISTIC COMPLAINTS, HISTORY, COMMENTS & FEEDBACK
  const complaints = [
    {
      id: "c1111111-1111-4111-8111-111111111111",
      resident_id: residentProfiles[0].id, // Rahul Sharma (B-1204)
      category: "Elevator",
      priority: "high",
      status: "in_progress",
      title: "Tower B Passenger Lift #2 Jerking & Floor Level Misalignment",
      description:
        "Passenger Lift 2 makes a grinding noise while braking between 8th and 12th floors. It stops about 2 inches below the floor sill on floor 12, creating a tripping hazard.",
      location: "Tower B - Passenger Lift #2",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      resolved_at: null,
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Complaint lodged via resident app",
          actor_id: residentProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
        {
          old_status: "open",
          new_status: "in_progress",
          note: "Assigned to Otis AMC Technician Mr. Santosh. Brake shoe & leveling sensor inspection underway.",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
      ],
      comments: [
        {
          author_id: adminProfiles[0].id,
          comment:
            "Technician is on site. They have paused Lift 2 for 45 minutes to recalibrate the optical leveling switch.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          author_id: residentProfiles[0].id,
          comment:
            "Thank you for the quick response. Lift 1 is handling morning crowd smoothly meanwhile.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        },
      ],
    },
    {
      id: "c2222222-2222-4222-8222-222222222222",
      resident_id: residentProfiles[1].id, // Priya Sengupta (A-402)
      category: "Plumbing",
      priority: "high",
      status: "resolved",
      title: "Main Kitchen Riser Pipe Seepage into Utility Duct",
      description:
        "Continuous water dripping from the vertical PVC drain stack inside the 4th floor duct shaft. Water was accumulating near the electric conduit box.",
      location: "Tower A - Duct Shaft Flat 402 & 302",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Urgent plumbing ticket logged with photos",
          actor_id: residentProfiles[1].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        },
        {
          old_status: "open",
          new_status: "in_progress",
          note: "Society plumber Ramesh dispatched with replacement 110mm coupler and sealant",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        },
        {
          old_status: "in_progress",
          new_status: "resolved",
          note: "Coupler joint resealed with solvent cement and tested under continuous drain flow for 30 minutes. No leakage.",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        },
      ],
      comments: [
        {
          author_id: adminProfiles[0].id,
          comment: "Plumber inspected the duct. The rubber collar ring had degraded. Replaced with new Astral PVC coupling.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        },
      ],
      feedback: {
        rating: 5,
        comment: "Excellent and neat work by Ramesh. The duct area is completely dry now.",
      },
    },
    {
      id: "c3333333-3333-4333-8333-333333333333",
      resident_id: residentProfiles[2].id, // Vikramaditya Mehta (C-801)
      category: "Electrical",
      priority: "medium",
      status: "open",
      title: "Corridor Emergency LED Tube Flickering & Sensor Stuck ON",
      description:
        "The motion sensor light in the 8th floor north corridor does not dim during non-movement and the backup LED tube is flickering constantly.",
      location: "Tower C - 8th Floor Lobby (North Wing)",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      resolved_at: null,
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Complaint submitted",
          actor_id: residentProfiles[2].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        },
      ],
      comments: [
        {
          author_id: residentProfiles[2].id,
          comment: "It makes a faint buzzing sound at night outside flat 801 door.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        },
      ],
    },
    {
      id: "c4444444-4444-4444-8444-444444444444",
      resident_id: residentProfiles[3].id, // Dr. Ananya Iyer (B-603)
      category: "Security",
      priority: "high",
      status: "resolved",
      title: "Visitor Boom Barrier Tag Reader Delay at Gate #2",
      description:
        "Fastag/RFID sensor at Gate 2 was taking 45-60 seconds to scan resident vehicle tags, causing tailbacks onto the main avenue during evening peak hours.",
      location: "Main Entrance Gate #2",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Ticket raised by resident",
          actor_id: residentProfiles[3].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
        {
          old_status: "open",
          new_status: "in_progress",
          note: "Automation vendor SecurePlus requested for antenna recalibration",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
        },
        {
          old_status: "in_progress",
          new_status: "resolved",
          note: "Antenna angle adjusted from 30° to 45° and firmware updated on reader unit. Instant scans verified on 20 test cars.",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        },
      ],
      comments: [
        {
          author_id: adminProfiles[0].id,
          comment: "SecurePlus team completed calibration at 4:30 PM. Scanning latency is now under 1.2 seconds.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
        },
      ],
      feedback: {
        rating: 5,
        comment: "Boom barrier opens instantaneously now! Thank you for prioritizing this.",
      },
    },
    {
      id: "c5555555-5555-4555-8555-555555555555",
      resident_id: residentProfiles[4].id, // Rohan Desai (D-1102)
      category: "Cleaning",
      priority: "medium",
      status: "in_progress",
      title: "Basement 1 Garbage Chute Discharge Room Cleaning & Odor Control",
      description:
        "The chute collection compactor room in Basement 1 Tower D requires deep sanitization and organic odor neutralizer spray.",
      location: "Tower D - Basement 1 Waste Compactor",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      resolved_at: null,
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Housekeeping request logged",
          actor_id: residentProfiles[4].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        },
        {
          old_status: "open",
          new_status: "in_progress",
          note: "Assigned to Housekeeping Supervisor Mr. Jagdish for steam wash and chlorine spray",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        },
      ],
      comments: [
        {
          author_id: adminProfiles[0].id,
          comment: "Deep wash scheduled for 2:00 PM today after wet waste collection truck leaves.",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
    },
    {
      id: "c6666666-6666-4666-8666-666666666666",
      resident_id: residentProfiles[5].id, // Meera Patel (A-905)
      category: "Gardening",
      priority: "low",
      status: "resolved",
      title: "Overhanging Palm Fronds Touching 9th Floor Balcony Railing",
      description:
        "Dry palm fronds from the central courtyard tree were swaying and rubbing against balcony glass panels during windy evenings.",
      location: "Tower A - 9th Floor Balcony (Courtyard side)",
      is_overdue: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      resolved_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      history: [
        {
          old_status: null,
          new_status: "open",
          note: "Gardening trim request created",
          actor_id: residentProfiles[5].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        },
        {
          old_status: "open",
          new_status: "in_progress",
          note: "Assigned to Horticulture team",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
        },
        {
          old_status: "in_progress",
          new_status: "resolved",
          note: "Tree branches and palm fronds pruned safely using boom lift.",
          actor_id: adminProfiles[0].id,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
      ],
      comments: [],
      feedback: {
        rating: 4,
        comment: "Pruning was done cleanly without leaving any debris on balcony.",
      },
    },
  ];

  for (const c of complaints) {
    await sql`
      INSERT INTO complaints (
        id, resident_id, category, priority, status, title, description, location, is_overdue, created_at, resolved_at
      ) VALUES (
        ${c.id}, ${c.resident_id}, ${c.category}, ${c.priority}, ${c.status}, ${c.title}, ${c.description}, ${c.location}, ${c.is_overdue}, ${c.created_at}, ${c.resolved_at}
      )
    `;

    for (const h of c.history) {
      await sql`
        INSERT INTO complaint_history (id, complaint_id, old_status, new_status, note, actor_id, created_at)
        VALUES (gen_random_uuid(), ${c.id}, ${h.old_status}, ${h.new_status}, ${h.note}, ${h.actor_id}, ${h.created_at})
      `;
    }

    for (const cm of c.comments) {
      await sql`
        INSERT INTO complaint_comments (id, complaint_id, author_id, comment, created_at)
        VALUES (gen_random_uuid(), ${c.id}, ${cm.author_id}, ${cm.comment}, ${cm.created_at})
      `;
    }

    if (c.feedback) {
      await sql`
        INSERT INTO resolution_feedback (id, complaint_id, rating, comment, created_at)
        VALUES (gen_random_uuid(), ${c.id}, ${c.feedback.rating}, ${c.feedback.comment}, ${c.resolved_at})
      `;
    }
  }

  console.log(`✓ Seeded ${complaints.length} Realistic Residential Complaints with History & Feedback`);
  console.log("\n🎉 Database successfully populated with realistic society data!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });

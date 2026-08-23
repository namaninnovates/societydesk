import { createServerFn } from "@tanstack/react-start";
import { neon } from "@neondatabase/serverless";

function getSql() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    const message = "Missing DATABASE_URL environment variable. Please check your .env file.";
    console.error(`[Neon DB] ${message}`);
    throw new Error(message);
  }
  return neon(databaseUrl);
}

export type ComplaintQueryResult = {
  id: string;
  resident_id: string;
  category: string;
  title: string;
  description: string;
  location: string | null;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  is_overdue: boolean;
  created_at: string;
  resolved_at: string | null;
  profiles: {
    full_name: string;
    unit_number: string | null;
    block: string | null;
    phone: string | null;
  } | null;
  complaint_photos: { id: string; storage_path: string }[];
};

type ComplaintDbRow = Omit<ComplaintQueryResult, "created_at" | "resolved_at"> & {
  created_at: unknown;
  resolved_at: unknown;
};

type HistoryDbRow = {
  id: string;
  old_status: string;
  new_status: string;
  note: string | null;
  created_at: unknown;
  actor_id: string | null;
  profiles: { full_name: string; role: string } | null;
};

type CommentDbRow = {
  id: string;
  comment: string;
  created_at: unknown;
  author_id: string;
  profiles: { full_name: string; role: string } | null;
};

type NoticeDbRow = {
  id: string;
  title: string;
  body: string;
  is_important: boolean;
  created_at: unknown;
  profiles: { full_name: string } | null;
};

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  return new Date(String(val)).toISOString();
}

function toIsoOrNull(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
  return new Date(String(val)).toISOString();
}

// ── 1. FETCH COMPLAINTS (WITH FILTERS) ─────────────────────────
export const fetchComplaintsServerFn = createServerFn({ method: "GET" })
  .validator(
    (
      d:
        | {
            residentId?: string | undefined;
            status?: string | undefined;
            category?: string | undefined;
            priority?: string | undefined;
            block?: string | undefined;
            search?: string | undefined;
          }
        | undefined,
    ) => d,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT 
        c.id,
        c.resident_id,
        c.category,
        c.title,
        c.description,
        c.location,
        c.status,
        c.priority,
        c.is_overdue,
        c.created_at,
        c.resolved_at,
        json_build_object(
          'full_name', p.full_name,
          'unit_number', p.unit_number,
          'block', p.block,
          'phone', p.phone
        ) AS profiles,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', cp.id, 'storage_path', cp.storage_path))
            FROM complaint_photos cp
            WHERE cp.complaint_id = c.id
          ),
          '[]'::json
        ) AS complaint_photos
      FROM complaints c
      LEFT JOIN profiles p ON p.id = c.resident_id
      ORDER BY c.is_overdue DESC, c.created_at DESC
    `) as unknown as ComplaintDbRow[];

    let result = rows;
    if (data?.residentId) {
      result = result.filter((r) => r.resident_id === data.residentId);
    }
    if (data?.status && data.status !== "all") {
      if (data.status === "overdue") {
        result = result.filter((r) => r.is_overdue);
      } else {
        result = result.filter((r) => r.status === data.status);
      }
    }
    if (data?.category && data.category !== "all") {
      result = result.filter((r) => r.category.toLowerCase() === data.category?.toLowerCase());
    }
    if (data?.priority && data.priority !== "all") {
      result = result.filter((r) => r.priority === data.priority);
    }
    if (data?.block && data.block !== "all") {
      result = result.filter(
        (r) =>
          r.profiles?.block?.toLowerCase() === data.block?.toLowerCase() ||
          r.location?.toLowerCase().includes(data.block?.toLowerCase() ?? ""),
      );
    }
    if (data?.search && data.search.trim()) {
      const q = data.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.profiles?.full_name?.toLowerCase().includes(q) ||
          r.profiles?.unit_number?.toLowerCase().includes(q),
      );
    }

    return result.map((r) => ({
      ...r,
      created_at: toIso(r.created_at),
      resolved_at: toIsoOrNull(r.resolved_at),
    })) as ComplaintQueryResult[];
  });

// ── 2. FETCH SINGLE COMPLAINT ──────────────────────────────────
export const fetchComplaintByIdServerFn = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT 
        c.id,
        c.resident_id,
        c.category,
        c.title,
        c.description,
        c.location,
        c.status,
        c.priority,
        c.is_overdue,
        c.created_at,
        c.resolved_at,
        json_build_object(
          'full_name', p.full_name,
          'unit_number', p.unit_number,
          'block', p.block,
          'phone', p.phone
        ) AS profiles,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', cp.id, 'storage_path', cp.storage_path))
            FROM complaint_photos cp
            WHERE cp.complaint_id = c.id
          ),
          '[]'::json
        ) AS complaint_photos
      FROM complaints c
      LEFT JOIN profiles p ON p.id = c.resident_id
      WHERE c.id = ${data.id}
      LIMIT 1
    `) as unknown as ComplaintDbRow[];
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      created_at: toIso(r.created_at),
      resolved_at: toIsoOrNull(r.resolved_at),
    } as ComplaintQueryResult;
  });

// ── 3. FETCH COMPLAINT HISTORY ─────────────────────────────────
export const fetchComplaintHistoryServerFn = createServerFn({ method: "GET" })
  .validator((d: { complaintId: string }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        h.id,
        h.old_status,
        h.new_status,
        h.note,
        h.created_at,
        h.actor_id,
        json_build_object('full_name', p.full_name, 'role', p.role) AS profiles
      FROM complaint_history h
      LEFT JOIN profiles p ON p.id = h.actor_id
      WHERE h.complaint_id = ${data.complaintId}
      ORDER BY h.created_at ASC
    `;
    return (rows as unknown as HistoryDbRow[]).map((r) => ({
      ...r,
      created_at: toIso(r.created_at),
    }));
  });

// ── 4. FETCH COMPLAINT COMMENTS ────────────────────────────────
export const fetchComplaintCommentsServerFn = createServerFn({ method: "GET" })
  .validator((d: { complaintId: string }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        c.id,
        c.comment,
        c.created_at,
        c.author_id,
        json_build_object('full_name', p.full_name, 'role', p.role) AS profiles
      FROM complaint_comments c
      LEFT JOIN profiles p ON p.id = c.author_id
      WHERE c.complaint_id = ${data.complaintId}
      ORDER BY c.created_at ASC
    `;
    return (rows as unknown as CommentDbRow[]).map((r) => ({
      ...r,
      created_at: toIso(r.created_at),
    }));
  });

// ── 5. ADD COMPLAINT COMMENT ───────────────────────────────────
export const addComplaintCommentServerFn = createServerFn({ method: "POST" })
  .validator((d: { complaintId: string; authorId: string; comment: string }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO complaint_comments (id, complaint_id, author_id, comment)
      VALUES (gen_random_uuid(), ${data.complaintId}, ${data.authorId}, ${data.comment})
      RETURNING *
    `;
    return rows[0];
  });

// ── 6. ADD RESOLUTION FEEDBACK ─────────────────────────────────
export const addResolutionFeedbackServerFn = createServerFn({ method: "POST" })
  .validator((d: { complaintId: string; rating: number; comment?: string | undefined }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO resolution_feedback (id, complaint_id, rating, comment)
      VALUES (gen_random_uuid(), ${data.complaintId}, ${data.rating}, ${data.comment ?? null})
      RETURNING *
    `;
    return rows[0];
  });

// ── 7. UPDATE COMPLAINT STATUS OR PRIORITY ─────────────────────
export const updateComplaintStatusServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      id: string;
      status?: "open" | "in_progress" | "resolved" | undefined;
      priority?: "low" | "medium" | "high" | undefined;
      actorId?: string | undefined;
      note?: string | undefined;
      oldStatus?: string | undefined;
    }) => d,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const resolvedAt = data.status === "resolved" ? new Date().toISOString() : null;

    if (data.status && data.priority) {
      await sql`
        UPDATE complaints 
        SET status = ${data.status}, priority = ${data.priority}, resolved_at = ${resolvedAt}
        WHERE id = ${data.id}
      `;
    } else if (data.status) {
      await sql`
        UPDATE complaints 
        SET status = ${data.status}, resolved_at = ${resolvedAt}
        WHERE id = ${data.id}
      `;
    } else if (data.priority) {
      await sql`
        UPDATE complaints 
        SET priority = ${data.priority}
        WHERE id = ${data.id}
      `;
    }

    if (data.status && data.oldStatus !== data.status) {
      await sql`
        INSERT INTO complaint_history (id, complaint_id, old_status, new_status, note, actor_id)
        VALUES (
          gen_random_uuid(), 
          ${data.id}, 
          ${data.oldStatus ?? null}, 
          ${data.status}, 
          ${data.note ?? (data.status === "resolved" ? "Complaint marked resolved" : "Status updated")}, 
          ${data.actorId ?? null}
        )
      `;
    }

    return { success: true };
  });

// ── 8. CREATE COMPLAINT ────────────────────────────────────────
export const createComplaintServerFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      residentId: string;
      category: string;
      title: string;
      description: string;
      location?: string | undefined;
      priority?: ("low" | "medium" | "high") | undefined;
      photos?: string[] | undefined;
    }) => d,
  )
  .handler(async ({ data }) => {
    const sql = getSql();
    const complaintId = crypto.randomUUID();
    const priority = data.priority ?? "medium";

    await sql`
      INSERT INTO complaints (id, resident_id, category, title, description, location, priority, status)
      VALUES (${complaintId}, ${data.residentId}, ${data.category}, ${data.title}, ${data.description}, ${data.location ?? null}, ${priority}, 'open')
    `;

    if (data.photos && data.photos.length > 0) {
      for (const p of data.photos) {
        await sql`
          INSERT INTO complaint_photos (id, complaint_id, storage_path)
          VALUES (gen_random_uuid(), ${complaintId}, ${p})
        `;
      }
    }

    await sql`
      INSERT INTO complaint_history (id, complaint_id, old_status, new_status, note, actor_id)
      VALUES (gen_random_uuid(), ${complaintId}, NULL, 'open', 'Complaint raised by resident', ${data.residentId})
    `;

    return { id: complaintId };
  });

// ── 9. NOTICES (FETCH, CREATE, DELETE) ─────────────────────────
export const fetchNoticesServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = await sql`
      SELECT 
        n.id,
        n.title,
        n.body,
        n.is_important,
        n.created_at,
        json_build_object('full_name', p.full_name) AS profiles
      FROM notices n
      LEFT JOIN profiles p ON p.id = n.author_id
      ORDER BY n.is_important DESC, n.created_at DESC
    `;
  return (rows as unknown as NoticeDbRow[]).map((r) => ({
    ...r,
    created_at: toIso(r.created_at),
  }));
});

export const createNoticeServerFn = createServerFn({ method: "POST" })
  .validator((d: { authorId: string; title: string; body: string; isImportant: boolean }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO notices (id, author_id, title, body, is_important)
      VALUES (gen_random_uuid(), ${data.authorId}, ${data.title}, ${data.body}, ${data.isImportant})
      RETURNING *
    `;
    return rows[0];
  });

export const deleteNoticeServerFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    await sql`DELETE FROM notices WHERE id = ${data.id}`;
    return { success: true };
  });

// ── 10. OVERDUE THRESHOLDS ─────────────────────────────────────
export const fetchOverdueThresholdsServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = getSql();
    const rows = await sql`
      SELECT id, category, days FROM overdue_thresholds ORDER BY category ASC
    `;
    return rows as { id: string; category: string; days: number }[];
  },
);

export const updateOverdueThresholdServerFn = createServerFn({ method: "POST" })
  .validator((d: { category: string; days: number }) => d)
  .handler(async ({ data }) => {
    const sql = getSql();
    const existing = (await sql`
      SELECT id FROM overdue_thresholds WHERE LOWER(category) = LOWER(${data.category}) LIMIT 1
    `) as { id: string }[];
    if (existing.length > 0 && existing[0]) {
      await sql`
        UPDATE overdue_thresholds SET days = ${data.days} WHERE id = ${existing[0].id}
      `;
    } else {
      await sql`
        INSERT INTO overdue_thresholds (id, category, days) VALUES (gen_random_uuid(), ${data.category}, ${data.days})
      `;
    }
    return { success: true };
  });

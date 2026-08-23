import { createServerFn } from "@tanstack/react-start";

type ComplaintResidentRow = {
  title: string;
  resident_id: string;
  full_name: string | null;
  email: string | null;
};

/**
 * Server function: send email notification when a complaint status changes.
 * Called by the admin after a successful status update mutation.
 */
export const notifyStatusChange = createServerFn({ method: "POST" })
  .validator((d: { complaintId: string; oldStatus: string; newStatus: string; note: string }) => d)
  .handler(async ({ data }) => {
    const { complaintId, oldStatus, newStatus, note } = data;

    try {
      const { sql } = await import("@/integrations/neon/client.server");
      const { sendStatusChangeEmail } = await import("@/integrations/email/email.server");

      const rows = (await sql`
        SELECT c.title, c.resident_id, p.full_name, p.email
        FROM complaints c
        LEFT JOIN profiles p ON p.id = c.resident_id
        WHERE c.id = ${complaintId}
        LIMIT 1
      `) as unknown as ComplaintResidentRow[];

      const complaint = rows[0];
      if (!complaint) {
        console.warn(`[Email] Complaint ${complaintId} not found, skipping email.`);
        return { sent: false };
      }

      const email = complaint.email;
      if (!email) {
        console.warn(`[Email] No email for resident ${complaint.resident_id}, skipping.`);
        return { sent: false };
      }

      const residentName = complaint.full_name ?? "Resident";
      const appUrl =
        process.env["VITE_APP_URL"] || process.env["APP_URL"] || "http://localhost:8080";

      await sendStatusChangeEmail({
        to: email,
        residentName,
        complaintTitle: complaint.title,
        complaintId,
        oldStatus,
        newStatus,
        note,
        appUrl,
      });

      return { sent: true };
    } catch (error) {
      console.error("[Email] Error sending status change notification:", error);
      return { sent: false };
    }
  });

/**
 * Server function: send email notification when an important notice is published.
 * Called by the admin after publishing an important notice.
 */
export const notifyImportantNotice = createServerFn({ method: "POST" })
  .validator((d: { noticeTitle: string; noticeBody: string }) => d)
  .handler(async ({ data }) => {
    const { noticeTitle, noticeBody } = data;

    try {
      const { sql } = await import("@/integrations/neon/client.server");
      const { sendImportantNoticeEmail } = await import("@/integrations/email/email.server");

      // Get all resident emails from Neon profiles table
      const rows = (await sql`
        SELECT email FROM profiles WHERE role = 'resident' AND email IS NOT NULL
      `) as unknown as { email: string | null }[];

      const emails = rows.map((r) => r.email).filter((e): e is string => Boolean(e));

      if (emails.length === 0) {
        console.log("[Email] No resident emails found, skipping notice email.");
        return { sent: false, count: 0 };
      }

      const appUrl =
        process.env["VITE_APP_URL"] || process.env["APP_URL"] || "http://localhost:8080";

      await sendImportantNoticeEmail({
        to: emails,
        noticeTitle,
        noticeBody,
        appUrl,
      });

      return { sent: true, count: emails.length };
    } catch (error) {
      console.error("[Email] Error sending notice notification:", error);
      return { sent: false, count: 0 };
    }
  });

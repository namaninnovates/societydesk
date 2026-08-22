// Server-side email service using Resend.
// SECURITY: Only import this in server-side code (.server.ts, server functions, API routes).
import { Resend } from "resend";

let _resend: Resend | undefined;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env['RESEND_API_KEY'];
    if (!apiKey) {
      console.warn("[Email] RESEND_API_KEY not set — emails will be logged but not sent.");
    }
    _resend = new Resend(apiKey || "re_mock_key");
  }
  return _resend;
}

const FROM_ADDRESS = "SocietyDesk <onboarding@resend.dev>";

type StatusChangeEmailParams = {
  to: string;
  residentName: string;
  complaintTitle: string;
  complaintId: string;
  oldStatus: string;
  newStatus: string;
  note: string;
  appUrl: string;
};

export async function sendStatusChangeEmail(params: StatusChangeEmailParams) {
  const { to, residentName, complaintTitle, complaintId, oldStatus, newStatus, note, appUrl } = params;

  const statusLabels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
  };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #FAF9F6; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
    <h2 style="color: #0F766E; margin: 0 0 8px;">SocietyDesk</h2>
    <p style="color: #555; margin: 0 0 24px; font-size: 14px;">Complaint status update</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;" />
    <p style="color: #333;">Hi ${residentName},</p>
    <p style="color: #333;">Your complaint <strong>"${complaintTitle}"</strong> has been updated:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 12px; background: #f5f5f5; border-radius: 6px 0 0 0; font-size: 13px; color: #888;">Previous status</td>
        <td style="padding: 8px 12px; background: #f5f5f5; border-radius: 0 6px 0 0; font-size: 13px; font-weight: 600;">${statusLabels[oldStatus] ?? oldStatus}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; color: #888;">New status</td>
        <td style="padding: 8px 12px; font-size: 13px; font-weight: 600; color: #0F766E;">${statusLabels[newStatus] ?? newStatus}</td>
      </tr>
    </table>
    ${note ? `<p style="color: #333; background: #f9f9f6; padding: 12px; border-radius: 8px; border-left: 3px solid #0F766E; font-size: 14px; margin: 16px 0;"><em>"${note}"</em></p>` : ""}
    <a href="${appUrl}/complaints/${complaintId}" style="display: inline-block; background: #0F766E; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-top: 16px;">View complaint</a>
    <p style="color: #aaa; font-size: 12px; margin-top: 24px;">You're receiving this because you filed this complaint on SocietyDesk.</p>
  </div>
</body>
</html>`;

  try {
    if (!process.env['RESEND_API_KEY']) {
      console.log(`[Email] (dry run) Status change email to ${to} — ${oldStatus} → ${newStatus} for "${complaintTitle}"`);
      return { success: true, dryRun: true };
    }
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Complaint updated: ${complaintTitle}`,
      html,
    });
    console.log(`[Email] Status change email sent to ${to}`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email] Failed to send status change email:", error);
    return { success: false, error };
  }
}

type NoticeEmailParams = {
  to: string[];
  noticeTitle: string;
  noticeBody: string;
  appUrl: string;
};

export async function sendImportantNoticeEmail(params: NoticeEmailParams) {
  const { to, noticeTitle, noticeBody, appUrl } = params;

  const truncatedBody = noticeBody.length > 500 ? noticeBody.slice(0, 500) + "…" : noticeBody;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #FAF9F6; padding: 32px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
    <h2 style="color: #0F766E; margin: 0 0 8px;">SocietyDesk</h2>
    <p style="color: #555; margin: 0 0 24px; font-size: 14px;">Important Notice</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;" />
    <h3 style="color: #333; margin: 0 0 12px;">${noticeTitle}</h3>
    <p style="color: #333; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${truncatedBody}</p>
    <a href="${appUrl}/notices" style="display: inline-block; background: #0F766E; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-top: 16px;">View notice board</a>
    <p style="color: #aaa; font-size: 12px; margin-top: 24px;">You're receiving this because you are a registered resident on SocietyDesk.</p>
  </div>
</body>
</html>`;

  try {
    if (!process.env['RESEND_API_KEY']) {
      console.log(`[Email] (dry run) Important notice email to ${to.length} recipients — "${noticeTitle}"`);
      return { success: true, dryRun: true };
    }

    // Resend supports batch sending or individual sends.
    // For free tier, send individually (batch API may not be available).
    const results = [];
    for (const recipient of to) {
      try {
        const result = await getResend().emails.send({
          from: FROM_ADDRESS,
          to: recipient,
          subject: `Important: ${noticeTitle}`,
          html,
        });
        results.push({ to: recipient, success: true, data: result });
      } catch (err) {
        console.error(`[Email] Failed to send notice email to ${recipient}:`, err);
        results.push({ to: recipient, success: false, error: err });
      }
    }
    console.log(`[Email] Important notice emails sent: ${results.filter((r) => r.success).length}/${to.length}`);
    return { success: true, results };
  } catch (error) {
    console.error("[Email] Failed to send important notice emails:", error);
    return { success: false, error };
  }
}

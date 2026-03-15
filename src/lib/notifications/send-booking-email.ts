import { Resend } from "resend";

export type BookingNotificationPayload = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  group_size: number;
  message: string | null;
  origin_country: string | null;
  program_title?: string | null;
};

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getHtml(payload: BookingNotificationPayload, adminBookingUrl: string): string {
  const program = payload.program_title || "Non spécifié";
  const origin = payload.origin_country || "—";
  const message = payload.message?.trim() || "Aucun message";
  const phone = payload.phone?.trim() || "—";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle réservation</title>
</head>
<body style="margin:0;font-family:'Segoe UI',system-ui,sans-serif;background:#faf9f7;color:#1a1a1a;line-height:1.5;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <div style="background:linear-gradient(135deg,#d7a75d 0%,#8ba4cb 100%);height:4px;border-radius:4px 4px 0 0;"></div>
    <div style="background:#fff;border:1px solid #e8e6e3;border-top:none;border-radius:0 0 8px 8px;padding:32px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <h1 style="margin:0 0 8px;font-size:1.5rem;font-weight:700;color:#1a1a1a;">Nouvelle réservation</h1>
      <p style="margin:0 0 24px;font-size:0.9375rem;color:#666;">Gnaoua Tours — Une nouvelle demande a été envoyée.</p>

      <table style="width:100%;border-collapse:collapse;font-size:0.9375rem;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Nom</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:500;">${escapeHtml(payload.full_name)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${escapeHtml(payload.email)}" style="color:#b8860b;">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Téléphone</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Programme</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${escapeHtml(program)}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Taille du groupe</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${payload.group_size}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;">Origine</td><td style="padding:10px 0;border-bottom:1px solid #eee;">${escapeHtml(origin)}</td></tr>
        <tr><td style="padding:10px 0;color:#666;">Message</td><td style="padding:10px 0;">${escapeHtml(message)}</td></tr>
      </table>

      <p style="margin:28px 0 0;text-align:center;">
        <a href="${escapeHtml(adminBookingUrl)}" style="display:inline-block;padding:14px 28px;background:#b8860b;color:#fff !important;text-decoration:none;font-weight:600;border-radius:8px;font-size:0.9375rem;">Voir la réservation</a>
      </p>
    </div>
    <p style="margin:16px 0 0;font-size:0.8125rem;color:#999;">Gnaoua Tours — Expériences Sahara</p>
  </div>
</body>
</html>
`.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

function normalizeToAddresses(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export async function sendBookingNotificationEmail(
  payload: BookingNotificationPayload,
  adminBookingUrl: string,
  toAddresses: string[] = []
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipients = normalizeToAddresses(toAddresses);

  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not set" };
  }

  if (recipients.length === 0) {
    return { success: true };
  }

  if (!resend) {
    return { success: false, error: "Resend client not initialized" };
  }

  const from = process.env.RESEND_FROM ?? "notifications@resend.dev";

  try {
    const { error } = await resend.emails.send({
      from,
      to: recipients,
      subject: "Nouvelle réservation — Gnaoua Tours",
      html: getHtml(payload, adminBookingUrl),
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

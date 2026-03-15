import type { BookingNotificationPayload } from "./send-booking-email";

function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeChatIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && String(item).trim() !== "");
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export async function sendTelegramBookingNotification(
  payload: BookingNotificationPayload,
  adminBookingUrl: string,
  chatIds: string[] = []
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ids = normalizeChatIds(chatIds);

  if (!token) {
    return { success: false, error: "TELEGRAM_BOT_TOKEN not set" };
  }

  if (ids.length === 0) {
    return { success: true };
  }

  const program = payload.program_title || "Non spécifié";
  const origin = payload.origin_country || "—";
  const text = [
    "🆕 <b>Nouvelle réservation — Gnaoua Tours</b>",
    "",
    `<b>Nom:</b> ${escapeTelegramHtml(payload.full_name)}`,
    `<b>E-mail:</b> ${escapeTelegramHtml(payload.email)}`,
    `<b>Programme:</b> ${escapeTelegramHtml(program)}`,
    `<b>Groupe:</b> ${payload.group_size} · <b>Origine:</b> ${escapeTelegramHtml(origin)}`,
    "",
    `<a href="${adminBookingUrl.replace(/&/g, "&amp;")}">Voir la réservation</a>`,
  ].join("\n");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  let lastError: string | undefined;

  for (const chatId of ids) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; description?: string };
      if (!res.ok || !data.ok) {
        lastError = data.description ?? `HTTP ${res.status}`;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }
  }

  return lastError ? { success: false, error: lastError } : { success: true };
}

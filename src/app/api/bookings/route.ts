import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingNotificationEmail } from "@/lib/notifications/send-booking-email";
import { sendTelegramBookingNotification } from "@/lib/notifications/send-telegram-booking";

const bookingSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e‑mail invalide"),
  phone: z.string().optional().default(""),
  program_id: z.string().optional().default(""),
  group_size: z.number().int().min(1).max(20).default(1),
  message: z.string().optional().default(""),
  origin_country: z.string().optional().default("INTL"),
});

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    let createdId: string | undefined;

    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          program_id: data.program_id || null,
          group_size: data.group_size,
          message: data.message || null,
          origin_country: data.origin_country || "INTL",
          status: "new",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (inserted) {
        createdId = inserted.id;
        let programTitle: string | null = null;
        if (inserted.program_id) {
          const { data: program } = await supabase
            .from("programs")
            .select("title")
            .eq("id", inserted.program_id)
            .single();
          programTitle = program?.title ?? null;
        }

        const baseUrl = getBaseUrl();
        const adminBookingUrl = `${baseUrl}/admin/bookings/${inserted.id}`;
        const payload = {
          id: inserted.id,
          full_name: inserted.full_name,
          email: inserted.email,
          phone: inserted.phone,
          group_size: inserted.group_size ?? 1,
          message: inserted.message,
          origin_country: inserted.origin_country,
          program_title: programTitle,
        };

        const { data: settingsRows } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["notification_admin_emails", "notification_telegram_chat_ids"]);

        const settingsMap: Record<string, unknown> = {};
        for (const row of settingsRows ?? []) {
          settingsMap[row.key] = row.value;
        }

        function toEmailList(v: unknown): string[] {
          if (Array.isArray(v)) {
            return v.filter((x): x is string => typeof x === "string" && x.trim() !== "");
          }
          if (typeof v === "string" && v.trim()) {
            return v.split(",").map((s) => s.trim()).filter(Boolean);
          }
          return [];
        }
        function toChatIdList(v: unknown): string[] {
          if (Array.isArray(v)) {
            return v.filter((x): x is string => typeof x === "string" && String(x).trim() !== "");
          }
          if (typeof v === "string" && v.trim()) {
            return v.split(",").map((s) => s.trim()).filter(Boolean);
          }
          return [];
        }

        const adminEmails = toEmailList(settingsMap.notification_admin_emails);
        const telegramChatIds = toChatIdList(settingsMap.notification_telegram_chat_ids);

        const [emailResult, telegramResult] = await Promise.allSettled([
          sendBookingNotificationEmail(payload, adminBookingUrl, adminEmails),
          sendTelegramBookingNotification(payload, adminBookingUrl, telegramChatIds),
        ]);

        if (emailResult.status === "rejected") {
          console.error("[bookings] Resend notification failed:", emailResult.reason);
        } else if (emailResult.value && !emailResult.value.success) {
          console.error("[bookings] Resend error:", emailResult.value.error);
        }
        if (telegramResult.status === "rejected") {
          console.error("[bookings] Telegram notification failed:", telegramResult.reason);
        } else if (telegramResult.value && !telegramResult.value.success) {
          console.error("[bookings] Telegram error:", telegramResult.value.error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...(createdId != null && { id: createdId }),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

const bookingSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e‑mail invalide"),
  phone: z.string().optional().default(""),
  program_id: z.string().optional().default(""),
  group_size: z.number().int().min(1).max(20).default(1),
  message: z.string().optional().default(""),
  origin_country: z.string().optional().default("INTL"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // If Supabase is configured, save to DB
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();

      const { error } = await supabase.from("bookings").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        program_id: data.program_id || null,
        group_size: data.group_size,
        message: data.message || null,
        origin_country: data.origin_country || "INTL",
        status: "new",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
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

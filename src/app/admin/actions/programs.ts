"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  duration: z.string().min(1),
  start_date: z.string().nullable().optional().default(null),
  end_date: z.string().nullable().optional().default(null),
  price_eur: z.coerce.number().min(0),
  price_dzd: z.coerce.number().min(0),
  difficulty: z.enum(["easy", "moderate", "challenging", "expert"]),
  highlights: z.array(z.string()).default([]),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  })).default([]),
  gallery_urls: z.array(z.string()).default([]),
  cover_image: z.string().optional().default(""),
  display_order: z.coerce.number().default(0),
  is_published: z.boolean().default(false),
});

export async function createProgram(data: z.infer<typeof programSchema>) {
  const parsed = programSchema.parse(data);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("programs").insert(parsed);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/programs");
  return { success: true };
}

export async function updateProgram(id: string, data: z.infer<typeof programSchema>) {
  const parsed = programSchema.parse(data);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("programs").update(parsed).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/programs");
  return { success: true };
}

export async function deleteProgram(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/programs");
  return { success: true };
}

export async function toggleProgramPublished(id: string, is_published: boolean) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("programs").update({ is_published }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/programs");
  return { success: true };
}

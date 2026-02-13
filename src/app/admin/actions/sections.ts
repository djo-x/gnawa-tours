"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const sectionSchema = z.object({
  section_key: z.string().min(1),
  title: z.string().min(1),
  nav_title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  content: z.record(z.string(), z.unknown()).default({}),
  layout_type: z.enum(["text-left", "text-right", "centered", "full-bleed", "grid"]),
  background_image: z.string().optional().default(""),
  is_visible: z.boolean().default(true),
  display_order: z.coerce.number().default(0),
});

export async function createSection(data: z.infer<typeof sectionSchema>) {
  const parsed = sectionSchema.parse(data);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("dynamic_sections").insert(parsed);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function updateSection(id: string, data: z.infer<typeof sectionSchema>) {
  const parsed = sectionSchema.parse(data);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("dynamic_sections").update(parsed).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function deleteSection(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("dynamic_sections").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function toggleSectionVisibility(id: string, is_visible: boolean) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase.from("dynamic_sections").update({ is_visible }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { success: true };
}

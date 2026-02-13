"use server";

import { revalidatePath } from "next/cache";

export async function updateHeroSettings(data: {
  headline: string;
  subheadline: string;
  cta_text: string;
  background_image: string;
  overlay_opacity: number;
}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Upsert - update first row or insert
  const { data: existing } = await supabase
    .from("hero_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("hero_settings")
      .update(data)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("hero_settings").insert(data);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSiteSetting(key: string, value: unknown) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("site_settings")
      .insert({ key, value });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateBookingStatus(id: string, status: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { error: "Supabase n’est pas configuré" };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

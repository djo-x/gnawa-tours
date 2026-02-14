import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_PREFIXES = ["image/", "audio/"];

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase n’est pas configuré" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }
    if (!file.type || !ALLOWED_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
      return NextResponse.json(
        { error: "Type de fichier non pris en charge (image ou audio uniquement)" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale autorisée (25 MB)" },
        { status: 400 }
      );
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Generate unique filename
    const ext = file.name.split(".").pop() || "bin";
    const folder = file.type.startsWith("audio/") ? "audio" : "images";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("gnawa-media")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("gnawa-media")
      .getPublicUrl(fileName);

    // Save to media table
    const { error: dbError } = await supabase.from("media").insert({
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

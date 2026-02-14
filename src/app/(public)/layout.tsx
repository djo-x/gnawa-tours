import { Navigation } from "@/components/website/navigation";
import { Footer } from "@/components/website/footer";
import { MusicPlayer } from "@/components/website/music-player";
import { unstable_noStore as noStore } from "next/cache";
import { LenisProvider } from "@/providers/lenis-provider";

export const dynamic = "force-dynamic";

type NavSection = {
  id: string;
  label: string;
};

type FooterSettings = {
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  siteName?: string | null;
};

type MusicSettings = {
  ambientMusicEnabled?: boolean;
  ambientMusicTracks?: string[];
};

const fallbackDynamic = [
  { id: "our-story", label: "Notre histoire" },
  { id: "why-choose-us", label: "Pourquoi nous" },
  { id: "the-desert", label: "Galerie" },
  { id: "testimonials", label: "Avis" },
];

async function getNavSections(): Promise<NavSection[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [
      { id: "hero", label: "Accueil" },
      { id: "programs", label: "Programmes" },
      ...fallbackDynamic,
      { id: "booking", label: "Réserver" },
    ];
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("dynamic_sections")
      .select("section_key, nav_title, title, display_order, is_visible")
      .eq("is_visible", true)
      .order("display_order");

    const dynamicSections =
      data?.map((section) => ({
        id: section.section_key as string,
        label:
          (section.nav_title as string | null) ||
          (section.title as string | null) ||
          section.section_key,
      })) || fallbackDynamic;

    return [
      { id: "hero", label: "Accueil" },
      { id: "programs", label: "Programmes" },
      ...dynamicSections,
      { id: "booking", label: "Réserver" },
    ];
  } catch {
    return [
      { id: "hero", label: "Accueil" },
      { id: "programs", label: "Programmes" },
      ...fallbackDynamic,
      { id: "booking", label: "Réserver" },
    ];
  }
}

function toText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value == null) return null;
  try {
    return String(value);
  } catch {
    return null;
  }
}

function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }
  return false;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
      }
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }
  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const list =
      (candidate.tracks as unknown) ??
      (candidate.urls as unknown) ??
      (candidate.images as unknown) ??
      (candidate.items as unknown);
    if (Array.isArray(list)) {
      return list.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
  }
  return [];
}

async function getPublicSettings(): Promise<FooterSettings & MusicSettings> {
  noStore();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {};
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*");
    const map: Record<string, unknown> = {};
    if (data) {
      for (const setting of data) {
        map[setting.key] = setting.value;
      }
    }

    return {
      siteName: toText(map.site_name),
      contactEmail: toText(map.contact_email),
      contactPhone: toText(map.contact_phone),
      address: toText(map.address),
      ambientMusicEnabled: toBool(map.ambient_music_enabled),
      ambientMusicTracks: toStringArray(map.ambient_music_tracks),
    };
  } catch {
    return {};
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navSections, publicSettings] = await Promise.all([
    getNavSections(),
    getPublicSettings(),
  ]);
  return (
    <LenisProvider>
      <Navigation sections={navSections} />
      <main className="relative">{children}</main>
      <MusicPlayer
        enabled={publicSettings.ambientMusicEnabled}
        tracks={publicSettings.ambientMusicTracks}
      />
      <Footer
        siteName={publicSettings.siteName}
        contactEmail={publicSettings.contactEmail}
        contactPhone={publicSettings.contactPhone}
        address={publicSettings.address}
      />
    </LenisProvider>
  );
}

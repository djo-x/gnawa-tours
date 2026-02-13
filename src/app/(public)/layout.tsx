import { Navigation } from "@/components/website/navigation";
import { Footer } from "@/components/website/footer";
import { LenisProvider } from "@/providers/lenis-provider";

type NavSection = {
  id: string;
  label: string;
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

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navSections = await getNavSections();
  return (
    <LenisProvider>
      <Navigation sections={navSections} />
      <main className="relative">{children}</main>
      <Footer />
    </LenisProvider>
  );
}

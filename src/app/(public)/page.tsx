import { HeroSection } from "@/components/website/hero-section";
import { ShowcaseScroll } from "@/components/website/showcase-scroll";
import { ProgramsSection } from "@/components/website/programs-section";
import { DynamicSection } from "@/components/website/dynamic-section";
import { BookingSection } from "@/components/website/booking-section";
import { headers } from "next/headers";
import { getGeoCountryFromHeaders } from "@/lib/geo";
import type { HeroSettings } from "@/types/section";
import type { Program } from "@/types/program";
import type { DynamicSection as DynamicSectionType } from "@/types/section";

// Default data used when Supabase is not configured
const defaultHero: HeroSettings = {
  id: "default",
  headline: "Découvrir le Sahara algérien",
  subheadline:
    "Voyagez à travers des paysages ancestraux où les arches de grès se dressent au-dessus des dunes dorées sans fin",
  cta_text: "Commencer l’aventure",
  background_image: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?w=1920&q=80",
  overlay_opacity: 0.45,
  created_at: "",
  updated_at: "",
};

const defaultPrograms: Program[] = [
  {
    id: "1",
    title: "Expédition Tadrart Rouge",
    slug: "tadrart-rouge-expedition",
    description:
      "Plongez dans les formations rocheuses rouges de Tadrart Rouge, l’un des paysages les plus spectaculaires au monde.",
    duration: "5 jours / 4 nuits",
    start_date: "2026-10-05",
    end_date: "2026-10-09",
    price_eur: 1200,
    price_dzd: 180000,
    difficulty: "moderate",
    highlights: [
      "Arches de grès rouge du Tadrart",
      "Art rupestre préhistorique du Tassili",
      "Balade à dos de chameau au coucher du soleil dans l’Erg Admer",
      "Campement touareg traditionnel",
      "Observation des étoiles sans pollution lumineuse",
    ],
    itinerary: [
      { day: 1, title: "Arrivée à Djanet", description: "Arrivée à l’aéroport de Djanet, transfert à l’hôtel." },
      { day: 2, title: "Cap sur le Tadrart", description: "Départ en 4x4 au cœur du Tadrart Rouge." },
      { day: 3, title: "Art rupestre & dunes", description: "Visite matinale des peintures préhistoriques." },
      { day: 4, title: "Désert profond", description: "Journée complète d’exploration des vallées reculées." },
      { day: 5, title: "Retour à Djanet", description: "Trajet matinal de retour vers Djanet." },
    ],
    gallery_urls: [],
    cover_image: "https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?w=1920&q=80",
    display_order: 1,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    title: "Aventure oasis d’Ihrir",
    slug: "ihrir-desert-oasis",
    description:
      "Découvrez le joyau caché d’Ihrir, une oasis désertique spectaculaire nichée dans le plateau du Tassili n’Ajjer.",
    duration: "4 jours / 3 nuits",
    start_date: "2026-11-14",
    end_date: "2026-11-17",
    price_eur: 950,
    price_dzd: 145000,
    difficulty: "moderate",
    highlights: [
      "Lacs désertiques permanents d’Ihrir",
      "Tassili n’Ajjer classé au patrimoine mondial de l’UNESCO",
      "Randonnées dans les canyons",
      "Observation de la faune du désert",
      "Cuisine nomade authentique",
    ],
    itinerary: [
      { day: 1, title: "Djanet à Illizi", description: "Route panoramique à travers le plateau du Tassili." },
      { day: 2, title: "Vers Ihrir", description: "Expédition en 4x4 vers l’oasis d’Ihrir." },
      { day: 3, title: "Exploration de l’oasis", description: "Journée complète parmi les roches et les gueltas." },
      { day: 4, title: "Retour", description: "Départ matinal vers Djanet." },
    ],
    gallery_urls: [],
    cover_image: "https://images.pexels.com/photos/1703314/pexels-photo-1703314.jpeg?w=1920&q=80",
    display_order: 2,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

const defaultSections: DynamicSectionType[] = [
  {
    id: "1",
    section_key: "our-story",
    title: "Notre histoire",
    nav_title: "Notre histoire",
    subtitle: "Née d’une passion pour le Sahara",
    content: {
      text: "Gnaoua Tours a été fondée par des guides sahariens chevronnés qui ont grandi à l’ombre des montagnes du Tassili. Forts de plus de vingt ans d’expéditions à travers le désert algérien, nous proposons des voyages authentiques, sûrs et inoubliables au cœur de l’un des derniers grands espaces sauvages. Notre nom rend hommage à la riche tradition musicale gnawa qui résonne dans les nuits du désert.",
      image: "https://images.pexels.com/photos/4577791/pexels-photo-4577791.jpeg?w=1200&q=80",
    },
    layout_type: "centered",
    background_image: null,
    is_visible: true,
    display_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    section_key: "why-choose-us",
    title: "Pourquoi nous choisir",
    nav_title: "Pourquoi nous",
    subtitle: "Ce qui rend Gnaoua Tours différent",
    content: {
      cards: [
        { icon: "compass", title: "Guides locaux experts", description: "Nos guides touaregs vivent dans le Sahara depuis toujours et partagent un savoir inégalé." },
        { icon: "shield", title: "Sécurité avant tout", description: "Chaque expédition est équipée de communications satellite, de premiers secours et de véhicules entretenus." },
        { icon: "star", title: "Petits groupes", description: "Des groupes intimes (max. 8 voyageurs) pour une expérience personnelle et immersive." },
        { icon: "heart", title: "Voyage durable", description: "Nous pratiquons le “leave no trace” et investissons directement dans les communautés locales." },
      ],
    },
    layout_type: "grid",
    background_image: null,
    is_visible: true,
    display_order: 2,
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    section_key: "the-desert",
    title: "Le désert vous attend",
    nav_title: "Galerie",
    subtitle: "Un aperçu de l’extraordinaire",
    content: {
      images: ["https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80", "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80", "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80", "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80", "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80", "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?w=800&q=80"],
      text: "Des forêts de grès du Tadrart aux lacs cristallins d’Ihrir, le Sahara algérien est un monde de contrastes et d’émerveillement.",
    },
    layout_type: "full-bleed",
    background_image: "https://images.pexels.com/photos/3876407/pexels-photo-3876407.jpeg?w=1920&q=80",
    is_visible: true,
    display_order: 3,
    created_at: "",
    updated_at: "",
  },
  {
    id: "4",
    section_key: "testimonials",
    title: "Ce que disent nos voyageurs",
    nav_title: "Avis",
    subtitle: "Récits venus des dunes",
    content: {
      quotes: [
        { name: "Marie Laurent", location: "Paris, France", text: "L’expérience de voyage la plus extraordinaire de ma vie. Le silence du désert, la gentillesse de nos guides, les nuits étoilées — inoubliable.", rating: 5 },
        { name: "Thomas Müller", location: "Berlin, Allemagne", text: "Gnaoua Tours a dépassé toutes mes attentes. Le Tadrart Rouge donne l’impression d’être sur une autre planète. Professionnel, authentique et magique.", rating: 5 },
        { name: "Sarah Chen", location: "Londres, Royaume‑Uni", text: "J’ai beaucoup voyagé mais rien n’égale cela. Le désert a le pouvoir de réinitialiser l’âme. Merci, Gnaoua Tours, pour ce voyage incroyable.", rating: 5 },
      ],
    },
    layout_type: "text-left",
    background_image: null,
    is_visible: true,
    display_order: 4,
    created_at: "",
    updated_at: "",
  },
];

const defaultShowcaseImages = [
  "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80",
];

function normalizeShowcaseImages(value: unknown): string[] {
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
    const images = (value as { images?: unknown }).images;
    if (Array.isArray(images)) {
      return images.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
  }
  return [];
}

async function getData() {
  // Try to fetch from Supabase, fallback to defaults
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      hero: defaultHero,
      programs: defaultPrograms,
      sections: defaultSections,
      showcaseImages: defaultShowcaseImages,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [heroRes, programsRes, sectionsRes, settingsRes] = await Promise.all([
      supabase.from("hero_settings").select("*").single(),
      supabase.from("programs").select("*").eq("is_published", true).order("display_order"),
      supabase.from("dynamic_sections").select("*").eq("is_visible", true).order("display_order"),
      supabase.from("site_settings").select("*"),
    ]);

    const settingsMap: Record<string, unknown> = {};
    if (settingsRes.data) {
      for (const setting of settingsRes.data) {
        settingsMap[setting.key] = setting.value;
      }
    }

    return {
      hero: (heroRes.data as HeroSettings) || defaultHero,
      programs: (programsRes.data as Program[]) || defaultPrograms,
      sections: (sectionsRes.data as DynamicSectionType[]) || defaultSections,
      showcaseImages: (() => {
        const normalized = normalizeShowcaseImages(settingsMap.showcase_images);
        return normalized.length > 0 ? normalized : defaultShowcaseImages;
      })(),
    };
  } catch {
    return {
      hero: defaultHero,
      programs: defaultPrograms,
      sections: defaultSections,
      showcaseImages: defaultShowcaseImages,
    };
  }
}

export default async function HomePage() {
  const headerList = await headers();
  const geoCountry = getGeoCountryFromHeaders(headerList);
  const pricingRegion = geoCountry === "DZ" ? "DZ" : "INTL";
  const pricingLocale = "fr-FR";
  const { hero, programs, sections, showcaseImages } = await getData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Gnaoua Tours",
    description: hero.subheadline,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://gnawatours.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Djanet",
      addressRegion: "Wilaya d’Illizi",
      addressCountry: "DZ",
    },
    offers: programs.map((p) => ({
      "@type": "Offer",
      name: p.title,
      description: p.description,
      price: p.price_eur ?? p.price_dzd,
      priceCurrency: p.price_eur != null ? "EUR" : "DZD",
    })),
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_12%,rgba(215,180,124,0.14),transparent_35%),radial-gradient(circle_at_88%_26%,rgba(124,135,150,0.12),transparent_30%)]" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection hero={hero} />
      <ShowcaseScroll images={showcaseImages} />
      <ProgramsSection
        programs={programs}
        pricingRegion={pricingRegion}
        pricingLocale={pricingLocale}
      />
      {sections.map((section) => (
        <DynamicSection key={section.id} section={section} />
      ))}
      <BookingSection
        programs={programs}
        originCountry={geoCountry || "INTL"}
        pricingLocale={pricingLocale}
      />
    </div>
  );
}

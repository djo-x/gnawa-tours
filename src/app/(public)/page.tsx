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
  headline: "Discover the Algerian Sahara",
  subheadline:
    "Journey through ancient landscapes where towering sandstone arches meet endless golden dunes",
  cta_text: "Begin Your Adventure",
  background_image: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?w=1920&q=80",
  overlay_opacity: 0.45,
  created_at: "",
  updated_at: "",
};

const defaultPrograms: Program[] = [
  {
    id: "1",
    title: "Tadrart Rouge Expedition",
    slug: "tadrart-rouge-expedition",
    description:
      "Immerse yourself in the breathtaking red rock formations of Tadrart Rouge, one of the most spectacular landscapes on Earth.",
    duration: "5 days / 4 nights",
    start_date: "2026-10-05",
    end_date: "2026-10-09",
    price_eur: 1200,
    price_dzd: 180000,
    difficulty: "moderate",
    highlights: [
      "Red sandstone arches of Tadrart",
      "Prehistoric Tassili rock art",
      "Sunset camel trek across Erg Admer",
      "Traditional Tuareg camp experience",
      "Star-gazing in zero light pollution",
    ],
    itinerary: [
      { day: 1, title: "Arrival in Djanet", description: "Arrive at Djanet airport, transfer to hotel." },
      { day: 2, title: "Into the Tadrart", description: "Depart by 4x4 into the heart of Tadrart Rouge." },
      { day: 3, title: "Rock Art & Dunes", description: "Morning visit to prehistoric rock paintings." },
      { day: 4, title: "Deep Desert", description: "Full day exploring remote valleys." },
      { day: 5, title: "Return to Djanet", description: "Morning drive back to Djanet." },
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
    title: "Ihrir Desert Oasis Adventure",
    slug: "ihrir-desert-oasis",
    description:
      "Discover the hidden gem of Ihrir, a stunning desert oasis nestled within the rugged Tassili n'Ajjer plateau.",
    duration: "4 days / 3 nights",
    start_date: "2026-11-14",
    end_date: "2026-11-17",
    price_eur: 950,
    price_dzd: 145000,
    difficulty: "moderate",
    highlights: [
      "Ihrir permanent desert lakes",
      "Tassili n'Ajjer UNESCO World Heritage",
      "Canyon hiking adventures",
      "Desert wildlife spotting",
      "Authentic nomadic cuisine",
    ],
    itinerary: [
      { day: 1, title: "Djanet to Illizi", description: "Scenic drive through the Tassili plateau." },
      { day: 2, title: "Journey to Ihrir", description: "4x4 expedition to the remarkable Ihrir oasis." },
      { day: 3, title: "Oasis Exploration", description: "Full day exploring rock formations and pools." },
      { day: 4, title: "Return Journey", description: "Morning departure back to Djanet." },
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
    title: "Our Story",
    subtitle: "Born from a passion for the Sahara",
    content: {
      text: "Gnawa Tours was founded by seasoned Saharan guides who grew up in the shadows of the Tassili mountains. With over two decades of experience leading expeditions across the Algerian desert, we offer authentic, safe, and unforgettable journeys into one of the last true wildernesses on Earth. Our name pays homage to the rich Gnawa musical tradition that echoes through the desert nights.",
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
    title: "Why Choose Us",
    subtitle: "What makes Gnawa Tours different",
    content: {
      cards: [
        { icon: "compass", title: "Expert Local Guides", description: "Our Tuareg guides have lived in the Sahara their entire lives, offering unparalleled knowledge." },
        { icon: "shield", title: "Safety First", description: "Every expedition is equipped with satellite communication, first aid, and maintained vehicles." },
        { icon: "star", title: "Small Groups", description: "We keep groups intimate (max 8 travelers) ensuring a personal, immersive experience." },
        { icon: "heart", title: "Sustainable Travel", description: "We practice leave-no-trace principles and invest directly in local communities." },
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
    title: "The Desert Awaits",
    subtitle: "A glimpse into the extraordinary",
    content: {
      images: ["https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80", "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80", "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80", "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80", "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80", "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?w=800&q=80"],
      text: "From the towering sandstone forests of Tadrart to the crystalline lakes of Ihrir, the Algerian Sahara is a world of contrasts and wonder.",
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
    title: "What Travelers Say",
    subtitle: "Stories from the dunes",
    content: {
      quotes: [
        { name: "Marie Laurent", location: "Paris, France", text: "The most extraordinary travel experience of my life. The silence of the desert, the kindness of our guides, the star-filled nights — simply unforgettable.", rating: 5 },
        { name: "Thomas Müller", location: "Berlin, Germany", text: "Gnawa Tours exceeded every expectation. The Tadrart Rouge landscape is like being on another planet. Professional, authentic, and magical.", rating: 5 },
        { name: "Sarah Chen", location: "London, UK", text: "I have traveled extensively but nothing compares to this. The desert has a way of resetting your soul. Thank you, Gnawa Tours, for an incredible journey.", rating: 5 },
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

async function getData() {
  // Try to fetch from Supabase, fallback to defaults
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      hero: defaultHero,
      programs: defaultPrograms,
      sections: defaultSections,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [heroRes, programsRes, sectionsRes] = await Promise.all([
      supabase.from("hero_settings").select("*").single(),
      supabase.from("programs").select("*").eq("is_published", true).order("display_order"),
      supabase.from("dynamic_sections").select("*").eq("is_visible", true).order("display_order"),
    ]);

    return {
      hero: (heroRes.data as HeroSettings) || defaultHero,
      programs: (programsRes.data as Program[]) || defaultPrograms,
      sections: (sectionsRes.data as DynamicSectionType[]) || defaultSections,
    };
  } catch {
    return {
      hero: defaultHero,
      programs: defaultPrograms,
      sections: defaultSections,
    };
  }
}

export default async function HomePage() {
  const headerList = headers();
  const geoCountry = getGeoCountryFromHeaders(headerList);
  const pricingRegion = geoCountry === "DZ" ? "DZ" : "INTL";
  const pricingLocale = pricingRegion === "DZ" ? "fr-FR" : "en-US";
  const { hero, programs, sections } = await getData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Gnawa Tours",
    description: hero.subheadline,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://gnawatours.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Djanet",
      addressRegion: "Illizi Province",
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
      <ShowcaseScroll />
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

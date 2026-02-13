export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: string;
  start_date: string | null;
  end_date: string | null;
  price_eur: number | null;
  price_dzd: number | null;
  difficulty: "easy" | "moderate" | "challenging" | "expert";
  highlights: string[];
  itinerary: ItineraryDay[];
  gallery_urls: string[];
  cover_image: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type LayoutType = "text-left" | "text-right" | "centered" | "full-bleed" | "grid";

export interface DynamicSection {
  id: string;
  section_key: string;
  title: string;
  nav_title: string;
  subtitle: string | null;
  content: Record<string, unknown>;
  layout_type: LayoutType;
  background_image: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroSettings {
  id: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  background_image: string | null;
  overlay_opacity: number;
  created_at: string;
  updated_at: string;
}

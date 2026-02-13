-- ============================================================
-- Gnawa Tours: Full Setup (Schema + Seed Data)
-- Paste this entire file into Supabase SQL Editor and run it
-- ============================================================

-- ========================
-- 1. TABLES
-- ========================

CREATE TABLE IF NOT EXISTS hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL DEFAULT 'Explore the Sahara',
  subheadline TEXT NOT NULL DEFAULT 'Unforgettable desert expeditions in Algeria',
  cta_text TEXT NOT NULL DEFAULT 'Book Your Journey',
  background_image TEXT,
  overlay_opacity NUMERIC(3,2) DEFAULT 0.4,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  price_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_dzd NUMERIC(12,2) NOT NULL DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert')),
  highlights TEXT[] DEFAULT '{}',
  itinerary JSONB DEFAULT '[]',
  gallery_urls TEXT[] DEFAULT '{}',
  cover_image TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dynamic_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB DEFAULT '{}',
  layout_type TEXT NOT NULL CHECK (layout_type IN ('text-left', 'text-right', 'centered', 'full-bleed', 'grid')),
  background_image TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  group_size INTEGER DEFAULT 1,
  preferred_date DATE,
  message TEXT,
  origin_country TEXT NOT NULL DEFAULT 'INTL',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================
-- 2. TRIGGERS
-- ========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at_hero BEFORE UPDATE ON hero_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_programs BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_sections BEFORE UPDATE ON dynamic_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========================
-- 3. ROW LEVEL SECURITY
-- ========================

ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe re-run)
DROP POLICY IF EXISTS "Public can view hero" ON hero_settings;
DROP POLICY IF EXISTS "Public can view published programs" ON programs;
DROP POLICY IF EXISTS "Public can view visible sections" ON dynamic_sections;
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view media" ON media;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Auth full access hero" ON hero_settings;
DROP POLICY IF EXISTS "Auth full access programs" ON programs;
DROP POLICY IF EXISTS "Auth full access sections" ON dynamic_sections;
DROP POLICY IF EXISTS "Auth full access bookings" ON bookings;
DROP POLICY IF EXISTS "Auth full access media" ON media;
DROP POLICY IF EXISTS "Auth full access settings" ON site_settings;

-- Public read
CREATE POLICY "Public can view hero" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Public can view published programs" ON programs FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view visible sections" ON dynamic_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view media" ON media FOR SELECT USING (true);

-- Public insert on bookings
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Authenticated full CRUD
CREATE POLICY "Auth full access hero" ON hero_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access programs" ON programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access sections" ON dynamic_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ========================
-- 4. INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_sections_visible ON dynamic_sections(is_visible, display_order);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status, created_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON site_settings(key);

-- ========================
-- 5. SEED DATA
-- ========================

-- Clear old data
TRUNCATE hero_settings, dynamic_sections, site_settings CASCADE;
TRUNCATE programs CASCADE;

-- Hero
INSERT INTO hero_settings (headline, subheadline, cta_text, background_image, overlay_opacity)
VALUES (
  'Discover the Algerian Sahara',
  'Journey through ancient landscapes where towering sandstone arches meet endless golden dunes',
  'Begin Your Adventure',
  'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?w=1920&q=80',
  0.45
);

-- Programs
INSERT INTO programs (title, slug, description, duration, start_date, end_date, price_eur, price_dzd, difficulty, highlights, itinerary, cover_image, display_order, is_published)
VALUES
(
  'Tadrart Rouge Expedition',
  'tadrart-rouge-expedition',
  'Immerse yourself in the breathtaking red rock formations of Tadrart Rouge, one of the most spectacular landscapes on Earth. This 5-day expedition takes you through ancient canyons, past prehistoric rock art, and across sweeping dune fields painted in shades of amber and crimson.',
  '5 days / 4 nights',
  '2026-10-05',
  '2026-10-09',
  1200.00,
  180000.00,
  'moderate',
  ARRAY['Red sandstone arches of Tadrart', 'Prehistoric Tassili rock art', 'Sunset camel trek across Erg Admer', 'Traditional Tuareg camp experience', 'Star-gazing in zero light pollution'],
  '[
    {"day": 1, "title": "Arrival in Djanet", "description": "Arrive at Djanet airport, transfer to hotel. Evening briefing and welcome dinner with traditional Tuareg music."},
    {"day": 2, "title": "Into the Tadrart", "description": "Depart by 4x4 into the heart of Tadrart Rouge. Visit the famous rock arches and explore hidden canyons. Camp under the stars."},
    {"day": 3, "title": "Rock Art & Dunes", "description": "Morning visit to prehistoric rock paintings. Afternoon camel trek through Erg Admer dunes. Sunset photography session."},
    {"day": 4, "title": "Deep Desert", "description": "Full day exploring remote valleys and seasonal guelta pools. Traditional lunch prepared by guides. Night camp with Tuareg storytelling."},
    {"day": 5, "title": "Return to Djanet", "description": "Morning drive through varied landscapes back to Djanet. Farewell lunch and departure."}
  ]'::jsonb,
  'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?w=1920&q=80',
  1,
  true
),
(
  'Ihrir Desert Oasis Adventure',
  'ihrir-desert-oasis',
  'Discover the hidden gem of Ihrir, a stunning desert oasis nestled within the rugged Tassili n''Ajjer plateau. This 4-day adventure combines dramatic canyon landscapes with the surreal beauty of permanent lakes surrounded by nothing but sand and rock.',
  '4 days / 3 nights',
  '2026-11-14',
  '2026-11-17',
  950.00,
  145000.00,
  'moderate',
  ARRAY['Ihrir permanent desert lakes', 'Tassili n''Ajjer UNESCO World Heritage', 'Canyon hiking adventures', 'Desert wildlife spotting', 'Authentic nomadic cuisine'],
  '[
    {"day": 1, "title": "Djanet to Illizi", "description": "Scenic drive from Djanet through the Tassili plateau to Illizi. Check in and explore the local market."},
    {"day": 2, "title": "Journey to Ihrir", "description": "4x4 expedition to the remarkable Ihrir oasis. Hike through dramatic canyons to discover hidden lakes. Camp at the oasis."},
    {"day": 3, "title": "Oasis Exploration", "description": "Full day exploring the surrounding rock formations, swimming in crystal-clear guelta pools, and discovering ancient engravings."},
    {"day": 4, "title": "Return Journey", "description": "Morning departure back to Illizi/Djanet. Stop at panoramic viewpoints along the way. Farewell dinner."}
  ]'::jsonb,
  'https://images.pexels.com/photos/1703314/pexels-photo-1703314.jpeg?w=1920&q=80',
  2,
  true
);

-- Dynamic Sections
INSERT INTO dynamic_sections (section_key, title, subtitle, content, layout_type, background_image, is_visible, display_order)
VALUES
(
  'our-story',
  'Our Story',
  'Born from a passion for the Sahara',
  '{"text": "Gnawa Tours was founded by seasoned Saharan guides who grew up in the shadows of the Tassili mountains. With over two decades of experience leading expeditions across the Algerian desert, we offer authentic, safe, and unforgettable journeys into one of the last true wildernesses on Earth. Our name pays homage to the rich Gnawa musical tradition that echoes through the desert nights.", "image": "https://images.pexels.com/photos/4577791/pexels-photo-4577791.jpeg?w=1200&q=80"}'::jsonb,
  'centered',
  NULL,
  true,
  1
),
(
  'why-choose-us',
  'Why Choose Us',
  'What makes Gnawa Tours different',
  '{"cards": [
    {"icon": "compass", "title": "Expert Local Guides", "description": "Our Tuareg guides have lived in the Sahara their entire lives, offering unparalleled knowledge of the terrain, culture, and hidden gems."},
    {"icon": "shield", "title": "Safety First", "description": "Every expedition is equipped with satellite communication, first aid, and thoroughly maintained vehicles for your peace of mind."},
    {"icon": "star", "title": "Small Groups", "description": "We keep groups intimate (max 8 travelers) ensuring a personal, immersive experience far from the crowds."},
    {"icon": "heart", "title": "Sustainable Travel", "description": "We practice leave-no-trace principles and invest directly in local communities, preserving the desert for future generations."}
  ]}'::jsonb,
  'grid',
  NULL,
  true,
  2
),
(
  'the-desert',
  'The Desert Awaits',
  'A glimpse into the extraordinary',
  '{"images": [
    "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?w=800&q=80"
  ], "text": "From the towering sandstone forests of Tadrart to the crystalline lakes of Ihrir, the Algerian Sahara is a world of contrasts and wonder."}'::jsonb,
  'full-bleed',
  'https://images.pexels.com/photos/3876407/pexels-photo-3876407.jpeg?w=1920&q=80',
  true,
  3
),
(
  'testimonials',
  'What Travelers Say',
  'Stories from the dunes',
  '{"quotes": [
    {"name": "Marie Laurent", "location": "Paris, France", "text": "The most extraordinary travel experience of my life. The silence of the desert, the kindness of our guides, the star-filled nights — simply unforgettable.", "rating": 5},
    {"name": "Thomas Müller", "location": "Berlin, Germany", "text": "Gnawa Tours exceeded every expectation. The Tadrart Rouge landscape is like being on another planet. Professional, authentic, and magical.", "rating": 5},
    {"name": "Sarah Chen", "location": "London, UK", "text": "I have traveled extensively but nothing compares to this. The desert has a way of resetting your soul. Thank you, Gnawa Tours, for an incredible journey.", "rating": 5}
  ]}'::jsonb,
  'text-left',
  NULL,
  true,
  4
);

-- Site Settings
INSERT INTO site_settings (key, value)
VALUES
('site_name', '"Gnawa Tours"'::jsonb),
('contact_email', '"info@gnawatours.com"'::jsonb),
('contact_phone', '"+213 555 123 456"'::jsonb),
('address', '"Djanet, Illizi Province, Algeria"'::jsonb),
('social_links', '{"instagram": "https://instagram.com/gnawatours", "facebook": "https://facebook.com/gnawatours", "youtube": "https://youtube.com/@gnawatours"}'::jsonb),
('seo', '{"title": "Gnawa Tours - Saharan Desert Expeditions", "description": "Premium travel agency specializing in Algerian Sahara expeditions.", "keywords": ["sahara", "algeria", "desert", "expedition", "djanet", "tadrart", "ihrir"]}'::jsonb);

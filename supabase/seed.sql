-- ============================================================
-- Gnaoua Tours: Full Setup (Schema + Seed Data)
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
  nav_title TEXT NOT NULL,
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
-- 3B. STORAGE (MEDIA BUCKET)
-- ========================

-- Create bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gnawa-media', 'gnawa-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (safe re-run)
DROP POLICY IF EXISTS "Public can read gnawa media" ON storage.objects;
DROP POLICY IF EXISTS "Auth can upload gnawa media" ON storage.objects;
DROP POLICY IF EXISTS "Auth can delete gnawa media" ON storage.objects;

CREATE POLICY "Public can read gnawa media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gnawa-media');

CREATE POLICY "Auth can upload gnawa media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gnawa-media');

CREATE POLICY "Auth can delete gnawa media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gnawa-media');

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
  'Découvrir le Sahara algérien',
  'Voyagez à travers des paysages ancestraux où les arches de grès se dressent au-dessus des dunes dorées sans fin',
  'Commencer l’aventure',
  'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?w=1920&q=80',
  0.45
);

-- Programs
INSERT INTO programs (title, slug, description, duration, start_date, end_date, price_eur, price_dzd, difficulty, highlights, itinerary, cover_image, display_order, is_published)
VALUES
(
  'Expédition Tadrart Rouge',
  'tadrart-rouge-expedition',
  'Immergez-vous dans les formations rocheuses rougeoyantes du Tadrart Rouge, l’un des paysages les plus spectaculaires au monde. Cette expédition de 5 jours vous mène à travers des canyons anciens, des peintures rupestres préhistoriques et de vastes mers de dunes teintées d’ambre et de carmin.',
  '5 jours / 4 nuits',
  '2026-10-05',
  '2026-10-09',
  1200.00,
  180000.00,
  'moderate',
  ARRAY['Arches de grès rouge du Tadrart', 'Art rupestre préhistorique du Tassili', 'Balade à dos de chameau au coucher du soleil dans l’Erg Admer', 'Expérience de campement touareg traditionnel', 'Observation des étoiles sans pollution lumineuse'],
  '[
    {"day": 1, "title": "Arrivée à Djanet", "description": "Arrivée à l’aéroport de Djanet, transfert à l’hôtel. Briefing du soir et dîner de bienvenue avec musique touareg traditionnelle."},
    {"day": 2, "title": "Cap sur le Tadrart", "description": "Départ en 4x4 au cœur du Tadrart Rouge. Visite des arches emblématiques et exploration de canyons secrets. Bivouac sous les étoiles."},
    {"day": 3, "title": "Art rupestre & dunes", "description": "Visite matinale des peintures préhistoriques. Balade en chameau dans l’Erg Admer. Session photo au coucher du soleil."},
    {"day": 4, "title": "Désert profond", "description": "Journée complète à travers des vallées reculées et des gueltas saisonnières. Déjeuner traditionnel préparé par les guides. Veillée au camp avec récits touaregs."},
    {"day": 5, "title": "Retour à Djanet", "description": "Trajet matinal à travers des paysages variés jusqu’à Djanet. Déjeuner d’au revoir et départ."}
  ]'::jsonb,
  'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?w=1920&q=80',
  1,
  true
),
(
  'Aventure oasis d’Ihrir',
  'ihrir-desert-oasis',
  'Découvrez le joyau caché d’Ihrir, une oasis désertique spectaculaire nichée au cœur du plateau rocheux du Tassili n’Ajjer. Cette aventure de 4 jours combine des canyons grandioses et la beauté irréelle de lacs permanents entourés de sable et de roche.',
  '4 jours / 3 nuits',
  '2026-11-14',
  '2026-11-17',
  950.00,
  145000.00,
  'moderate',
  ARRAY['Lacs désertiques permanents d’Ihrir', 'Tassili n’Ajjer classé au patrimoine mondial de l’UNESCO', 'Randonnées dans les canyons', 'Observation de la faune du désert', 'Cuisine nomade authentique'],
  '[
    {"day": 1, "title": "Djanet à Illizi", "description": "Route panoramique de Djanet à Illizi à travers le plateau du Tassili. Installation et découverte du marché local."},
    {"day": 2, "title": "Vers Ihrir", "description": "Expédition en 4x4 vers l’oasis d’Ihrir. Randonnée dans des canyons spectaculaires pour découvrir des lacs cachés. Nuit au camp de l’oasis."},
    {"day": 3, "title": "Exploration de l’oasis", "description": "Journée complète à explorer les formations rocheuses, nager dans les gueltas cristallines et découvrir des gravures anciennes."},
    {"day": 4, "title": "Retour", "description": "Départ matinal vers Illizi/Djanet. Arrêt aux points de vue panoramiques. Dîner d’au revoir."}
  ]'::jsonb,
  'https://images.pexels.com/photos/1703314/pexels-photo-1703314.jpeg?w=1920&q=80',
  2,
  true
);

-- Dynamic Sections
INSERT INTO dynamic_sections (section_key, title, nav_title, subtitle, content, layout_type, background_image, is_visible, display_order)
VALUES
(
  'our-story',
  'Notre histoire',
  'Notre histoire',
  'Née d’une passion pour le Sahara',
  '{"text": "Gnaoua Tours a été fondée par des guides sahariens chevronnés qui ont grandi à l’ombre des montagnes du Tassili. Forts de plus de vingt ans d’expéditions à travers le désert algérien, nous proposons des voyages authentiques, sûrs et inoubliables au cœur de l’un des derniers grands espaces sauvages. Notre nom rend hommage à la riche tradition musicale gnawa qui résonne dans les nuits du désert.", "image": "https://images.pexels.com/photos/4577791/pexels-photo-4577791.jpeg?w=1200&q=80"}'::jsonb,
  'centered',
  NULL,
  true,
  1
),
(
  'why-choose-us',
  'Pourquoi nous choisir',
  'Pourquoi nous',
  'Ce qui rend Gnaoua Tours différent',
  '{"cards": [
    {"icon": "compass", "title": "Guides locaux experts", "description": "Nos guides touaregs vivent dans le Sahara depuis toujours, offrant une connaissance inégalée du terrain, de la culture et des lieux secrets."},
    {"icon": "shield", "title": "Sécurité avant tout", "description": "Chaque expédition est équipée de communications satellite, de premiers secours et de véhicules parfaitement entretenus."},
    {"icon": "star", "title": "Petits groupes", "description": "Nous limitons les groupes (max. 8 voyageurs) pour une expérience intime et immersive, loin des foules."},
    {"icon": "heart", "title": "Voyage durable", "description": "Nous appliquons le principe “leave no trace” et investissons directement dans les communautés locales, pour préserver le désert."}
  ]}'::jsonb,
  'grid',
  NULL,
  true,
  2
),
(
  'the-desert',
  'Le désert vous attend',
  'Galerie',
  'Un aperçu de l’extraordinaire',
  '{"images": [
    "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80",
    "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?w=800&q=80"
  ], "text": "Des forêts de grès du Tadrart aux lacs cristallins d’Ihrir, le Sahara algérien est un monde de contrastes et d’émerveillement."}'::jsonb,
  'full-bleed',
  'https://images.pexels.com/photos/3876407/pexels-photo-3876407.jpeg?w=1920&q=80',
  true,
  3
),
(
  'testimonials',
  'Ce que disent nos voyageurs',
  'Avis',
  'Récits venus des dunes',
  '{"quotes": [
    {"name": "Marie Laurent", "location": "Paris, France", "text": "L’expérience de voyage la plus extraordinaire de ma vie. Le silence du désert, la gentillesse de nos guides, les nuits étoilées — inoubliable.", "rating": 5},
    {"name": "Thomas Müller", "location": "Berlin, Allemagne", "text": "Gnaoua Tours a dépassé toutes mes attentes. Le Tadrart Rouge donne l’impression d’être sur une autre planète. Professionnel, authentique et magique.", "rating": 5},
    {"name": "Sarah Chen", "location": "Londres, Royaume‑Uni", "text": "J’ai beaucoup voyagé mais rien n’égale cela. Le désert a le pouvoir de réinitialiser l’âme. Merci, Gnaoua Tours, pour ce voyage incroyable.", "rating": 5}
  ]}'::jsonb,
  'text-left',
  NULL,
  true,
  4
);

-- Site Settings
INSERT INTO site_settings (key, value)
VALUES
('site_name', '"Gnaoua Tours"'::jsonb),
('contact_email', '"info@gnawatours.com"'::jsonb),
('contact_phone', '"+213 555 123 456"'::jsonb),
('address', '"Djanet, wilaya d’Illizi, Algérie"'::jsonb),
('showcase_images', '["https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80","https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80","https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80","https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80","https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80"]'::jsonb),
('ambient_music_enabled', 'false'::jsonb),
('ambient_music_tracks', '[]'::jsonb),
('social_links', '{"instagram": "https://instagram.com/gnawatours", "facebook": "https://facebook.com/gnawatours", "youtube": "https://youtube.com/@gnawatours"}'::jsonb),
('seo', '{"title": "Gnaoua Tours - Expéditions dans le Sahara", "description": "Agence de voyages premium spécialisée dans les expéditions du Sahara algérien.", "keywords": ["sahara", "algérie", "désert", "expédition", "djanet", "tadrart", "ihrir"]}'::jsonb);

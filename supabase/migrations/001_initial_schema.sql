-- Gnawa Tours Initial Schema

-- Hero Settings
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

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
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

-- Dynamic Sections
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

-- Bookings
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

-- Media
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

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_updated_at_hero BEFORE UPDATE ON hero_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_programs BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_sections BEFORE UPDATE ON dynamic_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_settings BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
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

-- Indexes
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_published ON programs(is_published, display_order);
CREATE INDEX idx_sections_visible ON dynamic_sections(is_visible, display_order);
CREATE INDEX idx_bookings_status ON bookings(status, created_at);
CREATE INDEX idx_settings_key ON site_settings(key);

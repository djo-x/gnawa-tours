-- ============================================================
-- Gnaoua Tours: French content update
-- Updates existing English seed content to French
-- Safe to re-run (updates by slug / section_key / key)
-- ============================================================

BEGIN;

-- ========================
-- 1. HERO SETTINGS
-- ========================
UPDATE hero_settings
SET
  headline = 'Découvrir le Sahara algérien',
  subheadline = 'Voyagez à travers des paysages ancestraux où les arches de grès se dressent au-dessus des dunes dorées sans fin',
  cta_text = 'Commencer l’aventure'
WHERE true;

-- ========================
-- 2. PROGRAMS
-- ========================
UPDATE programs
SET
  title = 'Expédition Tadrart Rouge',
  description = 'Immergez-vous dans les formations rocheuses rougeoyantes du Tadrart Rouge, l’un des paysages les plus spectaculaires au monde. Cette expédition de 5 jours vous mène à travers des canyons anciens, des peintures rupestres préhistoriques et de vastes mers de dunes teintées d’ambre et de carmin.',
  duration = '5 jours / 4 nuits',
  highlights = ARRAY[
    'Arches de grès rouge du Tadrart',
    'Art rupestre préhistorique du Tassili',
    'Balade à dos de chameau au coucher du soleil dans l’Erg Admer',
    'Expérience de campement touareg traditionnel',
    'Observation des étoiles sans pollution lumineuse'
  ],
  itinerary = '[
    {"day": 1, "title": "Arrivée à Djanet", "description": "Arrivée à l’aéroport de Djanet, transfert à l’hôtel. Briefing du soir et dîner de bienvenue avec musique touareg traditionnelle."},
    {"day": 2, "title": "Cap sur le Tadrart", "description": "Départ en 4x4 au cœur du Tadrart Rouge. Visite des arches emblématiques et exploration de canyons secrets. Bivouac sous les étoiles."},
    {"day": 3, "title": "Art rupestre & dunes", "description": "Visite matinale des peintures préhistoriques. Balade en chameau dans l’Erg Admer. Session photo au coucher du soleil."},
    {"day": 4, "title": "Désert profond", "description": "Journée complète à travers des vallées reculées et des gueltas saisonnières. Déjeuner traditionnel préparé par les guides. Veillée au camp avec récits touaregs."},
    {"day": 5, "title": "Retour à Djanet", "description": "Trajet matinal à travers des paysages variés jusqu’à Djanet. Déjeuner d’au revoir et départ."}
  ]'::jsonb
WHERE slug = 'tadrart-rouge-expedition';

UPDATE programs
SET
  title = 'Aventure oasis d’Ihrir',
  description = 'Découvrez le joyau caché d’Ihrir, une oasis désertique spectaculaire nichée au cœur du plateau rocheux du Tassili n’Ajjer. Cette aventure de 4 jours combine des canyons grandioses et la beauté irréelle de lacs permanents entourés de sable et de roche.',
  duration = '4 jours / 3 nuits',
  highlights = ARRAY[
    'Lacs désertiques permanents d’Ihrir',
    'Tassili n’Ajjer classé au patrimoine mondial de l’UNESCO',
    'Randonnées dans les canyons',
    'Observation de la faune du désert',
    'Cuisine nomade authentique'
  ],
  itinerary = '[
    {"day": 1, "title": "Djanet à Illizi", "description": "Route panoramique de Djanet à Illizi à travers le plateau du Tassili. Installation et découverte du marché local."},
    {"day": 2, "title": "Vers Ihrir", "description": "Expédition en 4x4 vers l’oasis d’Ihrir. Randonnée dans des canyons spectaculaires pour découvrir des lacs cachés. Nuit au camp de l’oasis."},
    {"day": 3, "title": "Exploration de l’oasis", "description": "Journée complète à explorer les formations rocheuses, nager dans les gueltas cristallines et découvrir des gravures anciennes."},
    {"day": 4, "title": "Retour", "description": "Départ matinal vers Illizi/Djanet. Arrêt aux points de vue panoramiques. Dîner d’au revoir."}
  ]'::jsonb
WHERE slug = 'ihrir-desert-oasis';

-- ========================
-- 3. DYNAMIC SECTIONS
-- ========================
UPDATE dynamic_sections
SET
  title = 'Notre histoire',
  nav_title = 'Notre histoire',
  subtitle = 'Née d’une passion pour le Sahara',
  content = jsonb_set(
    COALESCE(content, '{}'::jsonb),
    '{text}',
    '"Gnaoua Tours a été fondée par des guides sahariens chevronnés qui ont grandi à l’ombre des montagnes du Tassili. Forts de plus de vingt ans d’expéditions à travers le désert algérien, nous proposons des voyages authentiques, sûrs et inoubliables au cœur de l’un des derniers grands espaces sauvages. Notre nom rend hommage à la riche tradition musicale gnawa qui résonne dans les nuits du désert."'::jsonb,
    true
  )
WHERE section_key = 'our-story';

UPDATE dynamic_sections
SET
  title = 'Pourquoi nous choisir',
  nav_title = 'Pourquoi nous',
  subtitle = 'Ce qui rend Gnaoua Tours différent',
  content = '{"cards": [
    {"icon": "compass", "title": "Guides locaux experts", "description": "Nos guides touaregs vivent dans le Sahara depuis toujours, offrant une connaissance inégalée du terrain, de la culture et des lieux secrets."},
    {"icon": "shield", "title": "Sécurité avant tout", "description": "Chaque expédition est équipée de communications satellite, de premiers secours et de véhicules parfaitement entretenus."},
    {"icon": "star", "title": "Petits groupes", "description": "Nous limitons les groupes (max. 8 voyageurs) pour une expérience intime et immersive, loin des foules."},
    {"icon": "heart", "title": "Voyage durable", "description": "Nous appliquons le principe “leave no trace” et investissons directement dans les communautés locales, pour préserver le désert."}
  ]}'::jsonb
WHERE section_key = 'why-choose-us';

UPDATE dynamic_sections
SET
  title = 'Le désert vous attend',
  nav_title = 'Galerie',
  subtitle = 'Un aperçu de l’extraordinaire',
  content = jsonb_set(
    COALESCE(content, '{}'::jsonb),
    '{text}',
    '"Des forêts de grès du Tadrart aux lacs cristallins d’Ihrir, le Sahara algérien est un monde de contrastes et d’émerveillement."'::jsonb,
    true
  )
WHERE section_key = 'the-desert';

UPDATE dynamic_sections
SET
  title = 'Ce que disent nos voyageurs',
  nav_title = 'Avis',
  subtitle = 'Récits venus des dunes',
  content = '{"quotes": [
    {"name": "Marie Laurent", "location": "Paris, France", "text": "L’expérience de voyage la plus extraordinaire de ma vie. Le silence du désert, la gentillesse de nos guides, les nuits étoilées — inoubliable.", "rating": 5},
    {"name": "Thomas Müller", "location": "Berlin, Allemagne", "text": "Gnaoua Tours a dépassé toutes mes attentes. Le Tadrart Rouge donne l’impression d’être sur une autre planète. Professionnel, authentique et magique.", "rating": 5},
    {"name": "Sarah Chen", "location": "Londres, Royaume‑Uni", "text": "J’ai beaucoup voyagé mais rien n’égale cela. Le désert a le pouvoir de réinitialiser l’âme. Merci, Gnaoua Tours, pour ce voyage incroyable.", "rating": 5}
  ]}'::jsonb
WHERE section_key = 'testimonials';

-- ========================
-- 4. SITE SETTINGS
-- ========================
UPDATE site_settings
SET value = '"Gnaoua Tours"'::jsonb
WHERE key = 'site_name';

UPDATE site_settings
SET value = '"Djanet, wilaya d’Illizi, Algérie"'::jsonb
WHERE key = 'address';

UPDATE site_settings
SET value = '{"title": "Gnaoua Tours - Expéditions dans le Sahara", "description": "Agence de voyages premium spécialisée dans les expéditions du Sahara algérien.", "keywords": ["sahara", "algérie", "désert", "expédition", "djanet", "tadrart", "ihrir"]}'::jsonb
WHERE key = 'seo';

COMMIT;

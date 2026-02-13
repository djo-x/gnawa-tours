-- Add nav_title to dynamic sections
ALTER TABLE dynamic_sections
  ADD COLUMN IF NOT EXISTS nav_title TEXT;

UPDATE dynamic_sections
SET nav_title = COALESCE(NULLIF(nav_title, ''), title)
WHERE nav_title IS NULL OR nav_title = '';

ALTER TABLE dynamic_sections
  ALTER COLUMN nav_title SET NOT NULL;

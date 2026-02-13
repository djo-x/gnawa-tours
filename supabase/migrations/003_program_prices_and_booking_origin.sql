-- Add EUR and DZD prices to programs
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS price_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_dzd NUMERIC(12,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'programs' AND column_name = 'price'
  ) THEN
    UPDATE programs
    SET price_eur = COALESCE(NULLIF(price_eur, 0), price),
        price_dzd = COALESCE(NULLIF(price_dzd, 0), price)
    WHERE price IS NOT NULL;

    ALTER TABLE programs DROP COLUMN price;
  END IF;
END $$;

-- Track booking origin
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS origin_country TEXT DEFAULT 'INTL';

UPDATE bookings
SET origin_country = 'INTL'
WHERE origin_country IS NULL;

ALTER TABLE bookings
  ALTER COLUMN origin_country SET NOT NULL;

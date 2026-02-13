-- Add start and end dates to programs
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

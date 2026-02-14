-- Ambient music feature settings
insert into site_settings (key, value)
values
  ('ambient_music_enabled', 'false'::jsonb),
  ('ambient_music_tracks', '[]'::jsonb)
on conflict (key) do nothing;

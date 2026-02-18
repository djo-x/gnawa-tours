insert into site_settings (key, value)
values ('site_logo', 'null'::jsonb)
on conflict (key) do nothing;

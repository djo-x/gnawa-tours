-- Create Supabase Storage bucket and policies for media uploads

-- Create bucket (public)
insert into storage.buckets (id, name, public)
values ('gnawa-media', 'gnawa-media', true)
on conflict (id) do nothing;

-- Drop existing policies (safe re-run)
drop policy if exists "Public can read gnawa media" on storage.objects;
drop policy if exists "Auth can upload gnawa media" on storage.objects;
drop policy if exists "Auth can delete gnawa media" on storage.objects;

-- Public read access
create policy "Public can read gnawa media"
  on storage.objects for select
  using (bucket_id = 'gnawa-media');

-- Authenticated uploads
create policy "Auth can upload gnawa media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gnawa-media');

-- Authenticated deletes
create policy "Auth can delete gnawa media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gnawa-media');

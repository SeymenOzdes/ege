insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-media',
  'news-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve an object when its exact URL is known. Listing remains RLS-protected.
create policy news_media_staff_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'news-media'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN')
);

-- Inserts are deliberately the only object mutation allowed. Client code always uses a UUID path
-- and `upsert: false`, so an existing object can never be overwritten through this policy.
create policy news_media_staff_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'news-media'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN')
);

-- This file is intentionally data-only. `pnpm supabase:reset` applies migrations first.

insert into public.topics (name, slug, description, sort_order)
values
  ('Gündem', 'gundem', 'Ege Bölgesi gündemi ve kamusal yaşam.', 10),
  ('Ekonomi', 'ekonomi', 'Yerel ekonomi, üretim ve emek.', 20),
  ('Kültür-Sanat', 'kultur-sanat', 'Kültür, sanat ve tarih.', 30),
  ('Yaşam', 'yasam', 'Günlük yaşam, çevre ve topluluk.', 40)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.locations (name, slug, province_code)
values
  ('İzmir', 'izmir', '35'),
  ('Aydın', 'aydin', '09'),
  ('Muğla', 'mugla', '48'),
  ('Manisa', 'manisa', '45'),
  ('Denizli', 'denizli', '20'),
  ('Balıkesir', 'balikesir', '10')
on conflict (slug) do update
set
  name = excluded.name,
  province_code = excluded.province_code;

insert into public.authors (name, slug, role_label, bio)
values (
  'Ece Aksoy',
  'ece-aksoy',
  'Yerel yaşam muhabiri',
  'Ege''nin şehirlerinde yerel yaşam, dayanışma ve kent kültürü üzerine haberler hazırlıyor.'
)
on conflict (slug) do update
set
  name = excluded.name,
  role_label = excluded.role_label,
  bio = excluded.bio;

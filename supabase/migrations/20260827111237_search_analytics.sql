-- Sonuçsuz arama sorguları. Editoryal denetim izinden ayrı tutulur: bu kayıtlar
-- anonim ziyaretçi telemetrisidir, `audit_logs` ise personel eylemlerini taşır.
create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  query_normalized text not null,
  topic_slug text,
  location_slug text,
  result_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint search_queries_query_length check (char_length(query) between 1 and 120),
  constraint search_queries_result_count_nonnegative check (result_count >= 0)
);

-- Yönetim tarafı yalnızca sonuçsuz sorgularla ilgilenir.
create index search_queries_no_result_idx
  on public.search_queries (created_at desc)
  where result_count = 0;

-- Aynı ifadenin tekrarını saymak için.
create index search_queries_normalized_idx
  on public.search_queries (query_normalized, created_at desc);

alter table public.search_queries enable row level security;

-- `audit_logs` ile aynı kapalı model: politika yok, anon/authenticated grant'i
-- yok. Yalnızca sunucu tarafındaki secret key ile yazılır.
grant select, insert on table public.search_queries to service_role;

-- Arama sayfası artık sayfa başına 10 sonuç gösteriyor; varsayılan limit buna
-- göre güncellenir. `p_limit` için ayrıca 50'lik bir üst sınır konur: fonksiyon
-- anon rolüne açık olduğundan doğrudan RPC çağrısı sınırsız satır isteyebiliyordu.
--
-- İmza ve dönüş tipi aynı kaldığı için `create or replace` yeterlidir; mevcut
-- yetkiler korunur.
create or replace function public.search_published_articles(
  p_query text,
  p_topic text default null,
  p_location text default null,
  p_limit integer default 10,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  headline text,
  topic_name text,
  topic_slug text,
  location_name text,
  location_slug text,
  published_at timestamptz,
  word_count integer,
  rank real,
  total_count bigint,
  hero_object_path text,
  hero_alt_text text,
  hero_width integer,
  hero_height integer,
  hero_focal_point_x numeric,
  hero_focal_point_y numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  with parsed as (
    -- Boş girdide websearch_to_tsquery bir NOTICE üretir; sorgu boşsa
    -- tsquery hiç kurulmaz ve fonksiyon sessizce boş sonuç döndürür.
    select case
      when btrim(coalesce(p_query, '')) = '' then null::tsquery
      else websearch_to_tsquery('pg_catalog.turkish'::regconfig, p_query)
    end as ts
  ),
  matched as (
    select
      a.id,
      a.slug,
      a.title,
      a.summary,
      a.body_text,
      a.published_at,
      a.hero_media_id,
      t.name as topic_name,
      t.slug as topic_slug,
      l.name as location_name,
      l.slug as location_slug,
      ts_rank(a.search_vector, p.ts) as rank
    from public.articles as a
    cross join parsed as p
    left join public.topics as t on t.id = a.topic_id
    left join public.locations as l on l.id = a.location_id
    where p.ts is not null
      and p.ts::text <> ''
      and a.search_vector @@ p.ts
      and a.status = 'PUBLISHED'
      and a.published_at is not null
      and a.published_at <= now()
      and a.archived_at is null
      and (p_topic is null or t.slug = p_topic)
      and (p_location is null or l.slug = p_location)
  ),
  -- Sayfa dilimi önce kesilir: toplam sayı pencere fonksiyonuyla LIMIT'ten önce
  -- hesaplanır, ts_headline ve görsel join'i ise yalnızca döndürülen satırlarda
  -- çalışır.
  page as (
    select m.*, count(*) over () as total_count
    from matched as m
    order by m.rank desc, m.published_at desc
    -- Tavan: fonksiyon anon'a açık, istemcinin istediği limit olduğu gibi
    -- kabul edilirse tek çağrıda bütün arşiv çekilebilir.
    limit least(greatest(coalesce(p_limit, 10), 0), 50)
    offset greatest(coalesce(p_offset, 0), 0)
  )
  select
    pg.id,
    pg.slug,
    pg.title,
    pg.summary,
    -- Eşleşmeler STX/ETX kontrol karakterleriyle sınırlanır. Uygulama bu
    -- karakterlerden bölerek gerçek <mark> öğeleri üretir; HTML hiçbir zaman
    -- veritabanından taşınmaz, bu yüzden vurgulama enjeksiyon riski taşımaz.
    ts_headline(
      'pg_catalog.turkish'::regconfig,
      left(coalesce(nullif(pg.summary, '') || ' ', '') || pg.body_text, 4000),
      p.ts,
      E'StartSel="\x02", StopSel="\x03", MaxWords=40, MinWords=20, ShortWord=2, HighlightAll=FALSE, MaxFragments=1'
    ) as headline,
    pg.topic_name,
    pg.topic_slug,
    pg.location_name,
    pg.location_slug,
    pg.published_at,
    coalesce(array_length(regexp_split_to_array(btrim(pg.body_text), '\s+'), 1), 0) as word_count,
    pg.rank,
    pg.total_count,
    h.object_path as hero_object_path,
    h.alt_text as hero_alt_text,
    h.width as hero_width,
    h.height as hero_height,
    h.focal_point_x as hero_focal_point_x,
    h.focal_point_y as hero_focal_point_y
  from page as pg
  cross join parsed as p
  left join public.media_assets as h on h.id = pg.hero_media_id
  order by pg.rank desc, pg.published_at desc;
$$;

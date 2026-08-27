-- Türkçe tam metin arama: yayımlanmış haberler üzerinde sıralı ve vurgulu sonuç.
--
-- `security invoker` seçilir, böylece `articles_public_select` RLS politikası
-- çağıran rol için aynen uygulanır. Yayın koşulları ayrıca WHERE içinde de
-- tekrarlanır: `articles_staff_manage` politikası EDITOR/ADMIN oturumuna taslak
-- ve ileri tarihli haberleri görme izni verir, arama bunları asla döndürmemelidir.
create or replace function public.search_published_articles(
  p_query text,
  p_topic text default null,
  p_location text default null,
  p_limit integer default 6,
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
  total_count bigint
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
  )
  select
    m.id,
    m.slug,
    m.title,
    m.summary,
    -- ts_headline pahalıdır; yalnızca döndürülen sayfa dilimi için çalışır.
    -- Eşleşmeler STX/ETX kontrol karakterleriyle sınırlanır. Uygulama bu
    -- karakterlerden bölerek gerçek <mark> öğeleri üretir; HTML hiçbir zaman
    -- veritabanından taşınmaz, bu yüzden vurgulama enjeksiyon riski taşımaz.
    ts_headline(
      'pg_catalog.turkish'::regconfig,
      left(coalesce(nullif(m.summary, '') || ' ', '') || m.body_text, 4000),
      p.ts,
      E'StartSel="\x02", StopSel="\x03", MaxWords=40, MinWords=20, ShortWord=2, HighlightAll=FALSE, MaxFragments=1'
    ) as headline,
    m.topic_name,
    m.topic_slug,
    m.location_name,
    m.location_slug,
    m.published_at,
    coalesce(array_length(regexp_split_to_array(btrim(m.body_text), '\s+'), 1), 0) as word_count,
    m.rank,
    count(*) over () as total_count
  from matched as m
  cross join parsed as p
  order by m.rank desc, m.published_at desc
  limit greatest(coalesce(p_limit, 6), 0)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- Modül 4, `public` şemasındaki varsayılan yetkileri geri almıştı; bu nedenle
-- yürütme izni açıkça verilir.
revoke all on function public.search_published_articles(text, text, text, integer, integer) from public;
grant execute on function public.search_published_articles(text, text, text, integer, integer)
  to anon, authenticated, service_role;

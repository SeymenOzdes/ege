begin;

create extension if not exists pgtap with schema extensions;
select plan(13);

select has_function(
  'public',
  'search_published_articles',
  array['text', 'text', 'text', 'integer', 'integer'],
  'Türkçe arama fonksiyonu beklenen imzayla mevcut'
);
select function_lang_is('public', 'search_published_articles', 'sql', 'arama fonksiyonu SQL dilindedir');
select is(
  (
    select prosecdef
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'search_published_articles'
  ),
  false,
  'arama fonksiyonu security invoker olarak çalışır, RLS çağıran role uygulanır'
);
select ok(
  has_function_privilege('anon', 'public.search_published_articles(text, text, text, integer, integer)', 'execute'),
  'anon rolü aramayı çalıştırabilir'
);

-- Yayın durumu izolasyonu. Sabitleri test içinde oluşturarak seed'e bağımlı kalınmaz.
insert into public.topics (name, slug, sort_order)
values ('Test Konu', 'test-konu', 900), ('Diğer Konu', 'diger-konu', 910);
insert into public.locations (name, slug, province_code)
values ('Test İli', 'test-ili', '99');

insert into public.articles (slug, title, summary, body_text, status, published_at, topic_id, location_id)
values
  (
    'yayimlanmis-lokma-haberi',
    'Yayımlanmış lokma haberi',
    'Lokma tatlısı üzerine yayımlanmış bir haber.',
    'Lokma tatlısı bölgede uzun yıllardır hazırlanıyor.',
    'PUBLISHED',
    now() - interval '1 hour',
    (select id from public.topics where slug = 'test-konu'),
    (select id from public.locations where slug = 'test-ili')
  ),
  (
    'taslak-lokma-haberi',
    'Taslak lokma haberi',
    'Lokma üzerine hazırlanan taslak.',
    'Lokma tatlısı taslak metni.',
    'DRAFT',
    null,
    (select id from public.topics where slug = 'test-konu'),
    (select id from public.locations where slug = 'test-ili')
  ),
  (
    'ileri-tarihli-lokma-haberi',
    'İleri tarihli lokma haberi',
    'Lokma üzerine zamanlanmış haber.',
    'Lokma tatlısı zamanlanmış metni.',
    'SCHEDULED',
    now() + interval '1 day',
    (select id from public.topics where slug = 'test-konu'),
    (select id from public.locations where slug = 'test-ili')
  ),
  (
    'arsivlenmis-lokma-haberi',
    'Arşivlenmiş lokma haberi',
    'Lokma üzerine arşivlenmiş haber.',
    'Lokma tatlısı arşiv metni.',
    'PUBLISHED',
    now() - interval '2 hours',
    (select id from public.topics where slug = 'test-konu'),
    (select id from public.locations where slug = 'test-ili')
  );

update public.articles set archived_at = now() where slug = 'arsivlenmis-lokma-haberi';

select results_eq(
  $$ select slug from public.search_published_articles('lokma') $$,
  array['yayimlanmis-lokma-haberi'],
  'arama yalnızca yayımlanmış, arşivlenmemiş ve yayın saati geçmiş haberi döndürür'
);

-- EDITOR/ADMIN oturumu articles_staff_manage ile taslakları görebilir; arama
-- yine de yalnızca yayımlanmış içeriği döndürmelidir.
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001", "app_metadata": {"role": "ADMIN"}}';
select results_eq(
  $$ select slug from public.search_published_articles('lokma') $$,
  array['yayimlanmis-lokma-haberi'],
  'yönetici oturumunda bile arama taslak veya zamanlanmış haberi sızdırmaz'
);
reset role;

select is(
  (select count(*)::integer from public.search_published_articles('lokma', 'diger-konu')),
  0,
  'konu filtresi eşleşmeyen haberleri eler'
);
select is(
  (select count(*)::integer from public.search_published_articles('lokma', 'test-konu')),
  1,
  'konu filtresi eşleşen haberi korur'
);
select is(
  (select count(*)::integer from public.search_published_articles('lokma', null, 'test-ili')),
  1,
  'lokasyon filtresi eşleşen haberi korur'
);
select is(
  (select count(*)::integer from public.search_published_articles('')),
  0,
  'boş sorgu sonuç döndürmez'
);
select is(
  (select total_count from public.search_published_articles('lokma')),
  1::bigint,
  'total_count sayfalamadan bağımsız toplam eşleşmeyi verir'
);

-- Vurgulama sınırlayıcıları HTML değil, STX/ETX kontrol karakterleridir.
select ok(
  (select headline from public.search_published_articles('lokma')) like '%' || chr(2) || '%' || chr(3) || '%',
  'eşleşme STX/ETX kontrol karakterleriyle işaretlenir'
);
select ok(
  (select headline from public.search_published_articles('lokma')) not like '%<%',
  'vurgulanan metin hiç HTML içermez'
);

select * from finish();
rollback;

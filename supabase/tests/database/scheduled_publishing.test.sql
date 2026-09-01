begin;

create extension if not exists pgtap with schema extensions;
select plan(26);

-- ---------------------------------------------------------------------------
-- Kurulum: eklenti, fonksiyon ve zamanlanmış iş
-- ---------------------------------------------------------------------------

select ok(
  exists (select 1 from pg_extension where extname = 'pg_cron'),
  'pg_cron eklentisi kurulu'
);

select has_function('private', 'publish_due_articles', 'zamanlanmış yayın fonksiyonu mevcut');

select is(
  (
    select prosecdef
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'publish_due_articles'
  ),
  true,
  'terfi fonksiyonu security definer çalışır, RLS çağırana bağlı kalmaz'
);

select ok(
  (
    select proconfig
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname = 'publish_due_articles'
  ) @> array['search_path=""'],
  'terfi fonksiyonu boş search_path ile sabitlenmiş'
);

select ok(
  not has_function_privilege('anon', 'private.publish_due_articles()', 'execute'),
  'anon rolü terfi fonksiyonunu çalıştıramaz'
);
select ok(
  not has_function_privilege('authenticated', 'private.publish_due_articles()', 'execute'),
  'authenticated rolü terfi fonksiyonunu çalıştıramaz'
);
select ok(
  not has_function_privilege('service_role', 'private.publish_due_articles()', 'execute'),
  'service_role terfi fonksiyonunu çalıştıramaz'
);

select results_eq(
  $$ select schedule, active, command from cron.job where jobname = 'publish-due-articles' $$,
  $$ values ('* * * * *', true, 'select private.publish_due_articles();') $$,
  'terfi işi dakikada bir ve etkin olarak zamanlanmış'
);

select results_eq(
  $$ select count(*) from cron.job where jobname = 'purge-cron-history' and active $$,
  array[1::bigint],
  'cron geçmişini budayan iş de zamanlanmış — dakikalık iş tabloyu sınırsız şişirmemeli'
);

-- ---------------------------------------------------------------------------
-- Terfi davranışı
-- ---------------------------------------------------------------------------

insert into public.articles (slug, title, body_text, status, scheduled_at, published_at, archived_at)
values
  -- Vakti gelmiş: terfi etmeli.
  ('zamanlanmis-vakti-gelmis', 'Vakti gelmiş zamanlanmış haber', 'Gövde.',
   'SCHEDULED', now() - interval '1 minute', null, null),
  -- Vakti gelmemiş: dokunulmamalı.
  ('zamanlanmis-ileri-tarihli', 'İleri tarihli zamanlanmış haber', 'Gövde.',
   'SCHEDULED', now() + interval '1 hour', null, null),
  -- Zamanı geçmiş ama zamanlanmamış: durum süzgeci tutmalı.
  ('taslak-gecmis-tarihli', 'Tarihi geçmiş taslak', 'Gövde.',
   'DRAFT', now() - interval '1 minute', null, null),
  -- Bir kez yayımlanıp arşivlenmiş, yeniden zamanlanmış: ilk yayın tarihi korunmalı.
  ('arsivden-yeniden-zamanlanmis', 'Arşivden dönen haber', 'Gövde.',
   'SCHEDULED', now() - interval '1 minute',
   timestamptz '2026-01-15 09:00:00+03', now() - interval '2 days');

select is(
  private.publish_due_articles(),
  2,
  'yalnızca vakti gelmiş iki zamanlanmış haber terfi eder'
);

select results_eq(
  $$ select status, scheduled_at, archived_at
     from public.articles where slug = 'zamanlanmis-vakti-gelmis' $$,
  $$ values ('PUBLISHED'::public.article_status, null::timestamptz, null::timestamptz) $$,
  'terfi eden haber PUBLISHED olur, zamanlama alanı boşalır'
);

select is(
  (select published_at from public.articles where slug = 'zamanlanmis-vakti-gelmis'),
  now() - interval '1 minute',
  'ilk kez yayımlanan haberin yayın tarihi zamanlanan andır, terfi anı değil'
);

select results_eq(
  $$ select status from public.articles where slug = 'zamanlanmis-ileri-tarihli' $$,
  $$ values ('SCHEDULED'::public.article_status) $$,
  'vakti gelmemiş haber zamanlanmış kalır'
);

select results_eq(
  $$ select status from public.articles where slug = 'taslak-gecmis-tarihli' $$,
  $$ values ('DRAFT'::public.article_status) $$,
  'zamanı geçmiş bir taslak yalnızca tarihi yüzünden yayımlanmaz'
);

select results_eq(
  $$ select status, published_at, archived_at
     from public.articles where slug = 'arsivden-yeniden-zamanlanmis' $$,
  $$ values (
       'PUBLISHED'::public.article_status,
       timestamptz '2026-01-15 09:00:00+03',
       null::timestamptz
     ) $$,
  'arşivden dönen haber ilk yayın tarihini korur ve arşiv damgası silinir'
);

select is(
  private.publish_due_articles(),
  0,
  'ikinci çağrı terfi edecek haber bulamaz'
);

-- ---------------------------------------------------------------------------
-- Terfinin denetim izi
-- ---------------------------------------------------------------------------

select results_eq(
  $$ select count(*) from public.audit_logs
     where action = 'article.publish_scheduled' and target_table = 'articles' $$,
  array[2::bigint],
  'her terfi için bir denetim kaydı düşer'
);

select results_eq(
  $$ select count(*) from public.audit_logs
     where action = 'article.publish_scheduled' and actor_id is not null $$,
  array[0::bigint],
  'terfiyi bir editör değil sistem yaptığı için actor_id boş kalır'
);

select results_eq(
  $$ select metadata ->> 'from', metadata ->> 'to', metadata ->> 'slug'
     from public.audit_logs as l
     join public.articles as a on a.id = l.target_id
     where l.action = 'article.publish_scheduled' and a.slug = 'zamanlanmis-vakti-gelmis' $$,
  $$ values ('SCHEDULED', 'PUBLISHED', 'zamanlanmis-vakti-gelmis') $$,
  'denetim kaydı geçişi ve adresi taşır'
);

-- Terfi edilen haber kamuya açık okuma politikasından geçmeli; aksi hâlde iş
-- çalışsa da haber sitede görünmez.
set local role anon;
select results_eq(
  $$ select count(*) from public.articles
     where slug in ('zamanlanmis-vakti-gelmis', 'arsivden-yeniden-zamanlanmis') $$,
  array[2::bigint],
  'terfi eden haberler anonim okuyucuya görünür'
);
select results_eq(
  $$ select count(*) from public.articles where slug = 'zamanlanmis-ileri-tarihli' $$,
  array[0::bigint],
  'ileri tarihli zamanlanmış haber anonim okuyucuya sızmaz'
);
reset role;

-- ---------------------------------------------------------------------------
-- `redirects` yazma yolu — adres değişiminde sunucu eyleminin kullandığı yol
-- ---------------------------------------------------------------------------

insert into auth.users (id, email)
values ('00000000-0000-0000-0000-000000000201', 'faz6-editor@example.test');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated","app_metadata":{"role":"EDITOR"}}',
  true
);
select lives_ok(
  $$ insert into public.redirects (from_path, to_path, status_code)
     values ('/haber/eski-adres', '/haber/yeni-adres', 308) $$,
  'editör adres değişimi için yönlendirme yazabilir'
);
reset role;

set local role anon;
select results_eq(
  $$ select to_path, status_code from public.redirects where from_path = '/haber/eski-adres' $$,
  $$ values ('/haber/yeni-adres', 308::smallint) $$,
  'yönlendirme anonim okuyucuya görünür — çerezsiz istemci onu okuyor'
);
select throws_like(
  $$ insert into public.redirects (from_path, to_path)
     values ('/haber/sahte', '/kotu-hedef') $$,
  '%permission denied%',
  'anonim ziyaretçi yönlendirme yazamaz'
);
reset role;

-- ---------------------------------------------------------------------------
-- `audit_logs` yazma yolu — yalnızca secret key
-- ---------------------------------------------------------------------------

set local role service_role;
select lives_ok(
  $$ insert into public.audit_logs (actor_id, action, target_table, target_id)
     values (null, 'article.update', 'articles', null) $$,
  'sunucudaki secret key denetim kaydı yazabilir'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000201","role":"authenticated","app_metadata":{"role":"EDITOR"}}',
  true
);
select throws_like(
  $$ insert into public.audit_logs (action, target_table) values ('sahte', 'articles') $$,
  '%permission denied%',
  'editör kendi denetim kaydını yazamaz'
);
reset role;

select * from finish();
rollback;

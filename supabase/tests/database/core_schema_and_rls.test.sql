begin;

create extension if not exists pgtap with schema extensions;
select plan(28);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'articles', 'articles table exists');
select has_table('public', 'bookmarks', 'bookmarks table exists');
select has_index('public', 'articles', 'articles_search_vector_idx', 'article search has a GIN index');
select has_table('public', 'newsletter_subscriptions', 'newsletter_subscriptions table exists');
select has_table('public', 'account_deletion_requests', 'account_deletion_requests table exists');
select has_index(
  'public', 'newsletter_subscriptions', 'newsletter_subscriptions_confirmation_digest_idx',
  'newsletter confirmation digests are uniquely indexed for lookup'
);
select has_index(
  'public', 'newsletter_subscriptions', 'newsletter_subscriptions_unsubscribe_digest_idx',
  'newsletter unsubscribe digests are uniquely indexed for lookup'
);
select has_index(
  'public', 'account_deletion_requests', 'account_deletion_requests_open_idx',
  'a reader can only have one open deletion request'
);
select results_eq(
  $$ select count(*) from storage.buckets where id = 'news-media' and public and file_size_limit = 10485760 $$,
  array[1::bigint],
  'news-media is a public 10 MB bucket'
);
select results_eq(
  $$ select count(*) from storage.buckets where id = 'news-media' and allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[] $$,
  array[1::bigint],
  'news-media accepts only configured image MIME types'
);

select results_eq(
  $$ select count(*) from public.topics where slug in ('gundem', 'ekonomi', 'kultur-sanat', 'yasam') $$,
  array[4::bigint],
  'repeatable seed contains the initial topics'
);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000101', 'reader@example.test'),
  ('00000000-0000-0000-0000-000000000102', 'other-reader@example.test'),
  ('00000000-0000-0000-0000-000000000103', 'editor@example.test');

insert into public.articles (status, title, slug, body_text, published_at)
values
  ('PUBLISHED', 'Zeytin üreticileri yeni hasada hazırlanıyor', 'zeytin-hasadi-test', 'Zeytin üreticileri yeni hasada hazırlanıyor.', now()),
  ('DRAFT', 'Taslak haber', 'taslak-haber-test', 'Taslak içerik.', null);

insert into public.bookmarks (profile_id, article_id)
select
  '00000000-0000-0000-0000-000000000101',
  id
from public.articles
where slug = 'zeytin-hasadi-test';

select results_eq(
  $$ select count(*) from public.articles where slug = 'zeytin-hasadi-test' and search_vector @@ plainto_tsquery('turkish', 'zeytin') $$,
  array[1::bigint],
  'Turkish full-text search indexes normalized article text'
);

set local role anon;
select results_eq(
  $$ select count(*) from public.articles where slug in ('zeytin-hasadi-test', 'taslak-haber-test') $$,
  array[1::bigint],
  'anonymous users can see only currently published articles'
);
select throws_like(
  $$ select count(*) from public.bookmarks $$,
  '%permission denied%',
  'anonymous users have no Data API grant for bookmarks'
);
select throws_like(
  $$ select count(*) from public.newsletter_subscriptions $$,
  '%permission denied%',
  'anonymous users have no Data API grant for newsletter subscriptions'
);
select throws_like(
  $$ insert into public.newsletter_subscriptions (email) values ('sizinti@example.com') $$,
  '%permission denied%',
  'anonymous users cannot write newsletter subscriptions directly'
);
select throws_like(
  $$ select count(*) from public.account_deletion_requests $$,
  '%permission denied%',
  'anonymous users have no Data API grant for account deletion requests'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000101","role":"authenticated","app_metadata":{"role":"READER"}}',
  true
);
select results_eq(
  $$ select count(*) from public.bookmarks $$,
  array[1::bigint],
  'a reader can see only their own bookmark'
);
select results_eq(
  $$ select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000102' $$,
  array[0::bigint],
  'a reader cannot see another profile'
);
select results_eq(
  $$ update public.profiles set display_name = 'Yetkisiz' where id = '00000000-0000-0000-0000-000000000102' returning 1 $$,
  array[]::integer[],
  'a reader cannot update another profile'
);
select throws_like(
  $$ select count(*) from public.newsletter_subscriptions $$,
  '%permission denied%',
  'a reader has no Data API grant for newsletter subscriptions'
);
select throws_like(
  $$ select count(*) from public.account_deletion_requests $$,
  '%permission denied%',
  'a reader has no Data API grant for account deletion requests'
);
reset role;

-- İkinci okur: kaydedilenler yalnızca sahibine görünür ve yalnızca sahibi silebilir.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000102","role":"authenticated","app_metadata":{"role":"READER"}}',
  true
);
select results_eq(
  $$ select count(*) from public.bookmarks $$,
  array[0::bigint],
  'a reader cannot see another reader''s bookmark'
);
select results_eq(
  $$ delete from public.bookmarks
     where profile_id = '00000000-0000-0000-0000-000000000101' returning 1 $$,
  array[]::integer[],
  'a reader cannot delete another reader''s bookmark'
);
select throws_like(
  $$ insert into public.bookmarks (profile_id, article_id)
     select '00000000-0000-0000-0000-000000000101', id
     from public.articles where slug = 'zeytin-hasadi-test' $$,
  '%row-level security%',
  'a reader cannot create a bookmark owned by someone else'
);
reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000103","role":"authenticated","app_metadata":{"role":"EDITOR"}}',
  true
);
select lives_ok(
  $$ insert into public.topics (name, slug) values ('Test Editoryal', 'test-editoryal') $$,
  'an editor can manage editorial reference data'
);
select throws_like(
  $$ select count(*) from public.audit_logs $$,
  '%permission denied%',
  'an editor has no Data API grant for sensitive audit records'
);
reset role;

select * from finish();
rollback;

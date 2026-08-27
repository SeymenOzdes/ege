alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.topics, public.locations, public.authors, public.media_assets,
  public.articles, public.ad_placements, public.redirects to anon;

grant select on table public.profiles, public.topics, public.locations, public.authors,
  public.media_assets, public.articles, public.article_revisions, public.bookmarks,
  public.ad_placements, public.redirects to authenticated;
grant insert, update, delete on table public.topics, public.locations, public.authors,
  public.media_assets, public.articles, public.ad_placements, public.redirects to authenticated;
grant insert on table public.article_revisions, public.bookmarks to authenticated;
grant update on table public.profiles to authenticated;
grant delete on table public.bookmarks to authenticated;

grant select, insert, update, delete on all tables in schema public to service_role;

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.locations enable row level security;
alter table public.authors enable row level security;
alter table public.media_assets enable row level security;
alter table public.articles enable row level security;
alter table public.article_revisions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.ad_placements enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy topics_public_select
on public.topics
for select
to anon, authenticated
using (true);

create policy topics_staff_manage
on public.topics
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy locations_public_select
on public.locations
for select
to anon, authenticated
using (true);

create policy locations_staff_manage
on public.locations
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy authors_public_select
on public.authors
for select
to anon, authenticated
using (true);

create policy authors_staff_manage
on public.authors
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy media_assets_public_select
on public.media_assets
for select
to anon, authenticated
using (true);

create policy media_assets_staff_manage
on public.media_assets
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy articles_public_select
on public.articles
for select
to anon, authenticated
using (
  status = 'PUBLISHED'
  and published_at is not null
  and published_at <= now()
  and archived_at is null
);

create policy articles_staff_manage
on public.articles
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy article_revisions_staff_select
on public.article_revisions
for select
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy article_revisions_staff_insert
on public.article_revisions
for insert
to authenticated
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN')
  and created_by = (select auth.uid())
);

create policy bookmarks_select_own
on public.bookmarks
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy bookmarks_insert_own
on public.bookmarks
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy bookmarks_delete_own
on public.bookmarks
for delete
to authenticated
using (profile_id = (select auth.uid()));

create policy ad_placements_public_select
on public.ad_placements
for select
to anon, authenticated
using (
  is_active
  and starts_at <= now()
  and (ends_at is null or ends_at > now())
);

create policy ad_placements_staff_manage
on public.ad_placements
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

create policy redirects_public_select
on public.redirects
for select
to anon, authenticated
using (true);

create policy redirects_staff_manage
on public.redirects
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'))
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('EDITOR', 'ADMIN'));

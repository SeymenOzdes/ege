create schema if not exists private;

create type public.article_status as enum ('DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');
create type public.article_type as enum ('NEWS', 'OPINION', 'INTERVIEW', 'PHOTO_STORY');
create type public.user_role as enum ('ADMIN', 'EDITOR', 'READER');
create type public.ad_placement_key as enum ('HOME_LEADER', 'HOME_INLINE', 'ARTICLE_MID', 'ARTICLE_END');
create type public.notification_type as enum ('BREAKING_NEWS');
create type public.newsletter_subscription_status as enum ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 120)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_slug_key unique (slug),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  province_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_slug_key unique (slug),
  constraint locations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint locations_province_code_length check (province_code is null or char_length(province_code) = 2)
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  slug text not null,
  role_label text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authors_slug_key unique (slug),
  constraint authors_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'news-media',
  object_path text not null,
  mime_type text not null,
  byte_size bigint not null,
  alt_text text not null,
  caption text,
  credit text,
  width integer,
  height integer,
  focal_point_x numeric(4, 3),
  focal_point_y numeric(4, 3),
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_bucket_path_key unique (bucket_id, object_path),
  constraint media_assets_byte_size_positive check (byte_size > 0),
  constraint media_assets_dimensions_positive check (
    (width is null and height is null)
    or (width > 0 and height > 0)
  ),
  constraint media_assets_focal_point_x_range check (focal_point_x is null or focal_point_x between 0 and 1),
  constraint media_assets_focal_point_y_range check (focal_point_y is null or focal_point_y between 0 and 1)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  status public.article_status not null default 'DRAFT',
  article_type public.article_type not null default 'NEWS',
  title text not null,
  slug text not null,
  summary text,
  body jsonb not null default '[]'::jsonb,
  body_text text not null default '',
  search_vector tsvector generated always as (
    to_tsvector(
      'turkish',
      coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(body_text, '')
    )
  ) stored,
  author_id uuid references public.authors (id) on delete set null,
  topic_id uuid references public.topics (id) on delete set null,
  location_id uuid references public.locations (id) on delete set null,
  hero_media_id uuid references public.media_assets (id) on delete set null,
  social_media_id uuid references public.media_assets (id) on delete set null,
  seo_title text,
  seo_description text,
  is_breaking boolean not null default false,
  breaking_expires_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_slug_key unique (slug),
  constraint articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint articles_body_is_array check (jsonb_typeof(body) = 'array'),
  constraint articles_breaking_expiry check (
    breaking_expires_at is null or is_breaking = true
  )
);

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  revision_number integer not null,
  snapshot jsonb not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint article_revisions_article_number_key unique (article_id, revision_number),
  constraint article_revisions_snapshot_object check (jsonb_typeof(snapshot) = 'object')
);

create table public.bookmarks (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, article_id)
);

create table public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  email text not null,
  email_normalized text generated always as (lower(btrim(email))) stored,
  status public.newsletter_subscription_status not null default 'PENDING',
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  confirmation_token_digest text,
  unsubscribe_token_digest text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscriptions_email_key unique (email_normalized),
  constraint newsletter_subscriptions_email_format check (email_normalized ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$')
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  user_agent text,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_key unique (endpoint)
);

create table public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  placement_key public.ad_placement_key not null,
  sponsor text not null,
  destination_url text not null,
  desktop_media_id uuid references public.media_assets (id) on delete set null,
  mobile_media_id uuid references public.media_assets (id) on delete set null,
  topic_id uuid references public.topics (id) on delete set null,
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ad_placements_destination_url_format check (destination_url ~ '^https?://'),
  constraint ad_placements_active_range check (ends_at is null or ends_at > starts_at)
);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text not null,
  to_path text not null,
  target_article_id uuid references public.articles (id) on delete set null,
  status_code smallint not null default 308,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint redirects_from_path_key unique (from_path),
  constraint redirects_from_path_format check (from_path ~ '^/'),
  constraint redirects_to_path_format check (to_path ~ '^/'),
  constraint redirects_status_code check (status_code in (301, 302, 307, 308))
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index authors_profile_id_idx on public.authors (profile_id);
create index media_assets_uploaded_by_idx on public.media_assets (uploaded_by);
create index articles_author_id_idx on public.articles (author_id);
create index articles_topic_id_idx on public.articles (topic_id);
create index articles_location_id_idx on public.articles (location_id);
create index articles_hero_media_id_idx on public.articles (hero_media_id);
create index articles_social_media_id_idx on public.articles (social_media_id);
create index articles_created_by_idx on public.articles (created_by);
create index articles_updated_by_idx on public.articles (updated_by);
create index articles_publication_idx on public.articles (published_at desc) where status = 'PUBLISHED';
create index articles_topic_publication_idx on public.articles (topic_id, published_at desc) where status = 'PUBLISHED';
create index articles_location_publication_idx on public.articles (location_id, published_at desc) where status = 'PUBLISHED';
create index articles_author_publication_idx on public.articles (author_id, published_at desc) where status = 'PUBLISHED';
create index articles_scheduled_at_idx on public.articles (scheduled_at) where status = 'SCHEDULED';
create index articles_search_vector_idx on public.articles using gin (search_vector);
create index article_revisions_article_id_idx on public.article_revisions (article_id);
create index article_revisions_created_by_idx on public.article_revisions (created_by);
create index bookmarks_article_id_idx on public.bookmarks (article_id);
create index newsletter_subscriptions_profile_id_idx on public.newsletter_subscriptions (profile_id);
create index push_subscriptions_profile_id_idx on public.push_subscriptions (profile_id);
create index ad_placements_desktop_media_id_idx on public.ad_placements (desktop_media_id);
create index ad_placements_mobile_media_id_idx on public.ad_placements (mobile_media_id);
create index ad_placements_topic_id_idx on public.ad_placements (topic_id);
create index ad_placements_active_window_idx on public.ad_placements (placement_key, starts_at, ends_at) where is_active;
create index redirects_target_article_id_idx on public.redirects (target_article_id);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index audit_logs_target_idx on public.audit_logs (target_table, target_id, created_at desc);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger topics_set_updated_at before update on public.topics
for each row execute function private.set_updated_at();
create trigger locations_set_updated_at before update on public.locations
for each row execute function private.set_updated_at();
create trigger authors_set_updated_at before update on public.authors
for each row execute function private.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function private.set_updated_at();
create trigger articles_set_updated_at before update on public.articles
for each row execute function private.set_updated_at();
create trigger newsletter_subscriptions_set_updated_at before update on public.newsletter_subscriptions
for each row execute function private.set_updated_at();
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions
for each row execute function private.set_updated_at();
create trigger ad_placements_set_updated_at before update on public.ad_placements
for each row execute function private.set_updated_at();
create trigger redirects_set_updated_at before update on public.redirects
for each row execute function private.set_updated_at();
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

revoke all on schema private from public, anon, authenticated, service_role;
revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;
revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;

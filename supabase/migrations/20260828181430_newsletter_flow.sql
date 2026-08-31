-- Modül 4'teki e-posta biçim kısıtı hiçbir geçerli adresi kabul etmiyordu.
-- Desen `\\.` ile yazılmıştı; standard_conforming_strings açıkken bu, SQL
-- dizesinde iki karakter (`\` + `\`) üretir ve regex bunu "kaçırılmış ters bölü,
-- ardından herhangi bir karakter" diye okur. Yani alan adında gerçek bir ters
-- bölü aranıyordu: 'okur@example.com' kısıtı geçemiyordu ve tabloya hiçbir satır
-- yazılamıyordu. Tek ters bölü ile nokta yeniden gerçek nokta hâline gelir.
alter table public.newsletter_subscriptions
  drop constraint newsletter_subscriptions_email_format;

alter table public.newsletter_subscriptions
  add constraint newsletter_subscriptions_email_format
  check (email_normalized ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

-- Bülten onay ve ayrılma bağlantıları jetonun kendisini değil, SHA-256 özetini
-- saklar. Arama bu özet üzerinden yapıldığı için tekil indeks hem hızı hem de
-- iki aboneliğin aynı özeti taşıyamamasını garanti eder.
create unique index newsletter_subscriptions_confirmation_digest_idx
  on public.newsletter_subscriptions (confirmation_token_digest)
  where confirmation_token_digest is not null;

create unique index newsletter_subscriptions_unsubscribe_digest_idx
  on public.newsletter_subscriptions (unsubscribe_token_digest)
  where unsubscribe_token_digest is not null;

-- Yönetimdeki abone listesi duruma göre filtrelenir ve en yeni kayıttan başlar.
create index newsletter_subscriptions_status_created_at_idx
  on public.newsletter_subscriptions (status, created_at desc);

-- Tablo Modül 5'te RLS ile kapatıldı ve bilerek politikasız bırakıldı
-- (docs/modules/05-authentication-and-rls.md: "Kapalı; güvenilen sunucu işlemi").
-- Modül 4'teki toplu service_role grant'i yalnızca o an var olan tabloları
-- kapsadığından burada bir şey eklemek gerekmez; grant zaten mevcut. Yine de
-- anon/authenticated için hiçbir grant verilmez: tüm okuma ve yazma secret key ile yapılır.

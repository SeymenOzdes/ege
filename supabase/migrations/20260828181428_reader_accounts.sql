-- Okur hesabı silme talepleri. Silme işlemi otomatik değildir: talep kaydedilir,
-- personel doğrulayıp elle uygular. Böylece geri alınamaz bir işlem tek tıkla
-- tetiklenmez ve KVKK talebi izlenebilir bir kayıt bırakır.
create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  -- Talep anındaki e-posta. `auth.users` içinde de bulunur; personelin talebi
  -- Studio'ya girmeden eşleştirebilmesi için burada kopyalanır.
  email text,
  requested_at timestamptz not null default now(),
  handled_at timestamptz,
  note text,
  constraint account_deletion_requests_note_length check (note is null or char_length(note) <= 1000)
);

-- Okur başına tek açık talep: ikinci gönderim kuyruk oluşturmaz, sessizce yutulur.
create unique index account_deletion_requests_open_idx
  on public.account_deletion_requests (profile_id)
  where handled_at is null;

-- Personel listesi en yeni talepten başlar.
create index account_deletion_requests_requested_at_idx
  on public.account_deletion_requests (requested_at desc);

alter table public.account_deletion_requests enable row level security;

-- `search_queries` ve `audit_logs` ile aynı kapalı model: politika yok,
-- anon/authenticated grant'i yok. Yalnızca sunucu tarafındaki secret key ile yazılır.
grant select, insert, update on table public.account_deletion_requests to service_role;

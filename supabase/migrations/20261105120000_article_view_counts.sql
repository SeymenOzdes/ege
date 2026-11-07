-- Okunma sayacı: ana sayfadaki "En Çok Okunanlar" sıralaması gerçek
-- görüntülenmelere dayanır.
--
-- Sayaç, haber sayfası açıldığında istemciden gelen hafif bir istekle
-- (`POST /api/goruntuleme`) artırılır. `record_article_view` `security definer`
-- çalışır çünkü anonim okuyucunun `articles` tablosunda UPDATE yetkisi yok;
-- yayın koşulları bu yüzden fonksiyonun WHERE cümlesinde ayrıca tekrarlanır ve
-- taslak, ileri tarihli ya da arşivlenmiş hiçbir haber sayılmaz.
alter table public.articles
  add column if not exists view_count bigint not null default 0;

-- Sıralama sorgusu her ana sayfa üretiminde dokuz satır ister; yayımlanmış
-- haberler için kısmi indeks bu okumayı sıralı indeksten karşılar.
create index if not exists articles_view_count_idx
  on public.articles (view_count desc, published_at desc)
  where status = 'PUBLISHED' and archived_at is null;

create or replace function public.record_article_view(p_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.articles
  set view_count = view_count + 1
  where slug = p_slug
    and status = 'PUBLISHED'
    and published_at is not null
    and published_at <= now()
    and archived_at is null;
$$;

revoke all on function public.record_article_view(text) from public;
grant execute on function public.record_article_view(text) to anon, authenticated;

-- `articles_set_updated_at` her UPDATE'te `updated_at`i tazeliyor. Sayaç
-- artışı bir içerik değişikliği değil: yalnızca `view_count` değiştiyse
-- "son güncelleme" tarihi yerinde kalmalı, yoksa her okuma haberi yeni
-- düzenlenmiş gibi gösterir (JSON-LD `dateModified` dahil).
--
-- `search_vector` üretilmiş bir sütun ve BEFORE trigger içinde henüz boş
-- geliyor; karşılaştırmadan çıkarılmazsa her artış "içerik değişti" sanılır.
create or replace function private.set_article_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.view_count is distinct from old.view_count
    and (to_jsonb(new) - 'view_count' - 'updated_at' - 'search_vector')
      = (to_jsonb(old) - 'view_count' - 'updated_at' - 'search_vector')
  then
    return new;
  end if;

  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_article_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
for each row execute function private.set_article_updated_at();

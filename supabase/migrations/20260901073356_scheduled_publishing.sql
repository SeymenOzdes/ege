-- Zamanlanmış yayın. `SCHEDULED` bir haberi yayına almak için uygulamanın ayakta
-- olması gerekmesin: terfi veritabanında olur, uygulama yalnızca yeniden doğrulama
-- penceresini bekler (`/` ve `/son-dakika` 60 sn). Webhook yok, kuyruk yok.
create extension if not exists pg_cron;

-- Vakti gelmiş haberleri yayına alır ve kaç tane aldığını döndürür.
--
-- `security definer`: iş, `articles` üzerindeki RLS'ten bağımsız çalışmalı —
-- `articles_staff_manage` bir JWT rolü arıyor, cron işinin JWT'si yok.
-- `private.handle_new_user` ile aynı kalıp: `private` şemasında, boş search_path
-- ile ve tüm istemci rollerinden geri alınmış.
--
-- `published_at` yeniden yazılmıyor, `coalesce` ediliyor: bir kez yayımlanmış
-- haber arşivlenip yeniden zamanlanırsa ilk yayın tarihini korur. Bu, sunucu
-- eylemindeki `toStatusColumns()` kuralının aynısı (`src/lib/admin/article-actions.ts`).
create function private.publish_due_articles()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  promoted_count integer;
begin
  with due as (
    update public.articles
    set
      status = 'PUBLISHED',
      published_at = coalesce(published_at, scheduled_at),
      scheduled_at = null,
      archived_at = null
    where status = 'SCHEDULED'
      and scheduled_at is not null
      and scheduled_at <= now()
    returning id, slug, published_at
  ),
  -- Elle yapılan geçiş `article.transition` yazıyor; bunun ayrı bir eylem adı
  -- taşıması gerekiyor, çünkü `actor_id` boş: kaydı bir editör değil sistem düştü.
  logged as (
    insert into public.audit_logs (actor_id, action, target_table, target_id, metadata)
    select
      null,
      'article.publish_scheduled',
      'articles',
      due.id,
      jsonb_build_object(
        'from', 'SCHEDULED',
        'to', 'PUBLISHED',
        'slug', due.slug,
        'published_at', due.published_at
      )
    from due
    returning 1
  )
  select count(*) into promoted_count from logged;

  return promoted_count;
end;
$$;

revoke all on function private.publish_due_articles() from public, anon, authenticated, service_role;

-- Dakikada bir. `articles_scheduled_at_idx` kısmi indeksi bu sorgunun tam
-- karşılığı, dolayısıyla vakti gelmiş haber yokken iş neredeyse bedava.
-- `cron.schedule` iş adına göre upsert yapar: migration yeniden uygulanırsa
-- ikinci bir iş oluşmaz.
select cron.schedule(
  'publish-due-articles',
  '* * * * *',
  $job$select private.publish_due_articles();$job$
);

-- Dakikada bir çalışan bir iş `cron.job_run_details`'e yılda ~525 bin satır yazar
-- ve pg_cron bu tabloyu kendiliğinden budamaz. Geçmiş bir hata ayıklama kaydıdır,
-- kalıcı bir kayıt değil: bir hafta yeterli.
select cron.schedule(
  'purge-cron-history',
  '17 3 * * *',
  $job$delete from cron.job_run_details where end_time < now() - interval '7 days'$job$
);

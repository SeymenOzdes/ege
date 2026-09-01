# Launch hazırlığı — oturum durumu

- **Tarih:** 2026-09-01
- **Dal:** `launch-hazirligi` (`main`'den ayrıldı, `main` bu oturumda `78a91e1`'e ilerletildi)
- **Kapsam:** `docs/launch-readiness.md`'de açık kalan altı iş kaleminden ikisi tamamlandı.

Bu belge, planın hangi bölümünün bittiğini ve kalanların hangi zeminden devam edeceğini
kaydeder. Planın tamamı `~/.claude/plans/you-can-continue-misty-tome.md` içinde.

## Depo durumu

`main` bu oturumdan önce `2c7e948`'deydi ve Supabase bağlantısı yapılmış
`kamuya-acik-sayfalari-supabaseye-bagla` dalı birleştirilmemiş bekliyordu. Çalışma
ağacı ise `login` dalındaydı ve üzerinde commit edilmemiş Google OAuth işi vardı.

Yapılanlar:

1. `login` dalının commit edilmemiş işi **stash'e alındı** — kaybolmadı:

   ```
   git checkout login && git stash list && git stash pop
   ```

   Stash başlığı: `On login: login dali: Google OAuth WIP (plan Faz 0)`.
   İçindekiler: `src/app/(site)/giris/page.tsx`, `src/app/auth/confirm/route.ts`,
   `src/lib/auth/actions.ts`, `src/lib/auth/redirect.ts`, `src/lib/auth/redirect.test.ts`,
   `supabase/config.toml`, `src/app/auth/callback/route.ts`,
   `src/lib/auth/pending-bookmark.ts`, `docs/google-login-setup.md`.

2. `kamuya-acik-sayfalari-supabaseye-bagla` → `main` (fast-forward, `78a91e1`).
3. `main`'den `launch-hazirligi` dalı açıldı; bu oturumun iki commit'i orada.

> **Dikkat:** `login` stash'i geri alınıp birleştirildiğinde `src/lib/auth/actions.ts` ve
> `giris/page.tsx` üzerinde çakışma beklenir — bu oturum `actions.ts`'e dokunmadı ama
> `server.ts` ve yeni `session.ts` aynı bölgeyi okuyor.

## Biten: Faz 1 — Haber görselleri (`bf83537`)

`launch-readiness.md` P1 #9 kapandı.

- `src/lib/media.ts`: saf `getMediaPublicUrl()` ve `getObjectPosition()`. Bucket public
  olduğu için adres yalnızca `object_path`'ten türüyor; `supabase.storage.getPublicUrl()`
  bir istemci örneği ister ve bu yardımcıya `"use client"` karusel üzerinden ulaşılıyor.
- `ARTICLE_PREVIEW_SELECTION` ve `ARTICLE_DETAIL_SELECTION` hero embed'i alıyor.
  Foreign key **açıkça adlandırıldı** (`media_assets!articles_hero_media_id_fkey`):
  `articles` tablosu `media_assets`'e hem `hero_media_id` hem `social_media_id`
  üzerinden bağlı ve PostgREST belirsiz embed'i reddediyor.
- `ArticlePreview.hero?: ArticleImage` eklendi; `mediaTone` yerinde kaldı ve görseli
  olmayan haber için yedek olmayı sürdürüyor.
- `MediaSurface` hero varsa `next/image`, yoksa eski renk yüzeyini çiziyor. Karuselin
  etkin slaytı `priority` alıyor (LCP).
- `next.config.ts`: `images.remotePatterns` `NEXT_PUBLIC_SUPABASE_URL`'den türetiliyor,
  yalnız `/storage/v1/object/public/news-media/**` yoluna ve sorgusuz adrese daraltılmış.
  Değişken tanımsızsa desen üretilmiyor, yapılandırmasız derleme çalışıyor.
- Testler: `media.test.ts` (public URL, odak noktası, sınırlama), `article-preview.test.ts`
  (hero eşleme, boyutsuz varlık). `vitest.config.mts` artık `NEXT_PUBLIC_SUPABASE_URL`'i
  sabitliyor; publishable key hâlâ tanımsız, yani `hasSupabasePublicConfig()` false kalıyor
  ve adaptörler çevrimdışı yollarında test edilmeye devam ediyor.

**Doğrulanmadı:** Seed verisinde hiçbir makalede `hero_media_id` dolu değil, dolayısıyla
gerçek bir hero görselinin uçtan uca çizildiği görülmedi. Faz 5'teki hero seçici
geldiğinde ilk sınanacak şey bu.

## Biten: Faz 2 — ISR (`81e2312`)

`launch-readiness.md` P1 #10 kapandı.

Layout'taki `force-dynamic` bayrağını kaldırmak tek başına yetmedi. Sırayla kaldırılan
istek zamanlı okumalar:

1. **Başlıktaki hesap durumu.** `useCurrentUser` (`src/lib/auth/use-current-user.ts`)
   oturumu tarayıcıda çözüyor. `UserMenu` prop alan saf bileşen olarak kaldı — birim
   testleri değişmedi; oturum çözümü `AccountMenu` / `MobileAccountLinks`'e
   (`src/components/site/account-menu.tsx`) taşındı. `CurrentUser` tipi ve claims
   eşlemesi `server-only` olmayan `src/lib/auth/session.ts`'e alındı, böylece sunucu ve
   tarayıcı yolları aynı şekli üretiyor.
2. **Kaydet düğmesi.** `ArticleActions` kendi durumunu çözüyor; `isArticleBookmarked`
   `bookmarks/queries.ts`'ten kaldırıldı.
3. **`?bilgi=` bildirimi.** `BookmarkNotice` içinde `useSearchParams` ile, Suspense
   sınırında.
4. **Asıl engel:** kamuya açık okuma yolları çerez taşıyan istemciyi kullanıyordu ve tek
   başına bu bile rotayı dinamik yapıyordu. `homepage-content.ts`, `archives.ts` ve
   `articles.ts` artık yeni `src/lib/supabase/anon.ts`'teki `createAnonClient()` ile
   okuyor. Yan fayda: oturum açmış bir editör artık kamuya açık sayfada taslağı
   göremiyor — `articles_staff_manage` devreye girmiyor. Önbelleğe alınan bir sayfa kimin
   istediğine göre değişmemeli.

`pnpm build` çıktısı:

| Rota | Durum |
| --- | --- |
| `/` | ○ static, 1 dk revalidate |
| `/haber/[slug]` | ● SSG, son 100 slug önden üretiliyor, 5 dk revalidate |
| `/kategori/[slug]`, `/yazar/[slug]`, `/son-dakika` | ƒ dinamik |
| `/arama`, `/kaydedilenler`, `/giris`, `/bulten`, `/yonetim/*` | ƒ dinamik (doğru) |

### Plandan sapma: arşivler dinamik kaldı

Plan bu üç arşiv rotasına `revalidate = 300` öngörüyordu. Uygulanmadı: üçü de sayfalama
için `?sayfa=` okuyor ve arama parametresi okuyan bir rota Next'te istek zamanlıdır —
`revalidate` yazmak çıktıyı değiştirmez, yalnız yanıltır. Rotalara bunu açıklayan bir
yorum bırakıldı.

Önbelleğe almanın yolu sayfalamayı yol parçasına taşımak (`/son-dakika/sayfa/2`); bu bir
adres değişikliği ve ayrı bir iş. `cacheComponents` (PPR) de çözerdi ama tüm uygulamayı
route-segment config'den `use cache`'e taşımayı gerektirir.

## Yapılmadı

Plandaki dört faz açık; hiçbirine başlanmadı.

- **Faz 3 — Kurumsal sayfalar.** Yedi altbilgi bağlantısı hâlâ 404: `/kunye`,
  `/yayin-ilkeleri`, `/duzeltmeler`, `/iletisim`, `/gizlilik`, `/cerezler`,
  `/kullanim-kosullari`. Künye 5651 gereği, gizlilik ise bülten formunun rıza referansı
  için gerekli. Kararlaştırılan biçim: tam Türkçe metin + gerçek bilgiler için
  `[DOLDURULACAK: …]` yer tutucuları ve `docs/kurumsal-sayfa-bilgileri.md` kontrol listesi.
- **Faz 4 — SEO.** `sitemap.ts`, `robots.ts`, `feed.xml`, yönetim rotalarına `noindex`,
  site düzeyinde `WebSite`/`Organization` JSON-LD. Faz 2'de eklenen `createAnonClient()`
  bunların üçünün de ihtiyaç duyduğu çerezsiz okumayı zaten sağlıyor.
- **Faz 5 — Yönetimde haber CRUD.** En büyük iş. Karar verilen yaklaşım: bağımlılık
  eklemeden blok formu (paragraf / ara başlık / alıntı), `media/actions.ts` +
  `media-uploader.tsx` desenini birebir izleyerek. Şemadan çıkan iki tuzak not edildi:
  `article_revisions_staff_insert` `created_by = auth.uid()` şartı koşuyor, ve
  **`audit_logs` üzerinde RLS açık ama hiç politika ve `authenticated` grant'i yok** —
  oraya yazmak `createAdminClient()` gerektiriyor.
- **Faz 6 — Zamanlanmış yayın + belge temizliği.** `pg_cron` migration'ı,
  `SCHEDULED → PUBLISHED` terfisi, pgTAP kapsamı; `--font-inter` / `--font-newsreader`
  değişken adlarının düzeltilmesi; `launch-readiness.md`'nin yeniden tarihlenmesi.

## `launch-readiness.md` ile ilgili düzeltme

Rapordaki **#8 "Marka yazı tipleri hiç yüklenmiyor" maddesi zaten geçersizdi** ve bu
oturumda hiçbir iş gerektirmedi. `src/app/layout.tsx` Montserrat'ı `next/font/google` ile
`latin-ext` alt kümesiyle yüklüyor ve `globals.css` iki font değişkenini de ona
bağlıyor (`70eca49` commit'i). Kalan tek iş, `--font-inter` / `--font-newsreader`
adlarının artık yanıltıcı olması ve `docs/architecture.md`'nin hâlâ Newsreader + Inter
demesi — Faz 6'da.

Rapor 2026-08-31 tarihli bir anlık görüntü; P0 #1/#2 `78a91e1` ile, P1 #9/#10 bu oturumla
kapandı. Yeniden tarihlemek Faz 6'ya bırakıldı.

## Doğrulama durumu

| Komut | Sonuç |
| --- | --- |
| `pnpm typecheck` | ✅ Temiz |
| `pnpm lint` | ✅ Temiz |
| `pnpm test` | ✅ 18 dosyada 102 test geçti |
| `pnpm build` | ✅ Temiz — rota tablosu yukarıda |
| `pnpm test:e2e` | ⚠️ 51 geçti, 2 başarısız, 1 atlandı |
| `pnpm supabase:test` | Çalıştırılmadı |

Başarısız iki test `auth.spec.ts` → "anonim kullanıcı yönetim alanına giremez"
(chromium + mobile-chrome) ve **bu oturumun değişikliklerinden kaynaklanmıyor**:
`launch-readiness.md` bunları zaten kayıtlı başarısızlık olarak listeliyor. Sebep
ortamsal: `playwright.config.ts` sunucuyu kendi başlattığında `DEV_ADMIN_AUTO_LOGIN=false`
veriyor, ama `reuseExistingServer` açık ve zaten çalışan bir `next dev` süreci vardı;
o süreç `.env.local`'daki `DEV_ADMIN_AUTO_LOGIN=true` ile ayaktaydı, dolayısıyla
`/yonetim` ziyareti seed admin'iyle oturum açtı. Temiz doğrulama için önce çalışan dev
sunucusu kapatılmalı.

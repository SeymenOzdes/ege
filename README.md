# Ege'nin Nabzı

Ege Bölgesi odaklı, modern, yalın ve mobil öncelikli bölgesel haber platformu.

Bu depo, iki haftalık MVP geliştirme planının ilk yedi modülünü içerir. Şu anki sürüm; görsel sistem, Türkçe uygulama kabuğu, Supabase bağlantı temeli, çekirdek haber şeması, Magic Link kimlik doğrulaması, rol/RLS güvenliği, güvenli medya depolama, responsive yönetim kabuğu, kalite araçları ve teslim altyapısını kapsar. Makale editörü sonraki modülde eklenecektir.

## Gereksinimler

- Node.js 22 veya üzeri
- pnpm 11.19.0

## Başlangıç

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Komutlar

| Komut                | Açıklama                                       |
| -------------------- | ---------------------------------------------- |
| `pnpm dev`           | Yerel geliştirme sunucusunu başlatır.          |
| `pnpm build`         | Üretim derlemesi oluşturur.                    |
| `pnpm start`         | Üretim derlemesini çalıştırır.                 |
| `pnpm lint`          | Kod kurallarını denetler.                      |
| `pnpm typecheck`     | TypeScript kontrollerini çalıştırır.           |
| `pnpm test`          | Birim ve bileşen testlerini çalıştırır.        |
| `pnpm test:e2e`      | Playwright uçtan uca testlerini çalıştırır.    |
| `pnpm format:check`  | Biçimlendirmeyi doğrular.                      |
| `pnpm format`        | Kod biçimlendirmesini uygular.                 |
| `pnpm supabase:lint` | Yerel veritabanı fonksiyonlarını denetler.     |
| `pnpm supabase:test` | pgTAP veritabanı ve RLS testlerini çalıştırır. |

## Ortam Değişkenleri

Tüm yerel değişkenler `.env.local` içinde tutulur ve Git'e eklenmez. Başlangıç şablonu `.env.example` dosyasında yer alır.

| Değişken                | Amaç                      | Varsayılan              |
| ----------------------- | ------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`   | Uygulamanın mutlak adresi | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Yayın adı                 | `Ege'nin Nabzı`         |

Resend ve Sentry değişkenleri ilgili modüller uygulanana kadar tanımlanmaz. Supabase için URL ve publishable key, aşağıdaki yerel veya canlı ortam kurulumunda eklenir.

## Supabase geliştirme ortamı

Bu proje, ayrı geliştirme ve üretim Supabase projeleriyle çalışacak şekilde hazırlanmıştır. Geliştirme projesinin URL'sini ve publishable key değerini `.env.local` dosyasına; üretim değerlerini ise yalnızca Vercel'in üretim ortam değişkenlerine ekleyin. `SUPABASE_SECRET_KEY` hiçbir zaman istemciye gönderilmez.

Yerel veritabanı için Docker uyumlu bir çalışma zamanı gerekir. Ardından:

```bash
pnpm supabase:start
pnpm supabase:reset
```

Yeni bir şema değişikliğini yalnızca CLI ile başlatın; örneğin `pnpm supabase:migration:new create_articles`. Sonrasında yerel veritabanını sıfırlayın ve türleri yeniden üretin:

```bash
pnpm supabase:reset
pnpm supabase:types
```

`supabase/seed.sql` yalnızca geliştirme verisi içindir; üretime seed verisi göndermeyin.

## Yönetim paneli

`/yonetim`, yalnız `EDITOR` ve `ADMIN` rollerinin erişebildiği responsive bir editoryal kabuktur. Dashboard; taslak, inceleme, zamanlanmış ve yayımlanmış içerik sayılarını ve son yayımlanan haberleri RLS altında gösterir. Menü, yöneticiye özel yayın ayarlarını editörlerden gizler; doğrudan erişim de ayrıca sunucuda engellenir.

Masaüstünde sabit kenar menüsü, mobilde açılır menü bulunur. Bildirim yüzeyi, çıkış ve son-dakika işlemlerinde onay diyaloğu ile yeni haber/son dakika için hızlı erişim sağlanır. Haber düzenleme işlevleri Modül 8’de tamamlanacaktır.

## Medya depolama

`news-media` herkese açık teslim (görsel URL’si) için kullanılan bir Storage bucket’ıdır. Nesne listeleme ve yükleme yalnızca `EDITOR` veya `ADMIN` rolü için RLS ile korunur; güncelleme ve silme politikası yoktur. Bu nedenle görseller benzersiz UUID yollarında, `upsert: false` ile kalıcı olarak saklanır.

`/yonetim/medya` yetkili personelin JPEG, PNG, WebP veya AVIF görselleri (en fazla 10 MB) yüklemesini sağlar. Alt metin zorunludur; açıklama, kredi, boyutlar ve 0–1 arası odak noktası `media_assets` kaydında tutulur.

## Kimlik doğrulama ve yerel e-posta testi

`/giris` Magic Link ile parola gerektirmeyen okur girişi sunar. Yerel Supabase çalışırken e-postalar Mailpit tarafından yakalanır; giriş bağlantısını görmek için `http://127.0.0.1:54324` adresini açın.

Sürümlü yerel Auth şablonu `supabase/templates/magic_link.html` içindedir ve `supabase/config.toml` tarafından seçilir. Bu, token hash’ini sunucudaki `/auth/confirm` rotasında doğrular:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">Giriş yap</a>
```

Yerel doğrulama sırası:

```bash
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:types
pnpm supabase:lint
pnpm supabase:test
```

## Canlı ortam kontrol listesi

- Geliştirme ve üretim için ayrı Supabase projeleri kullanın; `NEXT_PUBLIC_SUPABASE_URL` ve publishable key değerlerini uygun ortama ekleyin.
- `SUPABASE_SECRET_KEY` yalnızca güvenilen sunucu ortamında tutulur; hiçbir zaman `NEXT_PUBLIC_` önekiyle tanımlanmaz.
- Supabase Auth URL ayarlarına üretim site URL’sini ve `/auth/confirm` dönüş adresini ekleyin.
- Magic Link şablonunu yukarıdaki token-hash akışına göre güncelleyin.
- Resend alan adını doğrulayıp Supabase Auth özel SMTP ayarlarında host, port, kullanıcı, parola, gönderen adresi ve gönderen adı değerlerini tanımlayın.
- İlk personel hesabına Dashboard veya server-only yönetim istemcisiyle `app_metadata.role = ADMIN` atayın; yeni rolün geçmesi için kullanıcının oturumunu yenilemesini isteyin.
- Canlıya çıkmadan önce Supabase güvenlik/performance advisor’larını ve gerçek alan adındaki e-posta bağlantısını doğrulayın.

## Teslimat

Vercel için `vercel.json` hazırdır. Depo GitHub'a bağlandıktan sonra `.github/workflows/ci.yml`, her gönderim ve çekme isteğinde tür denetimi, lint, birim testi ve üretim derlemesini çalıştırır.

Bu modül harici hesaplara bağlanmaz veya yayın yapmaz.

## Belgeler

- [Mimari](docs/architecture.md)
- [Karar kaydı](docs/decisions/001-project-foundation.md)
- [Geliştirme günlüğü](docs/development-log.md)
- [Modül 4 — Veritabanı temeli](docs/modules/04-database-foundation.md)
- [Modül 5 — Kimlik doğrulama ve RLS](docs/modules/05-authentication-and-rls.md)
- [Modül 6 — Güvenli medya depolama](docs/modules/06-secure-media-storage.md)
- [Modül 7 — Yönetim kabuğu](docs/modules/07-administration-shell.md)

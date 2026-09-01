# Mimari

## Uygulama sınırı

Ege'nin Nabzı tek bir Next.js App Router uygulamasıdır. Kamuya açık deneyim ve yönetim alanı aynı kod tabanında, ayrı rota gruplarıyla bulunur:

- `(site)`: Kamuya açık haber deneyimi.
- `(admin)`: `/yonetim` altında yönetim deneyimi.

Bu yapı, MVP boyunca tek dağıtım ve ortak tasarım sistemi sağlar. Yönetim rotaları, sunucuda Supabase kimlik doğrulaması ve rol denetimiyle korunur.

Yönetim layout’u, her istek için doğrulanmış rolü kontrol eder ve role göre yan menüyü oluşturur. Dashboard sorguları yalnızca bu layout’un altında, kullanıcı çerezleriyle oluşturulan Supabase istemcisi üzerinden yürür; bu nedenle mevcut RLS politikaları aynen uygulanır. Yöneticiye özel sayfalar, menüde gizlenmelerine ek olarak `ADMIN` rolünü sunucuda tekrar doğrular.

## Katmanlar

- `src/app`: Rotalar, düzenler ve sayfa düzeyi deneyimler.
- `src/lib`: Ortam doğrulama, yayın yapılandırması ve ileride veri/kimlik istemcileri.
- `src/lib/admin`: Dashboard veri adaptörü ve role göre yönetim navigasyonu.
- `src/components/admin`: Yönetim kabuğu, sayfa başlıkları, hızlı işlemler ve durum ekranları.
- `src/test`: Ortak test hazırlığı.
- `e2e`: Tarayıcı tabanlı kritik yol testleri.
- `docs`: Mimari, kararlar ve geliştirme kaydı.

## Supabase sınırı

Supabase; PostgreSQL, kimlik doğrulama ve medya depolama için kullanılır. İstemci kodu yalnızca publishable key kullanır; gizli anahtarlar yalnızca sunucu tarafında kalır. `public` şeması Data API’ye açık olduğundan tablolar minimum `GRANT` ve RLS politikalarıyla birlikte oluşturulur.

`news-media` public Storage bucket’ı, görselleri tam URL ile teslim eder; bu, Storage nesnelerini listeleme izni vermez. `storage.objects` üzerinde yalnız `EDITOR` ve `ADMIN` için `SELECT` ve `INSERT` politikaları vardır. İstemci yüklemesi MIME/10 MB sınırlarını hem arayüzde hem bucket yapılandırmasında uygular, benzersiz UUID yolu ve `upsert: false` ile nesneleri değişmez tutar. Yükleme sonrasında sunucu eylemi, doğrulanmış personel JWT’sinin `sub` değerini kullanarak erişilebilirlik ve telif metadatasını `media_assets` içinde kaydeder.

Kullanıcı oturumları `@supabase/ssr` çerezleriyle taşınır. Next.js 16 `proxy.ts`, `getClaims` çağrısıyla oturumu yeniler. Yönetim rotaları sunucuda tekrar rol denetimi yapar; Proxy tek başına yetkilendirme sınırı değildir. Güvenilen rol, yalnızca JWT içindeki `app_metadata.role` alanından okunur.

## Teslimat akışı

Yerelde pnpm kullanılır. GitHub Actions; tür denetimi, lint, birim testleri ve üretim derlemesini çalıştırır. Vercel, GitHub bağlantısı yapıldıktan sonra önizleme ve üretim dağıtımlarını sağlar.

## Tasarım temeli

Tasarım dili; Ege mürekkebi, sıcak kırık beyaz, deniz mavisi ve kontrollü hardal vurgusuna dayanır. Keskin kutular yerine yumuşak köşeler, boşluk, ince ayırıcılar ve tipografi tercih edilir.

Tek yazı tipi kullanılır: **Montserrat**, `next/font/google` ile `latin-ext` alt kümesiyle yüklenir (`src/app/layout.tsx`) ve `--font-montserrat` değişkenini tanımlar. `globals.css` bunun üzerine iki rol değişkeni kurar — `--font-body` arayüz metni, `--font-display` başlık ve editoryal metin için. İkisi de bugün aynı aileye çözülüyor; ayrı durmalarının sebebi, ikinci bir aile eklenmek istenirse tek noktadan değiştirilebilmesi.

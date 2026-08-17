# Mimari

## Uygulama sınırı

Ege'nin Nabzı tek bir Next.js App Router uygulamasıdır. Kamuya açık deneyim ve yönetim alanı aynı kod tabanında, ayrı rota gruplarıyla bulunur:

- `(site)`: Kamuya açık haber deneyimi.
- `(admin)`: `/yonetim` altında yönetim deneyimi.

Bu yapı, MVP boyunca tek dağıtım ve ortak tasarım sistemi sağlar. Yönetim rotaları ileriki modülde Supabase kimlik doğrulaması ve rol denetimiyle korunacaktır.

## Katmanlar

- `src/app`: Rotalar, düzenler ve sayfa düzeyi deneyimler.
- `src/lib`: Ortam doğrulama, yayın yapılandırması ve ileride veri/kimlik istemcileri.
- `src/test`: Ortak test hazırlığı.
- `e2e`: Tarayıcı tabanlı kritik yol testleri.
- `docs`: Mimari, kararlar ve geliştirme kaydı.

## Gelecekteki Supabase sınırı

Supabase; PostgreSQL, kimlik doğrulama ve medya depolama için Module 3'te eklenecektir. İstemci kodu yalnızca yayınlanabilir anahtarı kullanacak; gizli anahtarlar yalnızca sunucu tarafında kalacaktır. Veri erişiminde satır düzeyi güvenlik uygulanacak ve yönetim izinleri kullanıcı tarafından düzenlenebilir metaveriye dayandırılmayacaktır.

## Teslimat akışı

Yerelde pnpm kullanılır. GitHub Actions; tür denetimi, lint, birim testleri ve üretim derlemesini çalıştırır. Vercel, GitHub bağlantısı yapıldıktan sonra önizleme ve üretim dağıtımlarını sağlar.

## Tasarım temeli

Tasarım dili; Ege mürekkebi, sıcak kırık beyaz, deniz mavisi ve kontrollü hardal vurgusuna dayanır. Newsreader editoryal metin, Inter arayüz metni için kullanılır. Keskin kutular yerine yumuşak köşeler, boşluk, ince ayırıcılar ve tipografi tercih edilir.

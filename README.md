# Ege'nin Nabzı

Ege Bölgesi odaklı, modern, yalın ve mobil öncelikli bölgesel haber platformu.

Bu depo, iki haftalık MVP geliştirme planının ilk modülüyle başlamıştır. Şu anki sürüm; görsel sistem, Türkçe uygulama kabuğu, kalite araçları ve teslim altyapısını içerir. Haber yönetimi, kimlik doğrulama ve kalıcı veri sonraki modüllerde eklenir.

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

| Komut               | Açıklama                                    |
| ------------------- | ------------------------------------------- |
| `pnpm dev`          | Yerel geliştirme sunucusunu başlatır.       |
| `pnpm build`        | Üretim derlemesi oluşturur.                 |
| `pnpm start`        | Üretim derlemesini çalıştırır.              |
| `pnpm lint`         | Kod kurallarını denetler.                   |
| `pnpm typecheck`    | TypeScript kontrollerini çalıştırır.        |
| `pnpm test`         | Birim ve bileşen testlerini çalıştırır.     |
| `pnpm test:e2e`     | Playwright uçtan uca testlerini çalıştırır. |
| `pnpm format:check` | Biçimlendirmeyi doğrular.                   |
| `pnpm format`       | Kod biçimlendirmesini uygular.              |

## Ortam Değişkenleri

Tüm yerel değişkenler `.env.local` içinde tutulur ve Git'e eklenmez. Başlangıç şablonu `.env.example` dosyasında yer alır.

| Değişken                | Amaç                      | Varsayılan              |
| ----------------------- | ------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`   | Uygulamanın mutlak adresi | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Yayın adı                 | `Ege'nin Nabzı`         |

Supabase, Resend ve Sentry değişkenleri ilgili modüller uygulanana kadar tanımlanmaz.

## Teslimat

Vercel için `vercel.json` hazırdır. Depo GitHub'a bağlandıktan sonra `.github/workflows/ci.yml`, her gönderim ve çekme isteğinde tür denetimi, lint, birim testi ve üretim derlemesini çalıştırır.

Bu modül harici hesaplara bağlanmaz veya yayın yapmaz.

## Belgeler

- [Mimari](docs/architecture.md)
- [Karar kaydı](docs/decisions/001-project-foundation.md)
- [Geliştirme günlüğü](docs/development-log.md)

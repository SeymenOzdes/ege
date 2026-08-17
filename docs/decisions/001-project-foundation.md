# ADR 001 — Proje Temeli

- **Tarih:** 2026-08-17
- **Durum:** Kabul edildi

## Karar

MVP, pnpm ile yönetilen tek bir TypeScript Next.js App Router uygulaması olarak kurulacaktır. Arayüz Tailwind CSS üzerinde, testler Vitest ve Playwright ile, biçimlendirme Prettier ile yürütülecektir. Önizleme ve üretim dağıtımı için Vercel uyumlu yapılandırma hazırlanacaktır.

## Neden

Tek uygulama, iki haftalık solo geliştirme hedefinde kamuya açık site ve yönetim panelini ortak bileşenlerle hızla geliştirmeyi sağlar. Next.js; sunucu oluşturma, SEO ve ilerideki kimlik doğrulama/veri ihtiyaçları için yeterli bir taban sunar. pnpm, mevcut yerel sürümle uyumludur ve kilit dosyasıyla tekrarlanabilir kurulum sağlar.

## Sonuçlar

- Kamu ve yönetim rotaları rota gruplarıyla ayrılır, ancak tek dağıtım olarak kalır.
- Supabase, Resend ve Sentry bu modülde kurulmaz; ilgili özellik modüllerine ertelenir.
- Harici GitHub veya Vercel hesabı bu modül sırasında bağlanmaz.
- Her tamamlanan modül geliştirme günlüğüne doğrulama sonuçlarıyla kaydedilir.

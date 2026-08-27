# Modül 7 — Yönetim kabuğu

## Erişim ve navigasyon

Yönetim layout’u, Modül 5’teki sunucu tarafı `requireStaffRoute` denetimini kullanır. `EDITOR` ve `ADMIN` rollerinin her ikisi dashboard, haberler, yeni haber ve medya ekranlarına ulaşabilir. `Yayın ayarları` yalnız `ADMIN` için menüde görünür; rota aynı zamanda `requireAdminRoute` ile doğrudan erişime karşı da korunur.

Masaüstünde sabit sol navigasyon bulunur. Mobilde marka, menü düğmesi, bildirim ve çıkış kontrolleri üst çubukta toplanır; navigasyon açılır yüzey olarak görünür. Aktif rota hem görsel durum hem `aria-current="page"` ile belirtilir.

## Dashboard

Dashboard, oturum çerezleriyle çalışan RLS kapsamındaki Supabase istemcisinden paralel olarak `DRAFT`, `IN_REVIEW`, `SCHEDULED` ve `PUBLISHED` makale sayılarını, ayrıca en yeni beş yayımlanmış makalenin başlığı, slug’ı, yayın/son güncelleme zamanı ve son-dakika durumunu sorgular.

Yükleme hatası kullanıcıya açıklanır; yapılandırılmamış geliştirme ortamında dashboard boş ve güvenli durumda kalır. Dashboard yalnız public/publishable key ile çalışır; secret key kullanılmaz.

## Ortak arayüzler

`AdminPageHeader`, breadcrumb, başlık, açıklama ve işlemler için ortak başlık yüzeyidir. Bildirim merkezi mevcut durumda boş durum metnini gösterir. Çıkış ve son-dakika taslağı işlemleri onay diyaloğu kullanır. Son-dakika onayı, Modül 8 editörü hazır olana dek güvenli bir hazırlık ekranına yönlendirir.

## Doğrulama

`navigation.test.ts`, editörlerin yönetici sayfasını menüde görmediğini ve iç içe rotaların doğru bölüme karşılık geldiğini doğrular. TypeScript, lint ve üretim derlemesi, App Router route sınırlarını ve sunucu/istemci bileşenlerini doğrular.

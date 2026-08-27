# Modül 6 — Güvenli medya depolama

## Bucket ve erişim modeli

`news-media`, haber görsellerinin doğrudan URL ile yüklenebilmesi için public bir Storage bucket’ıdır. Bucket yapılandırması JPEG, PNG, WebP ve AVIF MIME türlerini kabul eder ve tek nesneyi 10 MiB ile sınırlar.

Public olması, nesnelerin listelenebileceği anlamına gelmez. `storage.objects` üzerinde yalnızca doğrulanmış `EDITOR` ve `ADMIN` rolleri için aşağıdaki RLS politikaları bulunur:

- `SELECT`: Personel, medya kütüphanesini ve yüklediği nesneleri görebilir.
- `INSERT`: Personel, `news-media` içine yeni nesne yükleyebilir.

`UPDATE` ve `DELETE` politikaları kasıtlı olarak yoktur. Yükleyici, tarayıcıda UUID temelli `YYYY/MM/<uuid>.<uzantı>` yolu üretir ve `upsert: false` kullanır. Böylece nesne değiştirilemez veya mevcut dosyanın üstüne yazılamaz.

## Yönetim deneyimi

`/yonetim/medya`, yönetim layout’unun sunucu tarafı rol denetimini kullanır. İstemci yüklemeden önce dosya türü ve 10 MB sınırını denetler; Storage RLS ve bucket kısıtları aynı sınırları tekrar uygular. Yükleme bittiğinde sunucu eylemi doğrulanmış JWT claim’lerinden kullanıcıyı ve personel rolünü yeniden doğrular, sonra `media_assets` kaydını oluşturur.

Her kayıtta şunlar tutulur:

- Zorunlu alt metin
- İsteğe bağlı açıklama ve kredi
- MIME türü, bayt boyutu, genişlik ve yükseklik
- 0–1 arası yatay ve dikey odak noktası
- Bucket, değişmez nesne yolu, yükleyen profil ve zaman damgaları

Bu kayıtlar makale, sosyal görsel ve reklam ilişkilerinde yeniden kullanılmak üzere mevcut çekirdek şemadaki `media_assets` tablosuna yazılır.

## Yerel doğrulama

```bash
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:test
```

`core_schema_and_rls.test.sql`, bucket’ın public teslim için oluşturulduğunu, 10 MiB sınırını ve kabul edilen MIME listesini doğrular. Uygulama testleri, istemci tarafı MIME/boyut denetimini ve değişmez dosya yolu üretimini kapsar.

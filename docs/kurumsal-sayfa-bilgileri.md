# Kurumsal sayfalarda doldurulacak bilgiler

- **Oluşturma:** 2026-09-01 (launch hazırlığı, Faz 3)
- **Kapsam:** `src/app/(site)/(kurumsal)/` altındaki yedi sayfa
- **Durum:** Metinler tam, gerçek bilgiler **eksik**. Sayfalar yayına hazır değil.

Yedi kurumsal sayfanın Türkçe metni yazıldı ve altbilgideki bağlantılar artık 404
vermiyor. Ancak metinlerdeki her gerçek bilgi — unvan, adres, isim, süre, tarih —
`[DOLDURULACAK: …]` yer tutucusu olarak duruyor. Bu belge, launch öncesi kimin neyi
doldurması gerektiğinin listesidir.

Yer tutucular sayfada turuncu kesikli çerçeveyle işaretli, ayrıca her sayfanın
başında "Taslak metin" uyarısı var. **Bu uyarı, bilgiler doldurulduktan sonra
`CorporateDocument` içinden kaldırılmalı** (`src/components/site/corporate.tsx`).

## Neden gerekli

Bunlar hoş görünsün diye eklenmiş sayfalar değil:

- **Künye** — 5651 sayılı Kanun ve Basın Kanunu, internet haber sitesinden künye
  yayımlamasını ister. Eksik künye idari yaptırım konusudur.
- **Gizlilik** — Bülten formu (`src/components/site/newsletter-form.tsx:43`) rıza
  kutusunun yanından bu sayfaya bağlanıyor. Yani şu anda site, aydınlatma metni
  olmayan bir rızaya dayanarak e-posta adresi topluyor.
- Diğer beşi yasal zorunluluk değil ama künyenin ve gizliliğin atıf yaptığı
  metinler; ikisi doldurulup diğerleri boş kalırsa künye kırık bağlantı verir.

## Doldurulacaklar

Aynı bilgi birden çok sayfada geçiyor. Sütunlardaki sayı, o bilginin kaç yerde
tekrarlandığını gösterir — birini güncelleyip diğerini unutmak en olası hata.

### A. Kurum kimliği

| Bilgi                                           | Geçtiği sayfalar                                          |
| ----------------------------------------------- | --------------------------------------------------------- |
| Şirketin tam ticaret unvanı                     | `/kunye`, `/gizlilik`, `/iletisim`, `/kullanim-kosullari` |
| İşyeri / yayın merkezi açık adresi              | `/kunye`, `/iletisim` (2 yerde), `/gizlilik`              |
| Ticaret sicil numarası                          | `/kunye`                                                  |
| MERSİS numarası                                 | `/kunye`                                                  |
| Vergi dairesi ve vergi kimlik numarası          | `/kunye`                                                  |
| VERBİS sicil numarası (kayıt yükümlülüğü varsa) | `/gizlilik`                                               |

> VERBİS kaydı her veri sorumlusu için zorunlu değil; çalışan sayısı ve yıllık mali
> bilanço eşiklerine bakılmalı. Yükümlülük yoksa satır tamamen silinmeli, "yok"
> yazılmamalı.

### B. Kişiler

| Bilgi                        | Geçtiği sayfalar                           |
| ---------------------------- | ------------------------------------------ |
| Sorumlu müdür ad soyad       | `/kunye`                                   |
| Sorumlu müdür e-posta adresi | `/kunye`                                   |
| Sorumlu müdür yardımcısı     | `/kunye` — **atanmadıysa satır silinecek** |

### C. İletişim kanalları

| Bilgi                    | Geçtiği sayfalar                             |
| ------------------------ | -------------------------------------------- |
| Genel iletişim e-postası | `/kunye`                                     |
| Haber merkezi e-postası  | `/iletisim`                                  |
| Düzeltme e-postası       | `/duzeltmeler`, `/iletisim`                  |
| Reklam e-postası         | `/iletisim`                                  |
| KVKK başvuru e-postası   | `/gizlilik`, `/iletisim`                     |
| KEP adresi               | `/kunye`, `/gizlilik`, `/iletisim` (2 yerde) |
| Telefon — genel          | `/kunye`                                     |
| Telefon — haber merkezi  | `/iletisim`                                  |
| Telefon — düzeltme       | `/duzeltmeler`                               |
| Telefon — reklam         | `/iletisim`                                  |
| Çalışma saatleri         | `/iletisim`                                  |

> Dört ayrı e-posta adresi açılmayacaksa metinler tek adrese indirilmeli. Var olmayan
> bir `duzeltme@` adresini sayfada göstermek, hiç göstermemekten kötü.

### D. Hizmet sağlayıcılar

| Bilgi                                                                            | Geçtiği sayfalar      |
| -------------------------------------------------------------------------------- | --------------------- |
| Uygulama barındırma sağlayıcısı — unvan, adres, ülke                             | `/kunye`, `/gizlilik` |
| Supabase kurumsal unvanı, adresi, veri merkezi bölgesi                           | `/kunye`, `/gizlilik` |
| Resend kurumsal unvanı, adresi, ülkesi                                           | `/kunye`, `/gizlilik` |
| Yurt dışına aktarım dayanağı (açık rıza / standart sözleşme / yeterlilik kararı) | `/gizlilik`           |

> Barındırma sağlayıcısı henüz seçilmedi (`docs/launch-readiness.md` #6, Modül 19).
> Bu üç satır ancak üretim ortamı kurulunca kesinleşir; künyedeki yer sağlayıcı
> bilgisi 5651 gereği olduğu için **dağıtımdan önce değil, dağıtımla birlikte**
> doldurulmalı.
>
> Supabase'in veri merkezi bölgesi Supabase panelinden (Project Settings → General)
> okunur; yurt dışı bölge seçiliyse KVKK m. 9 dayanağı zorunlu hâle gelir.

### E. Süreler

| Bilgi                                                 | Geçtiği sayfalar |
| ----------------------------------------------------- | ---------------- |
| Düzeltme başvurularına yanıt süresi                   | `/duzeltmeler`   |
| Bülten aboneliği — ayrıldıktan sonraki saklama süresi | `/gizlilik`      |
| Hesap silme talebinin yürütülme süresi                | `/gizlilik`      |
| Sonuçsuz arama kayıtlarının saklama süresi            | `/gizlilik`      |
| Sunucu erişim kayıtlarının saklama süresi             | `/gizlilik`      |
| Supabase oturum belirtecinin ömrü                     | `/cerezler`      |

> Saklama süreleri uydurulmamalı: ne yazılırsa, veritabanında o sürede gerçekten
> silme işi yapılıyor olmalı. Faz 6'daki `pg_cron` işine bir temizlik işi eklemek
> gerekebilir — şu an hiçbir tabloda otomatik silme yok.
>
> Supabase oturum ömrü panelden (Authentication → Sessions) okunur.

### F. Hukuki ve editoryal

| Bilgi                                           | Geçtiği sayfalar                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Bağlı olunan meslek örgütü / imzalanan bildirge | `/yayin-ilkeleri`                                                  |
| Yetkili mahkeme ve icra daireleri               | `/kullanim-kosullari`                                              |
| Yürürlük tarihi                                 | `/yayin-ilkeleri`, `/gizlilik`, `/cerezler`, `/kullanim-kosullari` |

> Meslek örgütüne üyelik yoksa madde 11 tamamen çıkarılmalı; olmayan bir üyelik ima
> etmek yayın ilkeleri sayfasında bulunabilecek en kötü hatadır.

## Doğrulama ile ilgili notlar

- **Metinler hukuki denetimden geçmedi.** Özellikle `/gizlilik` (KVKK aydınlatma
  metni) ve `/kullanim-kosullari` (sorumluluk sınırlaması) bir avukat tarafından
  okunmadan yayına alınmamalı. Bu belgedeki listeyi doldurmak metni hukuken geçerli
  kılmaz, yalnızca eksiksiz kılar.
- `/cerezler` sayfasındaki çerez listesi koddan çıkarıldı ve bugün doğru:
  `egenin-nabzi-auth-next` ile `egenin-nabzi-pending-bookmark`
  (`src/lib/auth/redirect.ts:3,10`, ikisi de `httpOnly`, 15 dakika) ve Supabase'in
  `sb-…-auth-token` çerezi. **Siteye analitik ya da reklam eklenirse bu sayfa ve
  `/gizlilik` aynı commit'te güncellenmeli**, çünkü ikisi de "üçüncü taraf takip
  kodu bulunmuyor" diyor.
- `/gizlilik` sayfasındaki "sonuçsuz aramalarda kim aradığı kaydedilmez" ifadesi
  `src/lib/search-analytics.ts:33-39`'a dayanıyor; o insert'e kullanıcı kimliği ya
  da IP eklenirse metin de değişmeli.

## Kalan yer tutucuları saymak

Yer tutucuların hepsi `data-doldurulacak` özniteliği taşıyor. Kaynakta:

```
grep -rc "<Placeholder>" "src/app/(site)/(kurumsal)"
```

Tarayıcıda, herhangi bir kurumsal sayfada:

```js
document.querySelectorAll("[data-doldurulacak]").length;
```

Sayı sıfıra indiğinde `CorporateDocument` içindeki "Taslak metin" uyarısı ve
`Placeholder` bileşeni de kaldırılabilir.

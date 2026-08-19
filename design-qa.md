# Design QA — Modern Ege'nin Nabzı Ana Sayfası

**Tarih:** 18 Ağustos 2026  
**Sonuç:** `passed`

## Karşılaştırma zemini

- Referans: `/Users/seymenozdes/Downloads/WhatsApp Image 2026-08-08 at 21.31.36 (1).jpeg`
- Masaüstü uygulama görüntüsü: `design-qa-desktop.png`
- Tam sayfa uygulama görüntüsü: `design-qa-full.png`
- Mobil uygulama görüntüsü: `design-qa-mobile.png`
- Masaüstü görünüm: 1600 × 773
- Mobil görünüm: 390 × 844 (Pixel 7'e yakın)
- Durum: anonim ziyaretçi, ana sayfa, başlangıç manşeti

Referans ve masaüstü uygulama görüntüsü aynı karşılaştırma geçişinde birlikte incelendi. Ayrıca tam sayfa akışı ve mobil kırılım ayrı odaklı geçişlerde kontrol edildi.

## Kontrol sonucu

### Yerleşim ve hiyerarşi

- Referanstaki iki katmanlı navigasyon, geniş ana manşet ve sağdaki iki ikincil haber hiyerarşisi korunuyor.
- Yeni son dakika bandı, reklam alanları, son haberler akışı, dört konu bölümü, bülten çağrısı ve geniş footer planlanan sırada.
- Masaüstünde asimetrik grid dengeli; mobilde tüm içerik doğal tek sütuna iniyor.
- Masaüstü ve mobilde yatay taşma bulunmadı (`scrollWidth === clientWidth`).

### Tipografi, renk ve yüzeyler

- Newsreader/Inter ayrımı editoryal başlık ile arayüz metnini belirgin biçimde ayırıyor.
- Fildişi, mürekkep, deniz mavisi ve hardal eksenindeki palet bütün sayfada tutarlı.
- Kart radius, sınır, boşluk ve gölge değerleri modern görünümü destekliyor; içerik hiyerarşisini bozan gereksiz yüzey yok.
- Kullanıcı tercihi doğrultusunda haber fotoğrafları yerine anlamlı şehir etiketlerine sahip düz renk medya alanları kullanıldı. Harici veya telifli görsel yok.

### İçerik, ikon ve erişilebilirlik

- Demo haber metinleri Ege odaklı ve gerçek olay iddiasında bulunmayan editoryal örneklerden oluşuyor.
- Arama, kullanıcı, menü, yön ve diğer simgeler aynı Phosphor ikon ailesinden.
- Manşet bölgesi semantik olarak etiketli; kontrollerin erişilebilir adları var.
- Mobil menü klavye/tıklama ile açılıyor ve bütün hedef bağlantıları içeriyor.
- Odak, kontrast, anlamlı medya etiketleri, dokunma hedefleri ve azaltılmış hareket davranışı doğrulandı.

### Durumlar ve etkileşimler

- Manşet önceki/sonraki ve gösterge kontrolleri çalışıyor; oynat/duraklat kontrolü tasarım kararıyla kaldırıldı.
- Önceki/sonraki kontrolleri metin panelinden ayrılan üst-orta hatta, sırasıyla sol ve sağ kenarda konumlanıyor.
- Otomatik geçiş; hover, odak, görünmeyen sekme ve azaltılmış hareket koşullarında doğru davranıyor.
- Yükleniyor, boş içerik ve hata görünümleri uygulamanın görsel diline uygun.
- Tarayıcı konsolunda masaüstü ve mobil geçişlerde hata/uyarı bulunmadı.

## Test kanıtı

- TypeScript tür kontrolü: geçti
- ESLint: geçti
- Vitest: 8/8 geçti
- Playwright: 5 geçti, 1 masaüstünde bilinçli mobil-only atlama
- Next.js Webpack üretim derlemesi: geçti

## Bulgular

P0, P1 veya P2 seviyesinde açık bulgu kalmadı.

## Slider odaklı son karşılaştırma

- Kaynak görsel: `/var/folders/9n/lcy6bvp116x0fvygtcszjkyr0000gn/T/TemporaryItems/NSIRD_screencaptureui_GNL62F/Screenshot 2026-08-18 at 21.02.32.png`
- Uygulama görüntüsü: `design-qa-slider-desktop-current.png`
- Birleşik karşılaştırma: `design-qa-slider-comparison.png`
- Mobil kontrol: `design-qa-slider-mobile-current.png`
- Kaynak boyutu: 556 × 444 piksel; yoğunluk bilgisi bulunmadığından 1× kabul edildi.
- Masaüstü uygulama alanı: 810 × 702 piksel; 1280 × 1050 CSS viewport, deviceScaleFactor 1.
- Mobil uygulama alanı: 365 × 544 piksel; 412 × 915 CSS viewport, deviceScaleFactor 1.
- Durum: anonim ziyaretçi, ana sayfa, başlangıç manşeti.

### Tam görünüm ve odaklı karşılaştırma kanıtı

- Referans ve masaüstü slider görüntüsü aynı birleşik görselde karşılaştırıldı. Alt metin yerleşimi ve yan okların içerikten ayrılması referansın kompozisyonunu takip ediyor.
- Başlık ve açıklama tek bir cam panel içinde; iki metin öğesinin hesaplanan arka planı şeffaf.
- Konum etiketi slider görselinin sağ üst köşesinde. Başlık 43.264 px, açıklama 9.68 px; önceki değerlerin yaklaşık %65'i.
- Mobil görünümde başlık 28.119 px, açıklama 8.528 px; panel slider alt bölümünde kalıyor ve yatay taşma bulunmuyor.
- Görsel hedefteki fotoğraf birebir varlık hedefi değil; mevcut renkli medya yüzeyi proje tercihi olarak korunuyor.
- Sonraki manşet etkileşimi çalıştı ve tarayıcı konsolunda hata bulunmadı.

### Karşılaştırma geçmişi

- Önceki P2: başlık ve açıklamanın ayrı cam yüzeyleri görsel bütünlüğü bölüyordu. Tek ortak cam panele taşındı.
- Önceki P2: konum etiketi medya yüzeyinin sol altındaydı. Slider bağlamında sağ üste sabitlendi.
- Önceki P2: tipografi istenenden büyüktü. Başlık ve açıklama ölçüleri %35 azaltıldı.
- Son kontrol: önceki bulguların tamamı giderildi; yeni P0/P1/P2 bulgusu oluşmadı.

final result: passed

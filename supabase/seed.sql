-- This file is intentionally data-only. `pnpm supabase:reset` applies migrations first.

insert into public.topics (name, slug, description, sort_order)
values
  ('Gündem', 'gundem', 'Ege Bölgesi gündemi ve kamusal yaşam.', 10),
  ('Ekonomi', 'ekonomi', 'Yerel ekonomi, üretim ve emek.', 20),
  ('Kültür-Sanat', 'kultur-sanat', 'Kültür, sanat ve tarih.', 30),
  ('Yaşam', 'yasam', 'Günlük yaşam, çevre ve topluluk.', 40)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.locations (name, slug, province_code)
values
  ('İzmir', 'izmir', '35'),
  ('Aydın', 'aydin', '09'),
  ('Muğla', 'mugla', '48'),
  ('Manisa', 'manisa', '45'),
  ('Denizli', 'denizli', '20'),
  ('Balıkesir', 'balikesir', '10')
on conflict (slug) do update
set
  name = excluded.name,
  province_code = excluded.province_code;

insert into public.authors (name, slug, role_label, bio)
values (
  'Ece Aksoy',
  'ece-aksoy',
  'Yerel yaşam muhabiri',
  'Ege''nin şehirlerinde yerel yaşam, dayanışma ve kent kültürü üzerine haberler hazırlıyor.'
)
on conflict (slug) do update
set
  name = excluded.name,
  role_label = excluded.role_label,
  bio = excluded.bio;

insert into public.locations (name, slug, province_code)
values ('Kütahya', 'kutahya', '43')
on conflict (slug) do update
set
  name = excluded.name,
  province_code = excluded.province_code;

insert into public.authors (name, slug, role_label, bio)
values
  (
    'Elif Demir',
    'elif-demir',
    'Ekonomi muhabiri',
    'Üretimi, emeği ve zanaatı sahadan izliyor; Ege''nin tarlalarını ve atölyelerini takip ediyor.'
  ),
  (
    'Kerem Aydın',
    'kerem-aydin',
    'Kent ve ulaşım muhabiri',
    'Kamusal yaşam, kıyı hatları ve raylı sistemler üzerine haberler hazırlıyor.'
  )
on conflict (slug) do update
set
  name = excluded.name,
  role_label = excluded.role_label,
  bio = excluded.bio;

-- Yayımlanmış örnek haberler. Slug, başlık ve özetler kamuya açık önizleme
-- kataloğuyla birebir aynıdır; böylece mevcut bağlantılar çalışmaya devam eder.
-- `body_text` gövdeden türetilir, bu sayede metin iki yerde tekrar edilmez ve
-- `search_vector` üretilmiş kolonu gerçek Türkçe içerikle dolar.
with seed_articles (
  slug, title, summary, topic_slug, location_slug, author_slug, published_at, body
) as (
  values
    (
      'izmirin-kiyi-rotalari'::text,
      'Körfezin iki yakasında sabah: İzmir''in yeni kıyı rotaları'::text,
      'Deniz ulaşımı, yaya yolları ve kıyı yaşamını aynı hatta buluşturan yeni bir kent ritmi.'::text,
      'gundem'::text,
      'izmir'::text,
      'kerem-aydin'::text,
      '2026-08-27T09:42:00+03:00'::timestamptz,
      '[
        {"type":"paragraph","text":"İzmir Körfezi''nin iki yakasını birbirine bağlayan sabah seferleri, kentin günlük ritmini yeniden kuruyor. Karşıyaka ve Konak arasındaki vapur hattına eklenen erken seferler, yaya yollarıyla birleşerek işe ve okula gidenler için kesintisiz bir rota oluşturuyor."},
        {"type":"heading","text":"Denizle kurulan yeni bağ"},
        {"type":"paragraph","text":"Kıyı boyunca uzanan yürüyüş ve bisiklet yolları, iskelelere doğrudan bağlanacak biçimde düzenlendi. Böylece bir yolcu, mahallesinden çıkıp bisikletiyle iskeleye ulaşabiliyor, aracını vapura alarak karşı yakada yoluna devam edebiliyor. Ulaşım planlamacıları bu bütünlüğü kentin en görünür kazanımı olarak tanımlıyor."},
        {"type":"paragraph","text":"Kıyı rotalarının ilk haftalarında toplu ulaşım kullanımında belirgin bir artış kaydedildi. Sabah saatlerinde deniz ulaşımını tercih edenlerin sayısı geçen yılın aynı dönemine göre yükseldi. Kent araştırmacıları, denizin yeniden bir ulaşım hattı olarak görülmesinin trafik yükünü de dengelediğini söylüyor."},
        {"type":"paragraph","text":"Hattın gelecek aşamasında Bostanlı ve Alsancak arasındaki sefer sıklığının artırılması planlanıyor. Kıyıdaki dinlenme alanları, gölgelikler ve bilgilendirme panoları da aynı takvimde yenilenecek."}
      ]'::jsonb
    ),
    (
      'zeytinin-yeni-hasat-hikayesi',
      'Zeytinin yeni hasat hikâyesi genç üreticilerle büyüyor',
      'Küçük üreticiler yerel çeşitleri koruyarak yeni pazarlara açılıyor.',
      'ekonomi',
      'aydin',
      'elif-demir',
      '2026-08-27T09:18:00+03:00',
      '[
        {"type":"paragraph","text":"Aydın''ın zeytinlik köylerinde hasat hazırlığı bu yıl genç üreticilerin kurduğu ortak atölyelerle başlıyor. Aileden devraldıkları bahçeleri işleyen üreticiler, yerel zeytin çeşitlerini koruyarak sofralık ve yağlık üretimi birlikte planlıyor."},
        {"type":"heading","text":"Yerel çeşidi korumak"},
        {"type":"paragraph","text":"Bölgede yüzyıllardır yetişen memecik ve domat çeşitleri, verim kaygısıyla terk edilme riski taşıyordu. Genç üreticiler bu çeşitleri kayıt altına alıp fidan üretimini yeniden başlattı. Zeytinin coğrafi kimliğini korumanın uzun vadede fiyat istikrarı da getirdiğini söylüyorlar."},
        {"type":"paragraph","text":"Ortak soğuk sıkım tesisi, küçük bahçelerin ürününü aynı gün işleyerek asit oranını düşük tutuyor. Üreticiler hasat takvimini paylaşıyor, tesisin kapasitesi böylece boşa çıkmıyor. Kooperatif, etiketleme ve analiz masraflarını da ortaklaştırıyor."},
        {"type":"paragraph","text":"Ürünün bir bölümü yerel pazarlarda, bir bölümü ise doğrudan tüketiciye ulaşan abonelik modeliyle satılıyor. Üreticiler için asıl kazanım, aracısız satışın getirdiği öngörülebilir gelir."}
      ]'::jsonb
    ),
    (
      'antik-kentlerde-yaz-aksamlari',
      'Antik kentlerde yaz akşamları yeniden sahneyle buluşuyor',
      'Ege''nin tarihî mekânlarında müzik ve tiyatro için yeni bir sezon başlıyor.',
      'kultur-sanat',
      'mugla',
      'ece-aksoy',
      '2026-08-26T08:55:00+03:00',
      '[
        {"type":"paragraph","text":"Muğla''nın antik tiyatrolarında yaz akşamları yeniden sahneye açılıyor. Koruma kurullarının onayladığı program, taş basamaklara zarar vermeyen hafif sahne kurulumlarıyla yürütülüyor."},
        {"type":"heading","text":"Taşa dokunmadan sahne kurmak"},
        {"type":"paragraph","text":"Sahne düzeni, antik yapıya sabitlenmeyen taşınabilir platformlardan oluşuyor. Işık ve ses donanımı yapının dışına yerleştiriliyor, seyirci kapasitesi ise oturma alanlarının taşıma gücüne göre sınırlanıyor. Arkeologlar her temsil öncesi ve sonrasında alanı denetliyor."},
        {"type":"paragraph","text":"Sezon programında klasik müzik dinletileri, çağdaş tiyatro ve bölgeye özgü halk anlatılarını sahneye taşıyan yapımlar bulunuyor. Yerel tiyatro toplulukları da ilk kez aynı takvimde yer alıyor."},
        {"type":"paragraph","text":"Biletlerin bir bölümü bölge okullarına ve köy derneklerine ayrıldı. Düzenleyiciler, kültürel mirasın önce kendi kentinde izleyiciyle buluşmasını önemsediklerini belirtiyor."}
      ]'::jsonb
    ),
    (
      'mahalle-pazarlarinda-yerel-urun',
      'Mahalle pazarlarında yerel ürün için yeni dayanışma ağı',
      'Üreticiyle kentliyi aracısız buluşturan model, Manisa''nın dört ilçesinde küçük üreticinin emeğini mahalle ölçeğinde görünür kılıyor.',
      'yasam',
      'manisa',
      'ece-aksoy',
      '2026-08-18T08:37:00+03:00',
      '[
        {"type":"paragraph","text":"Manisa''da dört ilçenin mahalle pazarlarında başlayan yeni dayanışma modeli, küçük üretici ile kentliyi aynı tezgâhın etrafında buluşturuyor. Pilot uygulamada ürünler aracı depolara uğramadan, üretildiği köyden haftalık pazar rotasına taşınıyor."},
        {"type":"paragraph","text":"Girişimin ilk haftalarında 36 üretici ortak takvim ve taşıma planına dâhil oldu. Her tezgâhta ürünün yetiştiği köyü, hasat gününü ve üreticinin adını gösteren sade bilgi kartları bulunuyor. Böylece fiyat kadar ürünün hikâyesi de görünür hâle geliyor."},
        {"type":"heading","text":"Dört ilçede ortak rota"},
        {"type":"paragraph","text":"Yunusemre, Şehzadeler, Turgutlu ve Salihli''de yürütülen deneme, kooperatifler ile mahalle inisiyatiflerinin hazırladığı ortak rota üzerinden ilerliyor. Küçük miktarda ürünü olan çiftçiler de aynı araçta yer paylaşarak taşıma maliyetini düşürüyor."},
        {"type":"quote","text":"Burada yalnızca ürün satmıyoruz; hangi tohumu neden koruduğumuzu da anlatıyoruz. Bizi yeniden aynı sofranın parçası yapan şey bu sohbet.","attribution":"Nermin Karaca, Saruhanlı''dan üretici"},
        {"type":"paragraph","text":"Pazarın açıldığı ilk iki saatte gönüllüler ürün girişini kaydediyor, gün sonunda satılmayan ürünler ise mahalledeki gıda paylaşım noktalarına yönlendiriliyor. Ağın koordinatörleri, bu sayede hem israfın hem de küçük üreticinin belirsizliğinin azaldığını söylüyor."},
        {"type":"heading","text":"Fiyatın ötesinde bir bağ"},
        {"type":"paragraph","text":"Tüketiciler için modelin en görünür yanı şeffaf fiyatlandırma. Tezgâh etiketlerinde üretici payı ile taşıma gideri ayrı ayrı gösteriliyor. İlk veriler, ürün grubuna göre nihai fiyatın geleneksel zincire kıyasla yüzde 8 ile 14 arasında daha düşük kaldığını gösteriyor."},
        {"type":"paragraph","text":"Pilot çalışma ekim ayına kadar sürecek. Sonuçlar üretici geliri, gıda israfı ve mahalle katılımı üzerinden değerlendirilecek. Model başarılı olursa ağın gelecek baharda Akhisar ve Alaşehir''e de genişletilmesi planlanıyor."}
      ]'::jsonb
    ),
    (
      'ege-hattinda-rayli-ulasim',
      'Ege hattında raylı ulaşımın günlük yaşama etkisi',
      'Yeni bağlantı seçenekleri çalışanların ve öğrencilerin rotasını değiştiriyor.',
      'gundem',
      'denizli',
      'kerem-aydin',
      '2026-08-26T08:12:00+03:00',
      '[
        {"type":"paragraph","text":"Denizli merkezli banliyö hattına eklenen yeni seferler, çevre ilçelerden kente günlük gidiş gelişi ilk kez öngörülebilir hâle getirdi. Sabah ve akşam yoğun saatlerinde sefer sıklığı yarıya indirildi."},
        {"type":"heading","text":"Öğrenciler için değişen rota"},
        {"type":"paragraph","text":"Üniversite kampüsüne yürüme mesafesindeki durak, hattın en çok kullanılan noktası hâline geldi. Öğrenciler için aylık abonelik ücreti sabitlendi; bu, barınma maliyeti nedeniyle çevre ilçelerde oturanların ulaşım yükünü azaltıyor."},
        {"type":"paragraph","text":"Hattın istasyonlarında bisiklet park alanları ve engelsiz erişim düzenlemeleri tamamlandı. Peron yükseklikleri araç zeminiyle eşitlenerek tekerlekli sandalye kullanıcıları için rampasız geçiş sağlandı."},
        {"type":"paragraph","text":"Ulaşım planlamacıları, raylı sistemin asıl etkisinin yalnızca süre kazancı olmadığını vurguluyor. Sabit saatli seferler, günlük planı öngörülebilir kıldığı için iş ve eğitim tercihlerini de doğrudan etkiliyor."}
      ]'::jsonb
    ),
    (
      'kiyi-koylerinde-deniz-nobetleri',
      'Kıyı köylerinde deniz nöbetleri: Maviyi birlikte korumak',
      'Gönüllüler, balıkçılar ve araştırmacılar kıyı temizliği için aynı masada.',
      'yasam',
      'balikesir',
      'ece-aksoy',
      '2026-08-25T07:48:00+03:00',
      '[
        {"type":"paragraph","text":"Balıkesir''in kıyı köylerinde gönüllülerin başlattığı deniz nöbetleri, balıkçılar ve deniz biyologlarıyla birlikte yürütülen düzenli bir izleme çalışmasına dönüştü."},
        {"type":"heading","text":"Balıkçı bilgisiyle bilim bir arada"},
        {"type":"paragraph","text":"Balıkçılar, ağlarına takılan atıkları limana getirerek kayıt altına aldırıyor. Araştırmacılar bu verileri kıyı akıntı haritalarıyla birleştirip atığın nereden geldiğini çıkarıyor. Yerel bilgi ile ölçüm verisinin birlikte kullanılması, temizlik noktalarının doğru seçilmesini sağlıyor."},
        {"type":"paragraph","text":"Nöbetler haftada iki gün, sabah erken saatlerde yapılıyor. Toplanan atıklar türüne göre ayrıştırılıyor; geri kazanılabilir olanlar ilçe tesisine, kalanlar ise düzenli depolamaya gönderiliyor."},
        {"type":"paragraph","text":"Köy dernekleri, çalışmanın en kalıcı sonucunun kıyıyı ortak bir sorumluluk alanı olarak görmek olduğunu söylüyor. Okullarda yürütülen tanıtım çalışmalarıyla gönüllü sayısı da artıyor."}
      ]'::jsonb
    ),
    (
      'yerel-tasarim-atolyeleri',
      'Yerel tasarım atölyeleri eski zanaatlara yeni bir dil kuruyor',
      'Usta-çırak geleneği, genç tasarımcıların çağdaş yorumlarıyla dönüşüyor.',
      'kultur-sanat',
      'kutahya',
      'elif-demir',
      '2026-08-24T07:20:00+03:00',
      '[
        {"type":"paragraph","text":"Kütahya''da çini ve seramik atölyeleri, genç tasarımcıların katıldığı ortak üretim programlarıyla yeni bir döneme giriyor. Ustalar teknik bilgiyi aktarırken, tasarımcılar biçim ve kullanım önerileriyle geleneksel motifleri güncelliyor."},
        {"type":"heading","text":"Usta ile tasarımcı aynı tezgâhta"},
        {"type":"paragraph","text":"Program, üç aylık dönemler hâlinde yürütülüyor. Her dönemde bir usta ile iki tasarımcı aynı tezgâhı paylaşıyor. Ortaya çıkan ürünler hem atölyenin kendi kataloğunda hem de ortak sergilerde yer buluyor."},
        {"type":"paragraph","text":"Zanaatın sürdürülebilirliği için asıl mesele, ürünün günlük yaşamda yer bulması. Tasarımcılar bu nedenle dekoratif parçalar yerine sofra ve mutfak nesnelerine ağırlık veriyor. Fırınlama ve sır teknikleri ustaların denetiminde kalıyor."},
        {"type":"paragraph","text":"Atölyeler, çırak sayısındaki düşüşü de bu programla dengelemeyi umuyor. Genç katılımcıların bir bölümü dönem sonunda kendi atölyesini kurmayı planlıyor."}
      ]'::jsonb
    ),
    (
      'gediz-ovasinda-toprak-takibi',
      'Gediz Ovası''nda toprağı dinleyen yeni üretim yaklaşımı',
      'Çiftçiler suyu ve toprağı birlikte izleyen yöntemleri paylaşmaya başladı.',
      'ekonomi',
      'manisa',
      'elif-demir',
      '2026-08-23T06:58:00+03:00',
      '[
        {"type":"paragraph","text":"Gediz Ovası''nda üreticiler, sulama planlarını toprak nemi ölçümlerine göre kuran ortak bir izleme ağı kurdu. Amaç, azalan su kaynaklarını verimden ödün vermeden kullanmak."},
        {"type":"heading","text":"Ölçerek sulamak"},
        {"type":"paragraph","text":"Tarlalara yerleştirilen basit nem sensörleri, sulama zamanını takvim yerine toprağın durumuna göre belirliyor. İlk sezonda kullanılan su miktarı düşerken pamuk ve bağ verimi korundu. Üreticiler ölçüm sonuçlarını ortak bir defterde paylaşıyor."},
        {"type":"paragraph","text":"Toprak analizleri, uzun yıllar aynı ürünün ekildiği parsellerde organik madde oranının düştüğünü gösterdi. Üreticiler bu parsellerde ara ürün ve yeşil gübre denemelerine başladı."},
        {"type":"paragraph","text":"Ziraat odaları, yöntemin yaygınlaşması için saha günleri düzenliyor. Çiftçiler, en ikna edici anlatımın komşu tarladaki sonuç olduğunu söylüyor."}
      ]'::jsonb
    ),
    (
      'mahallede-ortak-sofra',
      'Mahallede ortak sofra, kentte yeni komşuluk',
      'Semt girişimleri gıda paylaşımını kalıcı bir dayanışma modeline dönüştürüyor.',
      'yasam',
      'izmir',
      'ece-aksoy',
      '2026-08-22T06:30:00+03:00',
      '[
        {"type":"paragraph","text":"İzmir''in birkaç mahallesinde haftalık olarak kurulan ortak sofralar, komşuluk ilişkisini yeniden kuran kalıcı bir dayanışma pratiğine dönüştü."},
        {"type":"heading","text":"Paylaşmayı düzenli hâle getirmek"},
        {"type":"paragraph","text":"Sofralar mahalle evlerinde ya da site bahçelerinde kuruluyor. Katılımcılar yemeği birlikte hazırlıyor, artan yiyecek ise ertesi güne kalmadan ihtiyaç sahiplerine ulaştırılıyor. Girişimler, yardım değil paylaşım dili kullanmaya özen gösteriyor."},
        {"type":"paragraph","text":"Model, gıda israfını azaltmanın yanında yalnız yaşayan yaşlılar için düzenli bir sosyal temas noktası oluşturuyor. Mahalle muhtarlıkları katılımı duyurmak için basit ilan panoları kullanıyor."},
        {"type":"paragraph","text":"Girişimciler, ölçeği büyütmek yerine mahalle düzeyinde kalmayı tercih ediyor. Küçük ölçeğin, tanıdıklık ve güven duygusunu koruduğunu söylüyorlar."}
      ]'::jsonb
    )
)
insert into public.articles (
  slug, title, summary, topic_id, location_id, author_id,
  status, article_type, published_at, body, body_text
)
select
  s.slug,
  s.title,
  s.summary,
  (select t.id from public.topics as t where t.slug = s.topic_slug),
  (select l.id from public.locations as l where l.slug = s.location_slug),
  (select a.id from public.authors as a where a.slug = s.author_slug),
  'PUBLISHED',
  'NEWS',
  s.published_at,
  s.body,
  (
    select string_agg(block ->> 'text', ' ')
    from jsonb_array_elements(s.body) as block
  )
from seed_articles as s
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  topic_id = excluded.topic_id,
  location_id = excluded.location_id,
  author_id = excluded.author_id,
  status = excluded.status,
  article_type = excluded.article_type,
  published_at = excluded.published_at,
  body = excluded.body,
  body_text = excluded.body_text;

-- ==========================================================================
-- YEREL GELİŞTİRME: sabit admin hesabı.
-- Seed yalnızca `supabase db reset --local` sırasında çalışır; canlı ortama
-- asla taşınmaz. Kimlik bilgileri src/lib/auth/dev-access.ts içindeki
-- varsayılanlarla birebir eşleşir; DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD ile
-- ezip değiştiriliyorsa burası da güncellenmelidir.
-- Profil satırını core_schema'daki on_auth_user_created tetiği oluşturur.
-- ==========================================================================
delete from auth.users where email = 'dev-admin@ege.local';

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  reauthentication_token,
  phone,
  phone_change,
  phone_change_token,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'dev-admin@ege.local',
  crypt('dev-admin-password', gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '{"role": "ADMIN"}'::jsonb,
  '{"display_name": "Dev Admin"}'::jsonb,
  now(),
  now()
);
-- Not: token/phone metin kolonları NULL değil '' olmalı; GoTrue NULL kolonları
-- taramada string'e çeviremediği için 500 döndürüyor. instance_id de
-- API ile oluşturulan kullanıcılarla aynı sıfır UUID olmalı.

insert into auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'email',
  'email',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000001',
    'email', 'dev-admin@ege.local',
    'email_verified', true
  ),
  now(),
  now(),
  now()
);
-- Üstteki `delete from auth.users` kullanıcıyı ve cascade edilen identity
-- satırlarını temizlediği için bu ekleme her reset'te güvenle tekrarlanır.

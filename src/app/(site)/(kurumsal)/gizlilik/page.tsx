import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Fact, FactList, Placeholder } from "@/components/site/corporate";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Ege'nin Nabzı'nın hangi kişisel verileri neden işlediği, kimlerle paylaştığı ve KVKK kapsamındaki haklarınızı nasıl kullanacağınız.",
  alternates: { canonical: "/gizlilik" },
};

export default function GizlilikPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Gizlilik Politikası"
      lede="Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca hazırlanmış aydınlatma metnidir. Sitede hangi verinin toplandığını, neden toplandığını ve ne kadar süreyle saklandığını anlatır."
      path="/gizlilik"
    >
      <h2>1. Veri sorumlusu</h2>
      <FactList>
        <Fact label="Veri sorumlusu">
          <Placeholder>şirketin tam ticaret unvanı</Placeholder>
        </Fact>
        <Fact label="Adres">
          <Placeholder>açık adres</Placeholder>
        </Fact>
        <Fact label="E-posta">
          <Placeholder>kvkk@… adresi</Placeholder>
        </Fact>
        <Fact label="KEP adresi">
          <Placeholder>kayıtlı elektronik posta adresi</Placeholder>
        </Fact>
        <Fact label="VERBİS kaydı">
          <Placeholder>VERBİS sicil numarası — kayıt yükümlülüğü varsa</Placeholder>
        </Fact>
      </FactList>

      <h2>2. İşlenen veriler ve hukuki sebepleri</h2>
      <p>
        Siteyi yalnızca haber okumak için kullandığınızda sizden ad, adres ya da e-posta istenmez.
        Aşağıdaki veriler yalnızca ilgili işlemi kendiniz başlattığınızda işlenir.
      </p>

      <h3>a) Bülten aboneliği</h3>
      <ul>
        <li>
          <strong>İşlenen veri:</strong> e-posta adresiniz, abonelik durumu ve abonelik, onay,
          ayrılma tarihleri.
        </li>
        <li>
          <strong>Amaç:</strong> haftalık bültenin gönderilmesi ve aboneliğin çift onayla
          doğrulanması.
        </li>
        <li>
          <strong>Hukuki sebep:</strong> açık rızanız (KVKK m. 5/1). Bülten formundaki onay kutusu
          önceden işaretli değildir; rızanızı her e-postanın altındaki bağlantıdan geri
          çekebilirsiniz.
        </li>
      </ul>

      <h3>b) Okur hesabı</h3>
      <ul>
        <li>
          <strong>İşlenen veri:</strong> e-posta adresiniz, belirlerseniz görünen adınız, hesap
          oluşturma ve son giriş tarihleri.
        </li>
        <li>
          <strong>Amaç:</strong> giriş yapabilmeniz ve haber kaydetme özelliğinin çalışması.
        </li>
        <li>
          <strong>Hukuki sebep:</strong> sözleşmenin kurulması ve ifası (KVKK m. 5/2-c).
        </li>
      </ul>

      <h3>c) Kaydedilen haberler</h3>
      <ul>
        <li>
          <strong>İşlenen veri:</strong> kaydettiğiniz haberlerin listesi ve kaydetme tarihleri.
        </li>
        <li>
          <strong>Amaç:</strong> <Link href="/kaydedilenler">Kaydedilenler</Link> listenizin size
          gösterilmesi. Bu liste yalnızca size görünür; başka okurlarla paylaşılmaz.
        </li>
        <li>
          <strong>Hukuki sebep:</strong> sözleşmenin ifası (KVKK m. 5/2-c).
        </li>
      </ul>

      <h3>d) Sonuçsuz aramalar</h3>
      <ul>
        <li>
          <strong>İşlenen veri:</strong> sonuç döndürmeyen arama metni ve seçtiğiniz konu/şehir
          filtresi. <strong>Kim aradı bilgisi kaydedilmez</strong> — bu kayıtlarda kullanıcı
          kimliği, IP adresi ya da oturum bilgisi tutulmaz.
        </li>
        <li>
          <strong>Amaç:</strong> okurun bulamadığı konuları görüp yayın planını buna göre
          düzenlemek.
        </li>
        <li>
          <strong>Hukuki sebep:</strong> meşru menfaat (KVKK m. 5/2-f).
        </li>
      </ul>

      <h3>e) Teknik kayıtlar ve çerezler</h3>
      <ul>
        <li>
          <strong>İşlenen veri:</strong> oturum çerezleri ve barındırma sağlayıcısının tuttuğu
          sunucu erişim kayıtları (IP adresi, tarih, istenen adres, tarayıcı bilgisi).
        </li>
        <li>
          <strong>Amaç:</strong> oturumun sürdürülmesi, güvenlik ve kötüye kullanımın önlenmesi.
        </li>
        <li>
          <strong>Hukuki sebep:</strong> meşru menfaat (KVKK m. 5/2-f) ve hukuki yükümlülük (KVKK m.
          5/2-ç).
        </li>
        <li>
          Ayrıntı için <Link href="/cerezler">Çerez Politikası</Link>.
        </li>
      </ul>

      <p>
        Sitede reklam ağı, sosyal medya piksel&rsquo;i ya da davranışsal profilleme amaçlı üçüncü
        taraf takip kodu bulunmuyor. Bu değişirse metin güncellenir ve değişiklik bu sayfada
        duyurulur.
      </p>

      <h2>3. Verinin toplanma yöntemi</h2>
      <p>
        Veriler tamamen elektronik ortamda, siteye girdiğiniz bilgiler ve tarayıcınızın gönderdiği
        teknik bilgiler üzerinden toplanır. Otomatik karar verme ya da profilleme yapılmaz.
      </p>

      <h2>4. Aktarım ve hizmet sağlayıcılar</h2>
      <p>Veriler aşağıdaki hizmet sağlayıcılar üzerinden işlenir:</p>
      <FactList>
        <Fact label="Veritabanı, kimlik doğrulama, dosya depolama">
          Supabase — <Placeholder>kurumsal unvan, ülke ve veri merkezi bölgesi</Placeholder>
        </Fact>
        <Fact label="E-posta gönderimi">
          Resend — <Placeholder>kurumsal unvan ve ülke</Placeholder>
        </Fact>
        <Fact label="Uygulama barındırma">
          <Placeholder>barındırma sağlayıcısının unvanı ve ülkesi</Placeholder>
        </Fact>
      </FactList>
      <p>
        Bu sağlayıcıların bir bölümü yurt dışında bulunmaktadır; bu durumda aktarım KVKK m. 9
        kapsamında{" "}
        <Placeholder>dayanak: açık rıza / standart sözleşme / yeterlilik kararı</Placeholder>{" "}
        çerçevesinde yapılır. Veriler bunun dışında, hukuken yetkili kamu kurum ve kuruluşları
        haricinde üçüncü kişilerle paylaşılmaz, satılmaz ve reklam amacıyla kullandırılmaz.
      </p>

      <h2>5. Saklama süreleri</h2>
      <FactList>
        <Fact label="Bülten aboneliği">
          Aboneliğiniz sürdüğü sürece; ayrıldıktan sonra <Placeholder>süre — ör. 6 ay</Placeholder>{" "}
          boyunca yeniden abone edilmemesi için saklanır.
        </Fact>
        <Fact label="Okur hesabı ve kaydedilenler">
          Hesabınız açık kaldığı sürece; silme talebinizin ardından{" "}
          <Placeholder>süre — ör. 30 gün</Placeholder> içinde silinir.
        </Fact>
        <Fact label="Sonuçsuz aramalar">
          <Placeholder>süre — ör. 12 ay</Placeholder>
        </Fact>
        <Fact label="Sunucu erişim kayıtları">
          <Placeholder>süre — 5651 s. Kanun kapsamındaki trafik bilgisi süresi</Placeholder>
        </Fact>
      </FactList>

      <h2>6. Haklarınız</h2>
      <p>KVKK m. 11 uyarınca veri sorumlusuna başvurarak şunları talep edebilirsiniz:</p>
      <ul>
        <li>Kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme,</li>
        <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
        <li>Kanundaki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
        <li>
          Düzeltme, silme ve yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,
        </li>
        <li>
          Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç çıkmasına
          itiraz etme,
        </li>
        <li>
          Kanuna aykırı işlenme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.
        </li>
      </ul>
      <p>
        Başvurularınızı <Link href="/iletisim">İletişim</Link> sayfasındaki KVKK adreslerine
        iletebilirsiniz. Başvurular en geç <strong>30 gün</strong> içinde sonuçlandırılır.
        Hesabınızı kendiniz silmek isterseniz <Link href="/kaydedilenler">hesap sayfanızdan</Link>{" "}
        silme talebi oluşturabilirsiniz; talep personel tarafından doğrulanarak yürütülür.
      </p>

      <h2>7. Güvenlik</h2>
      <p>
        Veriler, satır düzeyinde erişim kuralları uygulanan bir veritabanında tutulur: her okur
        yalnızca kendi kaydına erişebilir. Bülten onay bağlantıları veritabanında düz metin olarak
        değil, geri döndürülemez özet (digest) hâlinde saklanır ve tek kullanımlıktır. Site
        üzerindeki tüm trafik TLS ile şifrelenir.
      </p>

      <h2>8. Çocukların verileri</h2>
      <p>
        Site 18 yaşın altındaki kişilere yönelik değildir ve bilerek çocuklardan kişisel veri
        toplanmaz. Böyle bir verinin işlendiğini fark ederseniz bize bildirin; kayıt silinir.
      </p>

      <h2>9. Değişiklikler</h2>
      <p>
        Bu metin güncellenebilir. Yürürlük tarihi: <Placeholder>gg.aa.yyyy</Placeholder>. Esaslı bir
        değişiklikte, bülten abonelerine e-posta ile ayrıca bilgi verilir.
      </p>
    </CorporateDocument>
  );
}

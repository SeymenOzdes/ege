import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Placeholder } from "@/components/site/corporate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "Ege'nin Nabzı'nı kullanırken geçerli olan koşullar: hesap kuralları, telif hakları, sorumluluk sınırları ve uygulanacak hukuk.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function KullanimKosullariPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Kullanım Koşulları"
      lede={`${siteConfig.name} sitesini kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Metin kısa tutuldu: haber okumak için hesap açmanız gerekmiyor, açtığınızda da yalnızca birkaç kural devreye giriyor.`}
      path="/kullanim-kosullari"
    >
      <h2>1. Taraflar ve kapsam</h2>
      <p>
        Bu koşullar, <Placeholder>şirketin tam ticaret unvanı</Placeholder> tarafından işletilen{" "}
        {siteConfig.name} sitesi ile siteyi ziyaret eden kullanıcı arasındaki ilişkiyi düzenler.
        İşletmeciye ilişkin kayıt bilgileri <Link href="/kunye">Künye</Link> sayfasındadır.
      </p>

      <h2>2. Hizmetin tanımı</h2>
      <p>
        Site, Ege Bölgesi&rsquo;nden haber ve içerik yayımlar. Haber okumak ücretsizdir ve hesap
        gerektirmez. Hesap açtığınızda haberleri kaydedebilir, bültene abone olabilirsiniz. Hizmetin
        kapsamı ve özellikleri önceden bildirilmeksizin değiştirilebilir.
      </p>

      <h2>3. Hesap kuralları</h2>
      <ul>
        <li>
          Giriş, e-posta adresinize gönderilen tek kullanımlık bağlantıyla yapılır. Bağlantıyı
          başkasıyla paylaşmayın; hesabınıza erişim sağlar.
        </li>
        <li>Hesap, gerçek ve geçerli bir e-posta adresiyle açılır.</li>
        <li>Bir kişi adına başkası tarafından hesap açılamaz.</li>
        <li>
          Hesabınızı istediğiniz zaman kapatabilirsiniz; silme talebi hesap sayfanızdan oluşturulur
          ve doğrulandıktan sonra yürütülür.
        </li>
      </ul>

      <h2>4. Yasak kullanımlar</h2>
      <p>Site kullanılırken şunlar yapılamaz:</p>
      <ul>
        <li>
          Sitenin çalışmasını bozacak yoğunlukta otomatik istek göndermek, güvenlik önlemlerini
          aşmaya çalışmak,
        </li>
        <li>
          İçeriği izinsiz kopyalayarak toplu biçimde başka bir mecrada yayımlamak veya veri
          madenciliği amacıyla sistematik olarak toplamak,
        </li>
        <li>Başkasının kişisel verisine ulaşmaya ya da hesabını ele geçirmeye çalışmak,</li>
        <li>Hukuka aykırı, yanıltıcı veya başkasının haklarını ihlal eden amaçlarla kullanmak.</li>
      </ul>

      <h2>5. Telif hakları</h2>
      <p>
        Sitedeki haber metinleri, fotoğraflar, grafikler, logo ve tasarım öğeleri 5846 sayılı Fikir
        ve Sanat Eserleri Kanunu kapsamında korunmaktadır. Kişisel ve ticari olmayan kullanım için
        bağlantı paylaşmak serbesttir. Metnin bütününü ya da önemli bir bölümünü yeniden yayımlamak
        yazılı izin gerektirir; kısa alıntılarda kaynak ve haberin adresi belirtilmelidir.
      </p>
      <p>
        Telif hakkı ihlali bildirimlerinizi <Link href="/iletisim">İletişim</Link> sayfasındaki
        adreslere iletebilirsiniz.
      </p>

      <h2>6. Kullanıcı içeriği</h2>
      <p>
        Site şu anda okur yorumu veya kullanıcı içeriği yayımlamamaktadır. Bize ilettiğiniz haber
        ihbarı ve belgeler, yayımlanmadan önce doğrulanır; ihbarınızın haber yapılacağı garantisi
        verilmez.
      </p>

      <h2>7. Bağlantı verilen siteler</h2>
      <p>
        Haberlerde üçüncü taraf sitelere bağlantı verilebilir. Bu sitelerin içeriğinden ve gizlilik
        uygulamalarından sorumlu değiliz.
      </p>

      <h2>8. Sorumluluğun sınırı</h2>
      <p>
        İçerikler yayımlandıkları tarihteki bilgiye dayanır; sonradan değişen durumlar için
        güncellik garantisi verilmez. Site kesintisiz ve hatasız çalışacağı taahhüdüyle sunulmaz.
        Yayımlanan bilgiye dayanarak alınan kararların sonuçları kullanıcıya aittir. Bu sınırlama,
        kanunun emredici hükümleriyle sorumlu tutulduğumuz hâlleri — özellikle kişilik haklarının
        ihlali ve basın hukukundan doğan sorumluluğu — kapsamaz.
      </p>

      <h2>9. Kişisel veriler</h2>
      <p>
        Kişisel verilerinizin nasıl işlendiği <Link href="/gizlilik">Gizlilik Politikası</Link>,
        çerez kullanımı ise <Link href="/cerezler">Çerez Politikası</Link> sayfasında açıklanmıştır.
        Bu iki metin işbu koşulların ayrılmaz parçasıdır.
      </p>

      <h2>10. Değişiklik</h2>
      <p>
        Koşullar güncellenebilir. Güncel metin daima bu sayfada yayımlanır; esaslı değişiklikler
        yürürlüğe girmeden önce sitede duyurulur. Yürürlük tarihi:{" "}
        <Placeholder>gg.aa.yyyy</Placeholder>.
      </p>

      <h2>11. Uygulanacak hukuk ve yetkili mahkeme</h2>
      <p>
        Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda{" "}
        <Placeholder>yetkili mahkeme ve icra daireleri — ör. İzmir</Placeholder> yetkilidir.
        Tüketici sıfatıyla yaptığınız başvurularda tüketici hakem heyetlerine ve tüketici
        mahkemelerine başvurma hakkınız saklıdır.
      </p>
    </CorporateDocument>
  );
}

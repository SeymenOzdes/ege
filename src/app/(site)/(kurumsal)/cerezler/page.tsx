import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Fact, FactList, Placeholder } from "@/components/site/corporate";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description:
    "Ege'nin Nabzı'nın kullandığı çerezler, ne işe yaradıkları, ne kadar süre saklandıkları ve nasıl silinecekleri.",
  alternates: { canonical: "/cerezler" },
};

export default function CerezlerPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Çerez Politikası"
      lede="Sitede yalnızca sitenin çalışması için zorunlu olan çerezler kullanılıyor. Reklam, izleme ya da davranış analizi çerezi yok — bu yüzden karşınıza bir çerez onay penceresi de çıkmıyor."
      path="/cerezler"
    >
      <h2>Çerez nedir?</h2>
      <p>
        Çerez, ziyaret ettiğiniz sitenin tarayıcınıza bıraktığı küçük bir metin dosyasıdır. Sonraki
        isteklerde tarayıcı bu dosyayı geri gönderir; site de böylece oturumunuzun devam ettiğini
        anlar.
      </p>

      <h2>Bu sitede kullanılan çerezler</h2>
      <p>
        Aşağıdakilerin hepsi <strong>zorunlu çerez</strong> sınıfındadır: kapatılırsa giriş ve haber
        kaydetme çalışmaz. Hiçbiri okuma alışkanlığınızı izlemek ya da reklam göstermek için
        kullanılmaz.
      </p>

      <FactList>
        <Fact label="sb-…-auth-token">
          Oturum çerezi. Giriş yaptıktan sonra kimliğinizi taşır; kimlik doğrulama altyapısı
          (Supabase) tarafından oluşturulur. Çıkış yaptığınızda silinir. Saklama süresi:{" "}
          <Placeholder>oturum belirteci ömrü — Supabase ayarından</Placeholder>.
        </Fact>
        <Fact label="egenin-nabzi-auth-next">
          Giriş sonrası hangi sayfaya döneceğinizi hatırlar. Yalnızca sunucu okuyabilir (
          <code>httpOnly</code>), 15 dakika sonra kendiliğinden düşer.
        </Fact>
        <Fact label="egenin-nabzi-pending-bookmark">
          Giriş yapmadan &ldquo;kaydet&rdquo;e bastığınızda hangi haberi kaydetmek istediğinizi
          tutar; giriş tamamlanınca tüketilip silinir. Yalnızca sunucu okuyabilir, ömrü 15
          dakikadır.
        </Fact>
      </FactList>

      <p>Giriş yapmadan haber okuduğunuzda bu çerezlerin hiçbiri oluşturulmaz.</p>

      <h2>Kullanılmayanlar</h2>
      <ul>
        <li>Reklam ve yeniden hedefleme çerezi yok.</li>
        <li>Sosyal medya piksel&rsquo;i veya paylaşım aracı çerezi yok.</li>
        <li>Üçüncü taraf analitik (ör. ziyaretçi ölçümleme) çerezi yok.</li>
      </ul>
      <p>
        Site içi arama kutusuna yazdığınız ve sonuç dönmeyen aramalar istatistik amacıyla
        kaydedilir; ancak bu kayıt çerez üzerinden değil, doğrudan sunucuda tutulur ve kim aradığı
        bilgisini içermez. Ayrıntısı <Link href="/gizlilik">Gizlilik Politikası</Link> sayfasının
        ikinci bölümünde.
      </p>

      <h2>Diğer tarayıcı depolaması</h2>
      <p>
        Kimlik doğrulama altyapısı, oturum belirtecini tarayıcının yerel depolamasında da tutabilir.
        Bu da çerezler gibi yalnızca oturumun sürmesi içindir ve çıkış yaptığınızda temizlenir.
      </p>

      <h2>Çerezleri nasıl silersiniz?</h2>
      <p>
        Tarayıcınızın ayarlarından bu sitenin çerezlerini silebilir ya da tümüyle
        engelleyebilirsiniz. Engellediğinizde haberleri okumaya devam edebilirsiniz, ancak giriş
        yapamaz ve haber kaydedemezsiniz. Siteden çıkış yapmak da oturum çerezini siler.
      </p>

      <h2>Değişiklikler</h2>
      <p>
        Sitede yeni bir çerez kullanılmaya başlanırsa bu sayfa güncellenir ve zorunlu olmayan bir
        çerez eklendiğinde önceden onayınız istenir. Yürürlük tarihi:{" "}
        <Placeholder>gg.aa.yyyy</Placeholder>.
      </p>
    </CorporateDocument>
  );
}

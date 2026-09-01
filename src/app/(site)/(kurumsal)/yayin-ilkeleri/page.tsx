import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Placeholder } from "@/components/site/corporate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Yayın İlkeleri",
  description:
    "Ege'nin Nabzı'nın haber seçimi, kaynak kullanımı, doğrulama, düzeltme ve reklam ayrımı ilkeleri.",
  alternates: { canonical: "/yayin-ilkeleri" },
};

export default function YayinIlkeleriPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Yayın İlkeleri"
      lede={`${siteConfig.name} bölgesel bir haber sitesidir. Bu sayfa, bir haberin yayına çıkmadan önce hangi ölçütlerden geçtiğini ve hata çıktığında ne yapıldığını okurun da görebilmesi için yazıldı.`}
      path="/yayin-ilkeleri"
    >
      <h2>1. Doğruluk</h2>
      <p>
        Bir bilgi doğrulanmadan yayımlanmaz. Doğrulanamayan ama kamuoyunun bilmesinde yarar görülen
        iddialar, iddia olduğu açıkça belirtilerek ve kaynağı gösterilerek verilir. &ldquo;İddia
        edildi&rdquo; ifadesi doğrulama yükümlülüğünü ortadan kaldırmaz.
      </p>
      <p>
        Haber, mümkün olduğunca birden fazla bağımsız kaynağa dayandırılır. Tek kaynaklı haberde
        kaynağın tekliği okura belirtilir.
      </p>

      <h2>2. Kaynak</h2>
      <ul>
        <li>Kaynağın adı, haberi tehlikeye atmadığı sürece açıkça yazılır.</li>
        <li>
          Kimliğinin gizlenmesini isteyen kaynak korunur; gizlilik sözü verildiyse hiçbir koşulda
          bozulmaz.
        </li>
        <li>
          Başka bir yayın organından alınan bilgi, kaynağı ve bağlantısı belirtilerek verilir;
          alıntı, haberin tamamının yerine geçmez.
        </li>
        <li>
          Resmî kurum açıklamaları da doğrulanması gereken birer iddiadır; olduğu gibi aktarılmaz.
        </li>
      </ul>

      <h2>3. Tarafsızlık ve hakkaniyet</h2>
      <p>
        Hakkında olumsuz iddia bulunan kişi ve kurumlara, yayından önce cevap hakkı tanınır. Cevap
        alınamadıysa bu durum haberde belirtilir ve cevap sonradan geldiğinde habere eklenir.
      </p>
      <p>
        Başlık, haberin içeriğiyle uyumlu olmak zorundadır. Tıklama artırmak için abartılı, eksik
        bırakılmış ya da haberin desteklemediği başlık kullanılmaz.
      </p>

      <h2>4. Kişilik hakları ve mağdurlar</h2>
      <ul>
        <li>Çocukların kimliği, suç mağduru ya da faili olsun, açıklanmaz.</li>
        <li>
          Cinsel saldırı ve aile içi şiddet haberlerinde mağdurun kimliğine ulaşmayı sağlayacak
          ayrıntılara yer verilmez.
        </li>
        <li>
          İntihar haberleri yöntem ayrıntısı verilmeden, Dünya Sağlık Örgütü&rsquo;nün medya
          önerilerine uygun biçimde ve destek hattı bilgisiyle birlikte verilir.
        </li>
        <li>
          Kesinleşmiş mahkeme kararı olmadan hiç kimse suçlu olarak nitelenmez; masumiyet karinesi
          dille de korunur.
        </li>
      </ul>

      <h2>5. Ayrımcılık ve nefret söylemi</h2>
      <p>
        Dil, ırk, etnik köken, cinsiyet, cinsel yönelim, engellilik, din, mezhep, siyasi görüş ve
        sosyoekonomik durum üzerinden aşağılayıcı, damgalayıcı ya da genelleyici dil kullanılmaz.
        Haber değeri taşımadığı sürece kişinin bu özellikleri habere konu edilmez.
      </p>

      <h2>6. Görsel kullanımı</h2>
      <p>
        Yayımlanan her görselin kaynağı ve kullanım izni kayıt altındadır; telifli görsel izinsiz
        kullanılmaz. Görselde içeriği değiştiren bir müdahale yapılmaz; kırpma, renk ve pozlama
        dışındaki düzenlemeler künyede belirtilir. Arşiv görseli kullanıldığında &ldquo;arşiv&rdquo;
        olduğu yazılır.
      </p>

      <h2>7. Reklam ile haberin ayrımı</h2>
      <p>
        Reklam, sponsorlu içerik ve iş birlikleri haber akışında açıkça etiketlenir; haber gibi
        görünen reklam yayımlanmaz. Reklam veren, yayın kararlarına karışmaz.
      </p>

      <h2>8. Çıkar çatışması</h2>
      <p>
        Muhabir ve editörler, haberini yaptıkları kişi ve kurumlarla aralarındaki maddi ya da
        kişisel ilişkiyi yayın yönetimine bildirir. Böyle bir ilişki varsa haber başka bir kişiye
        devredilir ya da ilişki haberde açıklanır.
      </p>

      <h2>9. Yapay zekâ kullanımı</h2>
      <p>
        Haber metni insan tarafından yazılır ve bir editör tarafından okunur. Yapay zekâ araçları
        yalnızca çeviri, deşifre ve arşiv taraması gibi yardımcı işlerde kullanılabilir; bu durumda
        da doğrulama sorumluluğu insana aittir. Yapay zekâ ile üretilmiş görsel kullanılmaz.
      </p>

      <h2>10. Hata ve düzeltme</h2>
      <p>
        Hata gizlenmez. Yayımlanmış bir haberdeki maddi hata düzeltilir ve düzeltme, haberin altında
        kalıcı olarak görünür. Süreç ve başvuru yolu <Link href="/duzeltmeler">Düzeltmeler</Link>{" "}
        sayfasında.
      </p>

      <h2>11. Uyulan meslek ilkeleri</h2>
      <p>
        Bu ilkeler, <Placeholder>bağlı olunan meslek örgütü / imzalanan bildirge</Placeholder>{" "}
        metinlerini esas alır. İlkelere aykırı bir yayın gördüğünüzde{" "}
        <Link href="/iletisim">İletişim</Link> sayfasındaki kanallardan bize yazabilirsiniz.
      </p>

      <h2>Yürürlük</h2>
      <p>
        Bu metnin yürürlük tarihi: <Placeholder>gg.aa.yyyy</Placeholder>. Değişiklikler bu sayfada
        yayımlanır.
      </p>
    </CorporateDocument>
  );
}

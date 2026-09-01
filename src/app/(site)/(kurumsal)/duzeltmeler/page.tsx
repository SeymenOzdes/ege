import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Fact, FactList, Placeholder } from "@/components/site/corporate";

export const metadata: Metadata = {
  title: "Düzeltmeler",
  description:
    "Ege'nin Nabzı'nda hatanın nasıl düzeltildiği, düzeltme ve cevap hakkı başvurusunun nasıl yapılacağı.",
  alternates: { canonical: "/duzeltmeler" },
};

export default function DuzeltmelerPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Düzeltmeler"
      lede="Her haber merkezi hata yapar; ayrım, hatanın ne kadar hızlı ve ne kadar görünür biçimde düzeltildiğindedir. Bu sayfa, bir hatayı bize nasıl bildireceğinizi ve düzeltmenin sitede nasıl göründüğünü anlatır."
      path="/duzeltmeler"
    >
      <h2>Düzeltme nasıl bildirilir?</h2>
      <p>
        Bir haberde maddi hata gördüyseniz — yanlış isim, tarih, rakam, yer ya da bağlamından
        koparılmış bir alıntı — aşağıdaki adrese yazın. Bildirimin işleme alınabilmesi için şunlara
        ihtiyacımız var:
      </p>
      <ul>
        <li>Haberin adresi (bağlantı) ve başlığı,</li>
        <li>Hatalı olduğunu düşündüğünüz cümle ya da bölüm,</li>
        <li>Doğrusunun ne olduğu ve varsa dayanağınız,</li>
        <li>Size dönebileceğimiz bir e-posta adresi.</li>
      </ul>
      <FactList>
        <Fact label="Düzeltme e-postası">
          <Placeholder>duzeltme@… adresi</Placeholder>
        </Fact>
        <Fact label="Telefon">
          <Placeholder>+90 …</Placeholder>
        </Fact>
        <Fact label="Yanıt süresi">
          Başvurular en geç <Placeholder>süre — ör. 3 iş günü</Placeholder> içinde değerlendirilir.
        </Fact>
      </FactList>

      <h2>Süreç</h2>
      <ol>
        <li>Bildirim haber merkezine ulaşır ve haberi hazırlayan editöre iletilir.</li>
        <li>
          İddia, haberin kaynaklarına dönülerek kontrol edilir. Gerekirse ilgili kişi ve kurumlara
          yeniden başvurulur.
        </li>
        <li>
          Hata doğrulanırsa metin düzeltilir ve haberin altına ne değiştiği, ne zaman değiştirildiği
          yazılır.
        </li>
        <li>Hata doğrulanmazsa başvurana gerekçesiyle birlikte yanıt verilir.</li>
      </ol>

      <h2>Düzeltme sitede nasıl görünür?</h2>
      <p>
        Düzeltilen haberin sonunda <strong>Şeffaflık notu</strong> başlıklı bir bölüm açılır ve
        düzeltmenin içeriği orada kalıcı olarak durur. Haber sessizce değiştirilmez; yayımlanmış bir
        metinden düzeltme notu sonradan kaldırılmaz.
      </p>
      <p>
        Yazım yanlışı ve bozuk bağlantı gibi anlamı değiştirmeyen küçük düzeltmeler not
        gerektirmeden yapılır. Haberin sonuç ya da iddiasını değiştiren her düzeltme not edilir.
      </p>
      <p>
        Yayından sonra habere yeni bilgi eklendiğinde de haberin künyesindeki{" "}
        <strong>son güncelleme</strong> tarihi değişir; ilk yayın tarihi olduğu gibi kalır.
      </p>

      <h2>Cevap ve düzeltme hakkı</h2>
      <p>
        Basın Kanunu&rsquo;nun 14. maddesi kapsamındaki cevap ve düzeltme talepleri, yazılı olarak{" "}
        <Link href="/kunye">Künye</Link> sayfasındaki tebligat adresine ya da KEP adresine
        yapılmalıdır. Bu tür başvurular yasal süreleri içinde değerlendirilir.
      </p>

      <h2>Haberin kaldırılması talepleri</h2>
      <p>
        Kişilik hakkı ihlali veya erişimin engellenmesi talepleri de{" "}
        <Link href="/kunye">Künye</Link> sayfasındaki tebligat adresine yapılır. Doğru bir haber,
        yalnızca ilgilisinin talebi üzerine yayından kaldırılmaz; talep, kamu yararı ile kişilik
        hakkı arasında tartılarak değerlendirilir ve sonucu başvurana yazılı olarak bildirilir.
      </p>

      <h2>Yayımlanan düzeltmeler</h2>
      <p>
        Düzeltmeler, ait oldukları haberin altında yayımlanır. Bütün düzeltmeleri tek listede
        gösteren bir arşiv sayfası henüz yok; hazırlandığında bu bölümden bağlanacak.
      </p>
    </CorporateDocument>
  );
}

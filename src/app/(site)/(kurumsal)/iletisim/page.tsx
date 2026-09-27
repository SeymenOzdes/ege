import type { Metadata } from "next";
import Link from "next/link";
import {
  CorporateDocument,
  Fact,
  FactList,
  MailLink,
  PhoneLink,
} from "@/components/site/corporate";
import { corporateInfo } from "@/lib/corporate-info";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Ege'nin Nabzı haber merkezi, düzeltme, reklam ve kişisel veri başvuruları için iletişim kanalları.",
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="İletişim"
      lede="Haber ihbarı, düzeltme talebi, reklam ya da kişisel veri başvurusu — her biri farklı bir adrese gidiyor. Doğru kanaldan yazarsanız yanıt daha hızlı gelir."
      path="/iletisim"
    >
      <h2>Haber merkezi</h2>
      <p>
        Haber ihbarı, belge paylaşımı ve yayımlanmış bir haberle ilgili görüşleriniz için. Gizli
        kalması gereken bilgileri gönderiyorsanız bunu mesajınızda belirtin; kaynak koruma
        yükümlülüğümüz <Link href="/yayin-ilkeleri">Yayın İlkeleri</Link> sayfasında yazılıdır.
      </p>
      <FactList>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.email.newsroom} />
        </Fact>
        <Fact label="Telefon">
          <PhoneLink number={corporateInfo.phone.newsroom} />
        </Fact>
        <Fact label="Çalışma saatleri">{corporateInfo.hours}</Fact>
      </FactList>

      <h2>Düzeltme ve cevap hakkı</h2>
      <p>
        Bir haberdeki hatayı bildirmek ya da cevap hakkı kullanmak için önce{" "}
        <Link href="/duzeltmeler">Düzeltmeler</Link> sayfasındaki adımlara bakın; başvurunun hangi
        bilgileri içermesi gerektiği orada anlatılıyor.
      </p>
      <FactList>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.email.corrections} />
        </Fact>
      </FactList>

      <h2>Reklam ve iş birlikleri</h2>
      <FactList>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.email.ads} />
        </Fact>
        <Fact label="Telefon">
          <PhoneLink number={corporateInfo.phone.ads} />
        </Fact>
      </FactList>
      <p>
        Reklamın haber içeriğinden nasıl ayrıldığı{" "}
        <Link href="/yayin-ilkeleri">Yayın İlkeleri</Link> sayfasının yedinci maddesinde.
      </p>

      <h2>Kişisel veri başvuruları (KVKK)</h2>
      <p>
        6698 sayılı Kanun&rsquo;un 11. maddesindeki haklarınızı kullanmak için yapacağınız
        başvurular aşağıdaki adreslere yapılır. Başvurunun kapsamı ve yanıt süresi{" "}
        <Link href="/gizlilik">Gizlilik Politikası</Link> sayfasında anlatılıyor.
      </p>
      <FactList>
        <Fact label="Veri sorumlusu">{corporateInfo.legalName}</Fact>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.email.kvkk} />
        </Fact>
        <Fact label="KEP adresi">{corporateInfo.kep}</Fact>
        <Fact label="Yazılı başvuru adresi">{corporateInfo.address}</Fact>
      </FactList>

      <h2>Adres</h2>
      <FactList>
        <Fact label="Yayın merkezi">{corporateInfo.address}</Fact>
        <Fact label="Tebligat / KEP">{corporateInfo.kep}</Fact>
      </FactList>
      <p>
        Yayın sahibi, sorumlu müdür ve ticari kayıt bilgilerinin tamamı{" "}
        <Link href="/kunye">Künye</Link> sayfasındadır.
      </p>

      <h2>Bülten</h2>
      <p>
        Haftalık bültene <Link href="/bulten">Bülten</Link> sayfasından katılabilir, gelen her
        e-postanın altındaki bağlantıyla tek tıkla ayrılabilirsiniz.
      </p>
    </CorporateDocument>
  );
}

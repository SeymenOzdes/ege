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
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Künye",
  description:
    "Ege'nin Nabzı'nın yayın sahibi, sorumlu müdürü, iletişim ve yer sağlayıcı bilgileri.",
  alternates: { canonical: "/kunye" },
};

export default function KunyePage() {
  const { hosting, database, email } = corporateInfo.providers;

  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Künye"
      lede={`${siteConfig.name}, Ege Bölgesi'nden haber yapan bir internet haber sitesidir. Aşağıdaki bilgiler 5651 sayılı Kanun ve Basın Kanunu'nun internet haber siteleri için aradığı künye bilgileridir.`}
      path="/kunye"
    >
      <h2>Yayın sahibi</h2>
      <FactList>
        <Fact label="Ticaret unvanı">{corporateInfo.legalName}</Fact>
        <Fact label="Yayının adı">{siteConfig.name}</Fact>
        <Fact label="Yayın türü">İnternet haber sitesi (süreli yayın)</Fact>
        <Fact label="Yayın dili">Türkçe</Fact>
        <Fact label="Yayın alanı">
          Ege Bölgesi — İzmir, Aydın, Muğla, Manisa, Denizli, Balıkesir
        </Fact>
      </FactList>

      <h2>Sorumlu müdür</h2>
      <p>
        Yayın içeriğinden Basın Kanunu anlamında sorumlu olan kişidir. Bir haberle ilgili hukuki
        başvurular bu kişiye yapılır.
      </p>
      <FactList>
        <Fact label="Sorumlu müdür">{corporateInfo.editor.name}</Fact>
        <Fact label="Sorumlu müdür yardımcısı">{corporateInfo.deputyEditor}</Fact>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.editor.email} />
        </Fact>
      </FactList>

      <h2>İletişim ve tebligat</h2>
      <FactList>
        <Fact label="İşyeri adresi">{corporateInfo.address}</Fact>
        <Fact label="Telefon">
          <PhoneLink number={corporateInfo.phone.general} />
        </Fact>
        <Fact label="E-posta">
          <MailLink address={corporateInfo.email.general} />
        </Fact>
        <Fact label="KEP adresi">{corporateInfo.kep}</Fact>
      </FactList>
      <p>
        Düzeltme ve cevap taleplerinin nasıl işlendiği <Link href="/duzeltmeler">Düzeltmeler</Link>{" "}
        sayfasında, diğer başvuru kanalları <Link href="/iletisim">İletişim</Link> sayfasında
        anlatılıyor.
      </p>

      <h2>Ticari bilgiler</h2>
      <FactList>
        <Fact label="Ticaret sicil no">{corporateInfo.tradeRegistry}</Fact>
        <Fact label="MERSİS no">{corporateInfo.mersis}</Fact>
        <Fact label="Vergi dairesi / no">{corporateInfo.taxOffice}</Fact>
      </FactList>

      <h2>Yer sağlayıcı</h2>
      <p>5651 sayılı Kanun uyarınca sitenin barındırıldığı hizmet sağlayıcılar aşağıdadır.</p>
      <FactList>
        <Fact label="Uygulama barındırma">
          {hosting.name} — {hosting.address}, {hosting.country}
        </Fact>
        <Fact label="Veritabanı ve dosya depolama">
          {database.name} — {database.address}, {database.country}
        </Fact>
        <Fact label="E-posta gönderimi">
          {email.name} — {email.address}, {email.country}
        </Fact>
      </FactList>

      <h2>Yayın ilkeleri</h2>
      <p>
        Haberlerin nasıl hazırlandığı, hangi kaynak ve doğrulama ölçütlerine uyulduğu ve hatanın
        nasıl düzeltildiği <Link href="/yayin-ilkeleri">Yayın İlkeleri</Link> sayfasında yazılıdır.
        Kişisel verilerin işlenmesine ilişkin aydınlatma metni{" "}
        <Link href="/gizlilik">Gizlilik Politikası</Link> sayfasındadır.
      </p>
    </CorporateDocument>
  );
}

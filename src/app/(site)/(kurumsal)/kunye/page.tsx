import type { Metadata } from "next";
import Link from "next/link";
import { CorporateDocument, Fact, FactList, Placeholder } from "@/components/site/corporate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Künye",
  description:
    "Ege'nin Nabzı'nın yayın sahibi, sorumlu müdürü, iletişim ve yer sağlayıcı bilgileri.",
  alternates: { canonical: "/kunye" },
};

export default function KunyePage() {
  return (
    <CorporateDocument
      eyebrow="Kurumsal"
      title="Künye"
      lede={`${siteConfig.name}, Ege Bölgesi'nden haber yapan bir internet haber sitesidir. Aşağıdaki bilgiler 5651 sayılı Kanun ve Basın Kanunu'nun internet haber siteleri için aradığı künye bilgileridir.`}
      path="/kunye"
    >
      <h2>Yayın sahibi</h2>
      <FactList>
        <Fact label="Ticaret unvanı">
          <Placeholder>şirketin tam ticaret unvanı</Placeholder>
        </Fact>
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
        <Fact label="Sorumlu müdür">
          <Placeholder>ad soyad</Placeholder>
        </Fact>
        <Fact label="Sorumlu müdür yardımcısı">
          <Placeholder>ad soyad — yoksa bu satır silinecek</Placeholder>
        </Fact>
        <Fact label="E-posta">
          <Placeholder>sorumlu müdürün e-posta adresi</Placeholder>
        </Fact>
      </FactList>

      <h2>İletişim ve tebligat</h2>
      <FactList>
        <Fact label="İşyeri adresi">
          <Placeholder>açık adres, mahalle, cadde, no, ilçe, il</Placeholder>
        </Fact>
        <Fact label="Telefon">
          <Placeholder>+90 …</Placeholder>
        </Fact>
        <Fact label="E-posta">
          <Placeholder>genel iletişim e-posta adresi</Placeholder>
        </Fact>
        <Fact label="KEP adresi">
          <Placeholder>kayıtlı elektronik posta adresi</Placeholder>
        </Fact>
      </FactList>
      <p>
        Düzeltme ve cevap taleplerinin nasıl işlendiği <Link href="/duzeltmeler">Düzeltmeler</Link>{" "}
        sayfasında, diğer başvuru kanalları <Link href="/iletisim">İletişim</Link> sayfasında
        anlatılıyor.
      </p>

      <h2>Ticari bilgiler</h2>
      <FactList>
        <Fact label="Ticaret sicil no">
          <Placeholder>ticaret sicil numarası</Placeholder>
        </Fact>
        <Fact label="MERSİS no">
          <Placeholder>MERSİS numarası</Placeholder>
        </Fact>
        <Fact label="Vergi dairesi / no">
          <Placeholder>vergi dairesi ve vergi kimlik numarası</Placeholder>
        </Fact>
      </FactList>

      <h2>Yer sağlayıcı</h2>
      <p>5651 sayılı Kanun uyarınca sitenin barındırıldığı hizmet sağlayıcılar aşağıdadır.</p>
      <FactList>
        <Fact label="Uygulama barındırma">
          <Placeholder>barındırma sağlayıcısının unvanı ve adresi</Placeholder>
        </Fact>
        <Fact label="Veritabanı ve dosya depolama">
          <Placeholder>Supabase kurumsal unvanı ve adresi</Placeholder>
        </Fact>
        <Fact label="E-posta gönderimi">
          <Placeholder>Resend kurumsal unvanı ve adresi</Placeholder>
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

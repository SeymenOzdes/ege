import type { Metadata } from "next";
import { ArticleCard, Badge, Button, LoadingCard, TextInput } from "@/components/site/ui";
import { HomepageState } from "@/components/site/homepage";
import type { ArticlePreview } from "@/lib/homepage";

/**
 * İç tasarım belgesi: herkese açık ama arama sonuçlarında haberlerin arasında
 * görünmesi istenmiyor. `robots.txt` de bu yolu kapatıyor; ikisi birlikte hem
 * taramayı hem dizine girmeyi engelliyor.
 */
export const metadata: Metadata = {
  title: "Stil Rehberi",
  robots: { index: false, follow: false },
};

/**
 * The style guide documents the card component, not the newsroom, so it keeps its
 * own fixture rather than reading the database — a quiet news day must never leave
 * this page blank.
 */
const previewArticle: ArticlePreview = {
  id: "style-guide-preview",
  slug: "izmirin-kiyi-rotalari",
  title: "Körfezin iki yakasında sabah: İzmir'in yeni kıyı rotaları",
  summary:
    "Deniz ulaşımı, yaya yolları ve kıyı yaşamını aynı hatta buluşturan yeni bir kent ritmi.",
  topic: "Kent",
  topicSlug: "gundem",
  location: "İzmir",
  publishedLabel: "09:42",
  readingTime: "4 dk",
  mediaTone: "teal",
};

export default function StyleGuidePage() {
  return (
    <section className="shell-container py-12 sm:py-16">
      <p className="eyebrow text-[var(--color-teal)]">Tasarım sistemi</p>
      <h1 className="font-editorial mt-3 max-w-2xl text-5xl tracking-[-0.05em] sm:text-6xl">
        Sıcak, açık ve akışkan bir haber deneyimi.
      </h1>
      <p className="mt-5 max-w-xl leading-7 text-[var(--color-ink-muted)]">
        Paylaşılan parçalar; okunabilirlik, erişilebilirlik ve her ekranda rahat bir ritim için
        tasarlandı.
      </p>

      <div className="style-grid mt-12">
        <section className="style-panel">
          <h2>Renkler</h2>
          <div className="color-swatches">
            <span className="swatch paper">Fildişi</span>
            <span className="swatch ink">Mürekkep</span>
            <span className="swatch teal">Deniz</span>
            <span className="swatch ochre">Toprak</span>
          </div>
        </section>
        <section className="style-panel">
          <h2>Kontroller</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Haberlere göz at</Button>
            <Button tone="secondary">Daha sonra</Button>
            <Button tone="quiet">Sessiz düğme</Button>
          </div>
          <label className="mt-5 block text-sm font-medium" htmlFor="email">
            E-posta adresi
          </label>
          <div className="mt-2 flex max-w-md gap-2">
            <TextInput id="email" placeholder="ornek@eposta.com" type="email" />
            <Button>Katıl</Button>
          </div>
        </section>
        <section className="style-panel">
          <h2>Etiketler</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>Gündem</Badge>
            <Badge tone="ochre">Öne çıkan</Badge>
            <Badge tone="ink">Son dakika</Badge>
          </div>
        </section>
        <section className="style-panel">
          <h2>Haber kartı</h2>
          <ArticleCard article={previewArticle} variant="topic" />
        </section>
        <section className="style-panel">
          <h2>Medya ve yükleniyor</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="media-frame media-sample">
              <span>Deniz</span>
            </div>
            <LoadingCard />
          </div>
        </section>
        <section className="style-panel">
          <h2>Boş ve hata durumları</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <HomepageState state="empty" />
            <HomepageState state="error" />
          </div>
        </section>
      </div>
    </section>
  );
}

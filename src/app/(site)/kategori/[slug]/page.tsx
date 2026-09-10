import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryArchiveView } from "@/components/site/category-archive";
import { JsonLd } from "@/components/site/json-ld";
import { getArchiveFacets, getCategoryArchive, type CategoryArchive } from "@/lib/archives";
import { archiveMediaTone } from "@/lib/article-preview";
import { breadcrumbJsonLd } from "@/lib/json-ld";
import { parsePageNumber } from "@/lib/pagination";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

function describeKind(kind: "topic" | "location"): string {
  return kind === "topic" ? "Haber dosyası" : "Şehir";
}

/**
 * `/kategori/[slug]` hem haber dosyalarını hem şehirleri karşılıyor. Yedek
 * açıklama bu yüzden türe bakıyor: tek bir "… ilinden" kalıbı, açıklaması
 * girilmemiş bir dosyayı "Ekonomi ilinden güncel haberler" diye tanıtırdı.
 */
function describeArchive(archive: CategoryArchive): string {
  if (archive.description) return archive.description;

  return archive.kind === "topic"
    ? `${archive.name} dosyasından güncel haberler.`
    : `${archive.name} ilinden güncel haberler ve dosyalar.`;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  // `getCategoryArchive` is wrapped in React `cache()`, so this shares the page
  // body's queries rather than hitting the database a second time per request.
  const archive = await getCategoryArchive(slug, parsePageNumber(query.sayfa));

  if (!archive) return {};

  return {
    title: archive.name,
    description: describeArchive(archive),
    alternates: { canonical: `/kategori/${archive.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const archive = await getCategoryArchive(slug, parsePageNumber(query.sayfa));

  // Before the rail, not alongside it. The two reads do not depend on one another,
  // but every crawler hitting a stale or mistyped slug was paying for a topic and a
  // city query whose results `notFound()` then threw away. Nothing is serialised
  // except on the path that renders no rail at all.
  if (!archive) notFound();

  const facets = await getArchiveFacets();

  return (
    <>
      {/* Arama sonucunda "Ana sayfa › Gündem" yolunu gösterir. Sayfa numarası
          bilerek yok: kırıntı yolu arşivin kendisini tanımlıyor, kaçıncı
          sayfasında olunduğunu değil. */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: archive.name, path: `/kategori/${archive.slug}` },
        ])}
      />
      <CategoryArchiveView
        eyebrow={describeKind(archive.kind)}
        title={archive.name}
        description={describeArchive(archive)}
        kind={archive.kind}
        slug={archive.slug}
        tone={archiveMediaTone(archive.kind, archive.slug)}
        entries={archive.page.entries}
        facets={facets}
        basePath={`/kategori/${archive.slug}`}
        currentPage={archive.page.currentPage}
        totalPages={archive.page.totalPages}
        total={archive.page.total}
        loadError={archive.page.loadError}
      />
    </>
  );
}

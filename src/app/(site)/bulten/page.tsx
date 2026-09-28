import type { Metadata } from "next";
import Image from "next/image";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { newsletterNotice } from "@/lib/newsletter/messages";
import izmirKorfezi from "../../../../public/images/bulten-izmir-korfezi.jpg";

export const metadata: Metadata = {
  title: "Bülten",
  description: "Haftada bir kez Ege'den seçilmiş haberler, kültür rotaları ve yerel yaşam notları.",
  alternates: { canonical: "/bulten" },
};

const highlights = [
  { label: "Sıklık", value: "Haftada bir e-posta" },
  { label: "Kapsam", value: "Altı ilden seçilmiş haberler" },
];

type NewsletterPageProps = {
  searchParams: Promise<{ durum?: string | string[] }>;
};

export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const query = await searchParams;
  const notice = newsletterNotice(typeof query.durum === "string" ? query.durum : undefined);

  return (
    <section className="shell-container py-10 sm:py-16">
      {/* Fotoğraf ve form tek bir kartın iki yarısı: aralarında boşluk yok. */}
      <div className="grid overflow-hidden rounded-[var(--radius-media)] border border-[var(--color-line)] bg-white lg:min-h-[46rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <figure className="relative m-0 aspect-[16/10] lg:aspect-auto">
          <Image
            alt="Tepeden İzmir körfezi, Konak kıyısı ve karşı yakadaki dağlar"
            className="object-cover"
            fill
            placeholder="blur"
            priority
            sizes="(max-width: 1023px) calc(100vw - 2rem), 640px"
            src={izmirKorfezi}
          />
          <figcaption className="absolute bottom-0 left-0 bg-[var(--color-ink)] px-3 py-2 text-xs font-semibold tracking-wide text-white">
            İzmir körfezi
          </figcaption>
        </figure>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
          <h1 className="font-editorial text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-[var(--color-ink)] sm:text-[2.6rem]">
            Bölgenin önemli hikâyeleri, haftada bir gelen kutunuzda.
          </h1>

          <dl className="mt-7 grid border-y border-[var(--color-line)] sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                className={`py-3 sm:px-4 ${index > 0 ? "border-t border-[var(--color-line)] sm:border-t-0 sm:border-l" : "sm:pl-0"}`}
                key={item.label}
              >
                <dt className="text-[0.68rem] font-bold tracking-[0.12em] text-[var(--color-ink-muted)] uppercase">
                  {item.label}
                </dt>
                <dd className="m-0 mt-1 text-sm font-semibold text-[var(--color-ink)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          {notice ? (
            <p
              className={`mt-6 rounded-[var(--radius-control)] px-4 py-3 text-sm ${
                notice.tone === "success"
                  ? "bg-[color-mix(in_srgb,var(--color-teal)_12%,white)] text-[var(--color-teal)]"
                  : "bg-red-50 text-red-700"
              }`}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              {notice.text}
            </p>
          ) : null}

          <NewsletterForm className="mt-7" idPrefix="bulten-sayfa" variant="page" />
        </div>
      </div>
    </section>
  );
}

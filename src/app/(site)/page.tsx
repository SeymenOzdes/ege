import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-[var(--color-paper)] px-6 py-6 text-[var(--color-ink)] sm:px-10 lg:px-16">
      <div className="ambient-orb ambient-orb-left" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-right" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-ink)]/10 pb-5">
          <Link className="brand-mark" href="/" aria-label={siteConfig.name}>
            <span className="brand-pulse" aria-hidden="true" />
            <span>{siteConfig.name}</span>
          </Link>
          <span className="eyebrow">Ege Bölgesi Haberleri</span>
        </header>

        <section className="flex flex-1 items-center py-20 sm:py-28 lg:py-36">
          <div className="max-w-4xl">
            <p className="eyebrow mb-6 text-[var(--color-teal)]">Yakında yayında</p>
            <h1 className="font-editorial text-5xl leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              Ege&apos;nin gündemine
              <span className="block text-[var(--color-teal)]">yakından bakıyoruz.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--color-ink-muted)] sm:text-xl">
              {siteConfig.name}, Ege&apos;nin nabzını güvenilir, sakin ve güçlü bir editoryal
              deneyimle tutmak için hazırlanıyor.
            </p>
            <div className="mt-10 flex flex-wrap gap-3" aria-label="Hazırlık kapsamı">
              {["Gündem", "Ekonomi", "Kültür-Sanat", "Yaşam"].map((topic) => (
                <span className="topic-pill" key={topic}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[var(--color-ink)]/10 pt-5 text-sm text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Yeni bir bölgesel haber deneyimi hazırlanıyor.</span>
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
        </footer>
      </div>
    </main>
  );
}

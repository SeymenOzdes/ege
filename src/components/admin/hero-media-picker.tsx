"use client";

import { useState } from "react";
import type { ArticleMediaOption } from "@/lib/admin/articles";

/**
 * Medya kütüphanesinden tek bir görsel seçici.
 *
 * Hem hero hem sosyal medya görseli için kullanılıyor; seçim gizli bir alanla
 * gönderiliyor, böylece `readArticleForm` her iki alanı da aynı biçimde okuyor.
 * Küçük resimler `next/image` yerine `img` ile çiziliyor: `media_assets`
 * satırlarının boyutları isteğe bağlı ve panelde LCP kaygısı yok — medya
 * kütüphanesi sayfası da aynı gerekçeyle böyle.
 */
export function HeroMediaPicker({
  name,
  label,
  description,
  options,
  defaultValue,
}: {
  name: "heroMediaId" | "socialMediaId";
  label: string;
  description: string;
  options: ArticleMediaOption[];
  defaultValue: string | null;
}) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const selected = options.find((option) => option.id === selectedId);

  return (
    <section className="grid gap-3 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
      <input name={name} type="hidden" value={selectedId} />

      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>
      </div>

      {selected ? (
        <div className="flex items-center gap-3 rounded-[14px] border border-[var(--color-line)] bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- boyutlar yükleme anına kadar bilinmiyor. */}
          <img
            alt=""
            className="h-16 w-24 shrink-0 rounded-[10px] bg-[var(--color-paper)] object-cover"
            src={selected.publicUrl}
          />
          <p className="grow text-sm">{selected.altText}</p>
          <button
            className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
            onClick={() => setSelectedId("")}
            type="button"
          >
            Kaldır
          </button>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-ink-muted)]">Henüz görsel seçilmedi.</p>
      )}

      <details className="rounded-[14px] border border-[var(--color-line)] bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
          Kütüphaneden seç
        </summary>
        <div className="border-t border-[var(--color-line)] p-4">
          {options.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Medya kütüphanesi boş. Önce /yonetim/medya sayfasından görsel yükleyin.
            </p>
          ) : (
            <ul className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    aria-pressed={option.id === selectedId}
                    className={`w-full overflow-hidden rounded-[14px] border text-left transition ${
                      option.id === selectedId
                        ? "border-[var(--color-teal)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-teal)]"
                    }`}
                    onClick={() => setSelectedId(option.id)}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- yukarıdaki gerekçe. */}
                    <img
                      alt=""
                      className="aspect-[16/10] w-full bg-[var(--color-paper)] object-cover"
                      src={option.publicUrl}
                    />
                    <span className="block p-2 text-xs leading-5">{option.altText}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}

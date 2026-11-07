"use client";

import { useState } from "react";
import type { ArticleMediaOption } from "@/lib/admin/articles";
import { uploadImage } from "@/lib/media/upload";

/** Alt metin en az 4 karakter olmalı (`media_assets` kaydı); boşsa makul bir yedek. */
function resolveAltText(fallback: string | undefined, file: File) {
  const fromTitle = fallback?.trim() ?? "";
  if (fromTitle.length >= 4) return fromTitle.slice(0, 300);

  const fromName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return fromName.length >= 4 ? fromName.slice(0, 300) : "Haber görseli";
}

/**
 * Tek bir görsel seçici.
 *
 * Görsel doğrudan bilgisayardan yüklenebiliyor ya da kütüphaneden seçilebiliyor;
 * tek kişilik akışta medya sayfasına gidip gelmek gerekmiyor. Yüklenen görselin
 * alt metni haberin başlığından alınıyor. Seçim gizli bir alanla gönderiliyor.
 * Küçük resimler `next/image` yerine `img` ile çiziliyor: `media_assets`
 * satırlarının boyutları isteğe bağlı ve panelde LCP kaygısı yok.
 */
export function HeroMediaPicker({
  name,
  label,
  description,
  options,
  defaultValue,
  fallbackAltText,
}: {
  name: "heroMediaId" | "socialMediaId";
  label: string;
  description: string;
  options: ArticleMediaOption[];
  defaultValue: string | null;
  fallbackAltText?: string;
}) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [uploaded, setUploaded] = useState<ArticleMediaOption[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string>();

  const allOptions = [...uploaded, ...options];
  const selected = allOptions.find((option) => option.id === selectedId);
  const inputId = `${name}-upload`;

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(undefined);

    try {
      const altText = resolveAltText(fallbackAltText, file);
      const result = await uploadImage(file, { altText });

      if (result.ok) {
        setUploaded((current) => [
          { id: result.id, altText, publicUrl: result.publicUrl },
          ...current,
        ]);
        setSelectedId(result.id);
      } else {
        setMessage(result.message);
      }
    } finally {
      setIsUploading(false);
      input.value = "";
    }
  }

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
            className="h-20 w-32 shrink-0 rounded-[10px] bg-[var(--color-paper)] object-cover"
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
      ) : null}

      <label
        className={`grid cursor-pointer place-items-center gap-1 rounded-[14px] border-2 border-dashed border-[var(--color-line)] bg-white px-4 py-6 text-center transition hover:border-[var(--color-teal)] ${
          isUploading ? "cursor-wait opacity-60" : ""
        }`}
        htmlFor={inputId}
      >
        <span className="text-sm font-semibold">
          {isUploading
            ? "Görsel yükleniyor…"
            : selected
              ? "Başka bir görsel yükle"
              : "Bilgisayardan görsel yükle"}
        </span>
        <span className="text-xs text-[var(--color-ink-muted)]">
          JPEG, PNG, WebP veya AVIF · en fazla 10 MB
        </span>
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          disabled={isUploading}
          id={inputId}
          onChange={handleFile}
          type="file"
        />
      </label>

      {message ? (
        <p aria-live="polite" className="text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      {allOptions.length > 0 ? (
        <details className="rounded-[14px] border border-[var(--color-line)] bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
            Kütüphaneden seç
          </summary>
          <div className="border-t border-[var(--color-line)] p-4">
            <ul className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {allOptions.map((option) => (
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
          </div>
        </details>
      ) : null}
    </section>
  );
}

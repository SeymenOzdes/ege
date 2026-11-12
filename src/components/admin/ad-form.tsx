"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdPlacement } from "@/lib/admin/ad-actions";
import { adPlacementInfo, adPlacementKeys, type AdPlacementKey } from "@/lib/ads";
import { uploadImage } from "@/lib/media/upload";

const fieldClass =
  "rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal";

/** `<input type="datetime-local">` değeri tarayıcının yerel saatidir; ISO'ya burada çevrilir. */
function localToIso(value: FormDataEntryValue | null) {
  return typeof value === "string" && value ? new Date(value).toISOString() : "";
}

export function AdForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [placement, setPlacement] = useState<AdPlacementKey>("HOME_LEADER");
  const [message, setMessage] = useState<{ text: string; ok: boolean }>();
  const [isPending, setIsPending] = useState(false);
  const info = adPlacementInfo[placement];

  async function upload(file: FormDataEntryValue | null, sponsor: string) {
    if (!(file instanceof File) || file.size === 0) return { id: "" };
    const result = await uploadImage(file, { altText: `${sponsor} reklamı` });
    return result.ok ? { id: result.id } : { error: result.message };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sponsor = String(form.get("sponsor") ?? "").trim();

    setIsPending(true);
    setMessage(undefined);

    try {
      const desktop = await upload(form.get("desktopFile"), sponsor);
      if (desktop.error) return setMessage({ text: desktop.error, ok: false });
      const mobile = await upload(form.get("mobileFile"), sponsor);
      if (mobile.error) return setMessage({ text: mobile.error, ok: false });
      if (!desktop.id && !mobile.id) {
        return setMessage({ text: "En az bir banner görseli seçin.", ok: false });
      }

      const payload = new FormData();
      payload.set("sponsor", sponsor);
      payload.set("destinationUrl", String(form.get("destinationUrl") ?? ""));
      payload.set("placementKey", placement);
      payload.set("desktopMediaId", desktop.id ?? "");
      payload.set("mobileMediaId", mobile.id ?? "");
      payload.set("startsAt", localToIso(form.get("startsAt")));
      payload.set("endsAt", localToIso(form.get("endsAt")));

      const result = await createAdPlacement(payload);
      if (result.error) return setMessage({ text: result.error, ok: false });

      setMessage({ text: result.success ?? "Reklam kaydedildi.", ok: true });
      formRef.current?.reset();
      setPlacement("HOME_LEADER");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="grid gap-5 rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="eyebrow text-[var(--color-teal)]">Yeni reklam</p>
        <h2 className="font-editorial mt-2 text-3xl">Reklam ekle</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
          Her alanda aynı anda tek reklam gösterilir; birden fazla varsa en yenisi yayınlanır.
          Reklam üstünde otomatik “Reklam” etiketi görünür.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-sponsor">
          Reklam veren
          <input
            className={fieldClass}
            id="ad-sponsor"
            maxLength={120}
            minLength={2}
            name="sponsor"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-url">
          Tıklanınca gidilecek adres
          <input
            className={fieldClass}
            id="ad-url"
            name="destinationUrl"
            placeholder="https://"
            required
            type="url"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-placement">
        Yerleşim
        <select
          className={fieldClass}
          id="ad-placement"
          onChange={(event) => setPlacement(event.target.value as AdPlacementKey)}
          value={placement}
        >
          {adPlacementKeys.map((key) => (
            <option key={key} value={key}>
              {adPlacementInfo[key].label}
            </option>
          ))}
        </select>
        <span className="font-normal text-[var(--color-ink-muted)]">{info.where}</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-desktop">
          Masaüstü banner{" "}
          <span className="font-normal text-[var(--color-ink-muted)]">
            ({info.desktop.width}×{info.desktop.height} px)
          </span>
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={fieldClass}
            id="ad-desktop"
            name="desktopFile"
            type="file"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-mobile">
          Mobil banner{" "}
          <span className="font-normal text-[var(--color-ink-muted)]">
            ({info.mobile.width}×{info.mobile.height} px, isteğe bağlı)
          </span>
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={fieldClass}
            id="ad-mobile"
            name="mobileFile"
            type="file"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-starts">
          Başlangıç <span className="font-normal text-[var(--color-ink-muted)]">(boşsa hemen)</span>
          <input className={fieldClass} id="ad-starts" name="startsAt" type="datetime-local" />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="ad-ends">
          Bitiş <span className="font-normal text-[var(--color-ink-muted)]">(boşsa süresiz)</span>
          <input className={fieldClass} id="ad-ends" name="endsAt" type="datetime-local" />
        </label>
      </div>

      {message ? (
        <p
          aria-live="polite"
          className={`text-sm ${message.ok ? "text-[var(--color-ink-muted)]" : "text-red-700"}`}
        >
          {message.text}
        </p>
      ) : null}

      <button
        className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Kaydediliyor…" : "Reklamı kaydet"}
      </button>
    </form>
  );
}

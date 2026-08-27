"use client";

import { useRef, useState } from "react";
import { registerMediaAsset } from "@/lib/media/actions";
import {
  NEWS_MEDIA_BUCKET,
  createMediaObjectPath,
  getMediaUploadError,
  isSupportedImageMimeType,
} from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type ImageDimensions = { width: number; height: number };

function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_dimensions_failed"));
    };
    image.src = url;
  });
}

export function MediaUploader() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File)) {
      setMessage("Yüklenecek bir görsel seçin.");
      return;
    }

    const validationError = getMediaUploadError(file);
    if (validationError || !isSupportedImageMimeType(file.type)) {
      setMessage(validationError ?? "Dosya türü desteklenmiyor.");
      return;
    }

    setIsPending(true);
    setMessage(undefined);

    try {
      const dimensions = await getImageDimensions(file);
      const objectPath = createMediaObjectPath(file.type, crypto.randomUUID());
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(NEWS_MEDIA_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setMessage("Görsel yüklenemedi. Yetkinizi ve dosyayı kontrol edin.");
        return;
      }

      formData.set("objectPath", objectPath);
      formData.set("mimeType", file.type);
      formData.set("byteSize", String(file.size));
      formData.set("width", String(dimensions.width));
      formData.set("height", String(dimensions.height));
      formData.delete("file");

      const result = await registerMediaAsset(formData);
      setMessage(result.success ?? result.error ?? "Görsel kaydı tamamlanamadı.");
      if (result.success) formRef.current?.reset();
    } catch {
      setMessage("Görsel boyutları okunamadı. Başka bir görsel deneyin.");
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
        <p className="eyebrow text-[var(--color-teal)]">Yeni görsel</p>
        <h2 className="font-editorial mt-2 text-3xl">Medya yükle</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
          JPEG, PNG, WebP veya AVIF; en fazla 10 MB. Dosyalar kalıcı, benzersiz adreslerle saklanır.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-semibold" htmlFor="media-file">
        Görsel dosyası
        <input
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
          id="media-file"
          name="file"
          required
          type="file"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold" htmlFor="media-alt-text">
        Alt metin
        <textarea
          className="min-h-24 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
          id="media-alt-text"
          maxLength={300}
          minLength={4}
          name="altText"
          required
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="media-caption">
          Açıklama <span className="font-normal text-[var(--color-ink-muted)]">(isteğe bağlı)</span>
          <input
            className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
            id="media-caption"
            maxLength={500}
            name="caption"
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="media-credit">
          Kaynak / kredi{" "}
          <span className="font-normal text-[var(--color-ink-muted)]">(isteğe bağlı)</span>
          <input
            className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
            id="media-credit"
            maxLength={300}
            name="credit"
            type="text"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="media-focal-x">
          Odak noktası X
          <input
            className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
            defaultValue="0.5"
            id="media-focal-x"
            max="1"
            min="0"
            name="focalPointX"
            required
            step="0.01"
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="media-focal-y">
          Odak noktası Y
          <input
            className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal"
            defaultValue="0.5"
            id="media-focal-y"
            max="1"
            min="0"
            name="focalPointY"
            required
            step="0.01"
            type="number"
          />
        </label>
      </div>

      {message ? (
        <p aria-live="polite" className="text-sm text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}

      <button
        className="w-fit rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Yükleniyor…" : "Görseli yükle"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { requestAccountDeletion } from "@/lib/bookmarks/actions";

const CONFIRMATION = "SİL";

/**
 * Hesap silme talebi. Silme anında uygulanmaz: talep kaydedilir, personel
 * doğrulayıp yürütür. Yazılı onay, düğmeye yanlışlıkla basılmasını engeller.
 */
export function AccountDeletionForm({ email }: { email?: string }) {
  const [confirmation, setConfirmation] = useState("");
  const canSubmit = confirmation.trim().toLocaleUpperCase("tr-TR") === CONFIRMATION;

  return (
    <section
      aria-labelledby="hesap-silme-basligi"
      className="mt-16 rounded-[24px] border border-[var(--color-line)] bg-white p-6 shadow-sm sm:p-8"
    >
      <p className="eyebrow text-[var(--color-ink-muted)]">Hesabım</p>
      <h2 className="font-editorial mt-2 text-3xl" id="hesap-silme-basligi">
        Hesabımı sil
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--color-ink-muted)]">
        {email ? <strong>{email}</strong> : "Hesabınız"} için silme talebi oluşturur. Talebiniz
        kaydedildikten sonra oturumunuz kapatılır; ekibimiz talebi doğrulayıp hesabınızı ve
        kaydettiğiniz haberleri kalıcı olarak siler.
      </p>

      <form action={requestAccountDeletion} className="mt-6 grid max-w-md gap-4">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="silme-onayi">
          Onaylamak için <code>{CONFIRMATION}</code> yazın
          <input
            autoComplete="off"
            className="text-input font-normal"
            id="silme-onayi"
            name="onay"
            onChange={(event) => setConfirmation(event.target.value)}
            required
            type="text"
            value={confirmation}
          />
        </label>
        <button
          className="button button-secondary justify-self-start disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
          type="submit"
        >
          Silme talebi gönder
        </button>
      </form>
    </section>
  );
}

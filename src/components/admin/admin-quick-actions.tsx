"use client";

import { useState } from "react";
import Link from "next/link";
import { MegaphoneIcon } from "@phosphor-icons/react/dist/ssr/Megaphone";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";

export function AdminQuickActions() {
  const [confirmBreaking, setConfirmBreaking] = useState(false);

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)]"
        href="/yonetim/haberler/yeni"
      >
        <PlusIcon aria-hidden="true" size={17} weight="bold" /> Yeni haber
      </Link>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-[var(--color-teal)] transition hover:bg-[color-mix(in_srgb,var(--color-teal)_10%,white)]"
        onClick={() => setConfirmBreaking(true)}
        type="button"
      >
        <MegaphoneIcon aria-hidden="true" size={17} weight="bold" /> Son dakika
      </button>
      {confirmBreaking ? (
        <div
          aria-labelledby="breaking-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[rgb(13_27_42_/_42%)] p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="eyebrow text-[var(--color-teal)]">Son dakika</p>
            <h2 className="font-editorial mt-2 text-3xl" id="breaking-title">
              Son dakika taslağı açılsın mı?
            </h2>
            <p className="mt-3 leading-6 text-[var(--color-ink-muted)]">
              Taslak, yayınlanmadan önce editoryal inceleme ve onay gerektirir.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-ink-muted)]"
                onClick={() => setConfirmBreaking(false)}
                type="button"
              >
                Vazgeç
              </button>
              <Link
                className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white"
                href="/yonetim/haberler/yeni?breaking=1"
              >
                Taslağı aç
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

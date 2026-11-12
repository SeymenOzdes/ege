"use client";

import { useSyncExternalStore } from "react";

export type AdConsent = "granted" | "denied" | "unset";

const STORAGE_KEY = "egenin-nabzi-ad-consent";
const CHANGE_EVENT = "ad-consent-change";

function read(): AdConsent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    // Depolama kapalıysa tercih saklanamaz; onay yokmuş gibi davranılır.
    return "unset";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Sunucuda ve hidrasyonda `unset`: reklam ve onay penceresi tarayıcıda belirir. */
export function useAdConsent(): AdConsent {
  return useSyncExternalStore(subscribe, read, () => "unset");
}

export function setAdConsent(value: Exclude<AdConsent, "unset"> | "unset") {
  try {
    if (value === "unset") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Saklanamadı; aşağıdaki olay yine de bu oturumdaki bileşenleri günceller.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

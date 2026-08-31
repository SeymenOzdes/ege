export type Notice = { tone: "success" | "error"; text: string };

/**
 * Kaydetme akışının durum kodlarını Türkçe bildirimlere çevirir. `loginNotice`
 * ile aynı model: kodlar sorgu dizesinde taşınır, metin yalnızca burada yaşar.
 */
export function bookmarkNotice(code: string | undefined): Notice | undefined {
  switch (code) {
    case "kaydedildi":
      return { tone: "success", text: "Haber kaydedilenlere eklendi." };
    case "kaldirildi":
      return { tone: "success", text: "Haber kaydedilenlerden çıkarıldı." };
    case "silme_talebi":
      return {
        tone: "success",
        text: "Hesap silme talebiniz alındı. Ekibimiz talebi inceleyip sizinle iletişime geçecek.",
      };
    case "giris_gerekli":
      return { tone: "error", text: "Haberi kaydetmek için önce giriş yapmalısınız." };
    case "bulunamadi":
      return { tone: "error", text: "Bu haber artık yayında değil, kaydedilemedi." };
    case "hata":
      return { tone: "error", text: "Kaydetme işlemi tamamlanamadı. Lütfen tekrar deneyin." };
    default:
      return undefined;
  }
}

/** Sunucu eyleminden dönen hata kodunun kullanıcıya gösterilecek metni. */
export function bookmarkErrorText(code: string | undefined): string {
  return bookmarkNotice(code)?.text ?? bookmarkNotice("hata")!.text;
}

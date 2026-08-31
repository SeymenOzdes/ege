import { describe, expect, it } from "vitest";
import { newsletterNotice } from "@/lib/newsletter/messages";

describe("newsletterNotice", () => {
  it("treats every completed step as a success", () => {
    for (const code of ["onay_bekleniyor", "onaylandi", "ayrildi"]) {
      expect(newsletterNotice(code)?.tone).toBe("success");
    }
  });

  it("treats every rejection as an error", () => {
    for (const code of [
      "gecersiz",
      "gecersiz_eposta",
      "onay_gerekli",
      "gonderilemedi",
      "yapilandirilmadi",
    ]) {
      expect(newsletterNotice(code)?.tone).toBe("error");
    }
  });

  it("ignores unknown and missing codes", () => {
    expect(newsletterNotice(undefined)).toBeUndefined();
    expect(newsletterNotice("durum")).toBeUndefined();
  });

  it("never reveals whether an address is already subscribed", () => {
    // Yeni kayıt, bekleyen kayıt ve onaylı kayıt aynı koda düşer; bu metin
    // hiçbir durumda aboneliğin var olduğunu ima etmemelidir.
    const text = newsletterNotice("onay_bekleniyor")!.text;
    expect(text).not.toMatch(/zaten|kayıtlı|mevcut/i);
  });
});

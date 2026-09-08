import { describe, expect, it } from "vitest";
import { isExternalHref, sanitizeHref } from "@/lib/article-links";

describe("sanitizeHref", () => {
  it("site içi yolu olduğu gibi korur", () => {
    expect(sanitizeHref("/haber/tramvay")).toBe("/haber/tramvay");
    expect(sanitizeHref("  /kategori/ekonomi?sayfa=2  ")).toBe("/kategori/ekonomi?sayfa=2");
  });

  it("izin verilen şemaları geçirir, ötekileri düşürür", () => {
    expect(sanitizeHref("https://ege.dev")).toBe("https://ege.dev");
    expect(sanitizeHref("mailto:haber@ege.dev")).toBe("mailto:haber@ege.dev");
    expect(sanitizeHref("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeHref("data:text/html,<script>")).toBeUndefined();
    expect(sanitizeHref("//baska-site.com")).toBeUndefined();
    expect(sanitizeHref("")).toBeUndefined();
    expect(sanitizeHref(42)).toBeUndefined();
  });

  it("site içi görünüp dışarı çözülen adresleri reddeder", () => {
    // Tarayıcı özel şemalarda "\" karakterini "/" gibi okur: aşağıdakilerin
    // hepsi https://evil.com adresine gider.
    for (const href of ["/\\evil.com", "/\\\\evil.com", "/\\/evil.com", "\\\\evil.com"]) {
      expect(sanitizeHref(href), href).toBeUndefined();
    }

    // Sekme ve satır sonu ayrıştırmadan önce atılır: "/\t/evil.com" → "//evil.com".
    for (const href of ["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/ha\tber"]) {
      expect(sanitizeHref(href), JSON.stringify(href)).toBeUndefined();
    }
  });

  it("geçen her adres için isExternalHref tarayıcının çözümüyle aynı sonucu verir", () => {
    const candidates = [
      "/haber/tramvay",
      "https://ege.dev/haber",
      "mailto:haber@ege.dev",
      "/\\evil.com",
      "/\t/evil.com",
      "//evil.com",
    ];

    for (const candidate of candidates) {
      const href = sanitizeHref(candidate);
      if (!href) continue;

      const resolved = new URL(href, "https://egenin-nabzi.test");
      const staysOnSite = resolved.origin === "https://egenin-nabzi.test";
      expect(isExternalHref(href), href).toBe(!staysOnSite);
    }
  });
});

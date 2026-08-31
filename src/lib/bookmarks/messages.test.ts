import { describe, expect, it } from "vitest";
import { bookmarkErrorText, bookmarkNotice } from "@/lib/bookmarks/messages";

describe("bookmarkNotice", () => {
  it("returns a success tone for completed actions", () => {
    expect(bookmarkNotice("kaydedildi")?.tone).toBe("success");
    expect(bookmarkNotice("kaldirildi")?.tone).toBe("success");
    expect(bookmarkNotice("silme_talebi")?.tone).toBe("success");
  });

  it("returns an error tone for failures", () => {
    expect(bookmarkNotice("giris_gerekli")?.tone).toBe("error");
    expect(bookmarkNotice("bulunamadi")?.tone).toBe("error");
    expect(bookmarkNotice("hata")?.tone).toBe("error");
  });

  it("ignores unknown and missing codes", () => {
    expect(bookmarkNotice(undefined)).toBeUndefined();
    expect(bookmarkNotice("<script>")).toBeUndefined();
  });

  it("writes every message in Turkish", () => {
    expect(bookmarkNotice("kaydedildi")?.text).toContain("kaydedilenlere");
    expect(bookmarkNotice("giris_gerekli")?.text).toContain("giriş");
  });
});

describe("bookmarkErrorText", () => {
  it("falls back to the generic failure message for unknown codes", () => {
    expect(bookmarkErrorText(undefined)).toBe(bookmarkNotice("hata")!.text);
    expect(bookmarkErrorText("beklenmeyen")).toBe(bookmarkNotice("hata")!.text);
  });

  it("keeps a specific message when one exists", () => {
    expect(bookmarkErrorText("bulunamadi")).toBe(bookmarkNotice("bulunamadi")!.text);
  });
});

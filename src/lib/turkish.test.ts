import { describe, expect, it } from "vitest";
import { normalizeTurkish } from "@/lib/turkish";

describe("normalizeTurkish", () => {
  it("lowercases with Turkish casing rules (I → ı, İ → i)", () => {
    expect(normalizeTurkish("IZMIR")).toBe(normalizeTurkish("İzmir"));
    expect(normalizeTurkish("İZMİR")).toBe(normalizeTurkish("izmir"));
  });

  it("folds diacritics so ASCII input matches Turkish text", () => {
    expect(normalizeTurkish("zeytin")).toBe(normalizeTurkish("ZeytİN"));
    expect(normalizeTurkish("kultur-sanat")).toBe(normalizeTurkish("Kültür-Sanat"));
  });

  it("collapses whitespace", () => {
    expect(normalizeTurkish("  izmir   körfez ")).toBe("izmir korfez");
  });
});

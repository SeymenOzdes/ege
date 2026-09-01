import { describe, expect, it } from "vitest";
import { normalizeArchiveSlug, parsePageNumber } from "@/lib/pagination";

// The archive adapters now page inside PostgreSQL, so their behaviour is verified
// end-to-end against the seeded local stack (`pnpm test:e2e`) rather than by
// mocking the Supabase client. What stays unit-testable is the slug and query
// normalization that guards those queries.

describe("parsePageNumber", () => {
  it("normalizes raw query values defensively", () => {
    expect(parsePageNumber(undefined)).toBe(1);
    expect(parsePageNumber("")).toBe(1);
    expect(parsePageNumber("abc")).toBe(1);
    expect(parsePageNumber("-4")).toBe(1);
    expect(parsePageNumber("0")).toBe(1);
    expect(parsePageNumber("3")).toBe(3);
  });

  it("caps absurd page numbers so a crawler cannot drive huge offsets", () => {
    expect(parsePageNumber("10000")).toBe(10_000);
    expect(parsePageNumber("10001")).toBe(1);
  });
});

describe("normalizeArchiveSlug", () => {
  it("keeps Turkish route segments case-insensitive", () => {
    expect(normalizeArchiveSlug("YASAM")).toBe("yasam");
    expect(normalizeArchiveSlug("ELIF-DEMIR")).toBe("elif-demir");
    expect(normalizeArchiveSlug("gundem")).toBe("gundem");
  });
});

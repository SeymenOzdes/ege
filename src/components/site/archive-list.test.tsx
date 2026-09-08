import { describe, expect, it } from "vitest";
import { buildPagerItems } from "@/components/site/archive-list";

// The pager used to emit one link per page, so a growing archive turned every
// /son-dakika, /kategori/*, /yazar/* and /arama page into a hundred-link list.
// These cases pin the windowing that replaced it.

describe("buildPagerItems", () => {
  it("lists every page while the archive is short enough to fit", () => {
    expect(buildPagerItems(1, 1)).toEqual([1]);
    expect(buildPagerItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPagerItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("elides the middle of a long archive", () => {
    expect(buildPagerItems(1, 100)).toEqual([1, 2, 3, "gap", 100]);
    expect(buildPagerItems(50, 100)).toEqual([1, "gap", 48, 49, 50, 51, 52, "gap", 100]);
    expect(buildPagerItems(100, 100)).toEqual([1, "gap", 98, 99, 100]);
  });

  it("keeps the first and last page reachable from anywhere", () => {
    for (const totalPages of [8, 25, 100, 999]) {
      for (const currentPage of [1, 2, 5, Math.ceil(totalPages / 2), totalPages]) {
        const items = buildPagerItems(currentPage, totalPages);

        expect(items[0]).toBe(1);
        expect(items.at(-1)).toBe(totalPages);
        expect(items).toContain(currentPage);
      }
    }
  });

  it("caps the rendered list no matter how large the archive grows", () => {
    // first + gap + five windowed pages + gap + last.
    expect(buildPagerItems(500, 1000)).toHaveLength(9);
    expect(buildPagerItems(500, 100_000)).toHaveLength(9);
  });

  it("renders a lone skipped page instead of an ellipsis standing in for it", () => {
    // 1 … 4 would hide only page 2 or 3, which costs the reader a click for nothing.
    expect(buildPagerItems(4, 9)).toEqual([1, 2, 3, 4, 5, 6, "gap", 9]);
    expect(buildPagerItems(5, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("stays ordered and free of duplicates", () => {
    const items = buildPagerItems(3, 40);
    const pages = items.filter((item): item is number => item !== "gap");

    expect(new Set(pages).size).toBe(pages.length);
    expect([...pages].sort((first, second) => first - second)).toEqual(pages);
  });

  it("returns nothing for an empty archive", () => {
    expect(buildPagerItems(1, 0)).toEqual([]);
  });
});

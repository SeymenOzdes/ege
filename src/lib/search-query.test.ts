import { describe, expect, it } from "vitest";
import { SEARCH_QUERY_MAX_LENGTH, buildSearchHref, normalizeSearchQuery } from "@/lib/search-query";

describe("normalizeSearchQuery", () => {
  it("reports an empty state for blank input", () => {
    for (const raw of ["", "   ", undefined, null]) {
      expect(normalizeSearchQuery(raw)).toEqual({ query: "", state: "empty" });
    }
  });

  it("rejects single-character queries", () => {
    expect(normalizeSearchQuery("i")).toEqual({ query: "i", state: "too-short" });
  });

  it("rejects queries past the database length constraint", () => {
    const overlong = "a".repeat(SEARCH_QUERY_MAX_LENGTH + 1);
    expect(normalizeSearchQuery(overlong).state).toBe("too-long");
    expect(normalizeSearchQuery("a".repeat(SEARCH_QUERY_MAX_LENGTH)).state).toBe("ok");
  });

  it("collapses whitespace before validating", () => {
    expect(normalizeSearchQuery("  izmir   körfez  ")).toEqual({
      query: "izmir körfez",
      state: "ok",
    });
  });

  it("keeps Turkish characters intact so they can be echoed back", () => {
    expect(normalizeSearchQuery("Kültür-Sanat").query).toBe("Kültür-Sanat");
  });
});

describe("buildSearchHref", () => {
  it("returns the bare path when nothing is set", () => {
    expect(buildSearchHref({})).toBe("/arama");
  });

  it("encodes Turkish queries", () => {
    expect(buildSearchHref({ query: "İzmir körfez" })).toBe("/arama?q=%C4%B0zmir+k%C3%B6rfez");
  });

  it("leaves page 1 implicit, like the archive pager", () => {
    expect(buildSearchHref({ query: "zeytin", page: 1 })).toBe("/arama?q=zeytin");
    expect(buildSearchHref({ query: "zeytin", page: 3 })).toBe("/arama?q=zeytin&sayfa=3");
  });

  it("round-trips both filters so paging preserves them", () => {
    expect(
      buildSearchHref({ query: "ege", topicSlug: "ekonomi", locationSlug: "izmir", page: 2 }),
    ).toBe("/arama?q=ege&konu=ekonomi&sehir=izmir&sayfa=2");
  });

  it("omits filters that are absent or blank", () => {
    expect(buildSearchHref({ query: "ege", topicSlug: null, locationSlug: "" })).toBe(
      "/arama?q=ege",
    );
  });
});

import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd, ORGANIZATION_ID, siteJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

describe("siteJsonLd", () => {
  it("tek grafikte site ve kurum düğümlerini verir", () => {
    const graph = siteJsonLd()["@graph"] as Record<string, unknown>[];

    expect(graph.map((node) => node["@type"])).toEqual(["WebSite", "NewsMediaOrganization"]);
  });

  it("siteyi yayıncıya `@id` ile bağlar", () => {
    const [website, organization] = siteJsonLd()["@graph"] as Record<string, unknown>[];

    // Bağın kopması sessiz bir hata olurdu: iki geçerli ama ilişkisiz düğüm.
    expect(website.publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(organization["@id"]).toBe(ORGANIZATION_ID);
  });

  it("arama eylemi bildirmez", () => {
    // `/arama` hem `noindex` hem `robots.txt`'de kapalı; önerilmemeli.
    expect(JSON.stringify(siteJsonLd())).not.toContain("SearchAction");
  });
});

describe("breadcrumbJsonLd", () => {
  const crumbs = breadcrumbJsonLd([
    { name: "Ana sayfa", path: "/" },
    { name: "Gündem", path: "/kategori/gundem" },
  ]);
  const items = crumbs.itemListElement as Record<string, unknown>[];

  it("konumları birden başlatır", () => {
    expect(items.map((item) => item.position)).toEqual([1, 2]);
  });

  it("ara adımlara mutlak adres verir", () => {
    expect(items[0].item).toBe(new URL("/", siteConfig.url).toString());
  });

  it("son adımı bağlantısız bırakır", () => {
    expect(items[1].item).toBeUndefined();
    // `JSON.stringify` tanımsız alanı attığı için çıktıda alan hiç görünmez.
    expect(JSON.parse(JSON.stringify(items[1]))).not.toHaveProperty("item");
  });
});

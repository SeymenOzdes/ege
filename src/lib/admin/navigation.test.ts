import { describe, expect, it } from "vitest";
import { getActiveAdminHref, getAdminNavigation, getAdminPageTitle } from "@/lib/admin/navigation";

describe("admin navigation", () => {
  it("keeps administrator-only destinations out of the editor navigation", () => {
    expect(getAdminNavigation("EDITOR").some((item) => item.href === "/yonetim/anasayfa")).toBe(
      false,
    );
    expect(getAdminNavigation("ADMIN").some((item) => item.href === "/yonetim/anasayfa")).toBe(
      true,
    );
  });

  it("resolves nested routes to their relevant administration section", () => {
    expect(getAdminPageTitle("/yonetim/haberler/yeni")).toBe("Yeni haber");
    expect(getAdminPageTitle("/yonetim/medya")).toBe("Medya");
  });

  it("marks exactly one destination active for a nested route", () => {
    // "/yonetim/haberler/yeni" hem "Yeni haber"e tam hem "Haberler"e önek
    // olarak uyar; menüde ikisinin birden basılı görünmemesi gerekir.
    expect(getActiveAdminHref("/yonetim/haberler/yeni")).toBe("/yonetim/haberler/yeni");
    expect(getActiveAdminHref("/yonetim/haberler")).toBe("/yonetim/haberler");
  });

  it("keeps the dashboard highlighted only on its own route", () => {
    expect(getActiveAdminHref("/yonetim")).toBe("/yonetim");
    expect(getActiveAdminHref("/yonetim/medya")).toBe("/yonetim/medya");
    expect(getActiveAdminHref("/yonetim/aboneler")).toBe("/yonetim/aboneler");
  });

  it("resolves a deeper article route to its section", () => {
    expect(getActiveAdminHref("/yonetim/haberler/abc-123")).toBe("/yonetim/haberler");
  });
});

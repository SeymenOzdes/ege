import { describe, expect, it } from "vitest";
import { getAdminNavigation, getAdminPageTitle } from "@/lib/admin/navigation";

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
});

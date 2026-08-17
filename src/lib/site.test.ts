import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  it("exposes the Turkish publication identity", () => {
    expect(siteConfig.name).toBe("Ege'nin Nabzı");
    expect(siteConfig.locale).toBe("tr_TR");
  });

  it("uses a valid absolute application URL", () => {
    expect(() => new URL(siteConfig.url)).not.toThrow();
  });
});

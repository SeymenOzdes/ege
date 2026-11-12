import { afterEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("@/lib/adsense");
}

afterEach(() => vi.unstubAllEnvs());

describe("adsense config", () => {
  it("is fully off without a publisher id", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER", "1234567890");
    const { isAdsenseEnabled, getAdsenseSlot } = await load();

    expect(isAdsenseEnabled).toBe(false);
    expect(getAdsenseSlot("HOME_LEADER")).toBeUndefined();
  });

  it("returns a slot only for placements that have one", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-1234567890123456");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER", "1234567890");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID", "");
    const { isAdsenseEnabled, getAdsenseSlot } = await load();

    expect(isAdsenseEnabled).toBe(true);
    expect(getAdsenseSlot("HOME_LEADER")).toBe("1234567890");
    expect(getAdsenseSlot("ARTICLE_MID")).toBeUndefined();
  });
});

describe("ads.txt", () => {
  it("answers 404 when AdSense is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "");
    vi.resetModules();
    const { GET } = await import("@/app/ads.txt/route");

    expect(GET().status).toBe(404);
  });

  it("writes Google's authorised-seller line with pub-, not ca-pub-", async () => {
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT", "ca-pub-1234567890123456");
    vi.resetModules();
    const { GET } = await import("@/app/ads.txt/route");
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n",
    );
  });
});

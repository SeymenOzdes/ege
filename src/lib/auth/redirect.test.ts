import { describe, expect, it } from "vitest";
import { getSafeRedirectPath, loginNotice } from "@/lib/auth/redirect";

describe("auth redirect safety", () => {
  it("allows only same-site relative destinations", () => {
    expect(getSafeRedirectPath("/yonetim?tab=haberler#yeni")).toBe("/yonetim?tab=haberler#yeni");
  });

  it("rejects external, protocol-relative and backslash destinations", () => {
    expect(getSafeRedirectPath("https://example.com")).toBe("/");
    expect(getSafeRedirectPath("//example.com")).toBe("/");
    expect(getSafeRedirectPath("/%5C%5Cexample.com")).toBe("/");
  });
});

describe("login notices", () => {
  it("maps configured authentication error states to user-safe text", () => {
    expect(loginNotice("link_invalid", undefined)?.tone).toBe("error");
    expect(loginNotice("google_failed", undefined)?.tone).toBe("error");
    expect(loginNotice(undefined, "1")?.tone).toBe("success");
    expect(loginNotice("unexpected", undefined)).toBeUndefined();
  });
});

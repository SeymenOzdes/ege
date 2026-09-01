import { describe, expect, it } from "vitest";
import {
  MAX_MEDIA_BYTES,
  createMediaObjectPath,
  getMediaPublicUrl,
  getMediaUploadError,
  getObjectPosition,
  isSupportedImageMimeType,
} from "@/lib/media";

describe("media upload helpers", () => {
  it("accepts only the configured image MIME types", () => {
    expect(isSupportedImageMimeType("image/jpeg")).toBe(true);
    expect(isSupportedImageMimeType("image/webp")).toBe(true);
    expect(isSupportedImageMimeType("image/gif")).toBe(false);
  });

  it("rejects empty, oversized and unsupported files before uploading", () => {
    expect(getMediaUploadError({ type: "image/gif", size: 10 } as File)).toMatch(/JPEG/);
    expect(getMediaUploadError({ type: "image/png", size: 0 } as File)).toMatch(/Boş/);
    expect(getMediaUploadError({ type: "image/png", size: MAX_MEDIA_BYTES + 1 } as File)).toMatch(
      /10 MB/,
    );
  });

  it("creates date-partitioned immutable paths with an extension derived from the MIME type", () => {
    expect(createMediaObjectPath("image/jpeg", "a1b2", new Date("2026-08-25T12:00:00Z"))).toBe(
      "2026/08/a1b2.jpg",
    );
    expect(createMediaObjectPath("image/avif", "c3d4", new Date("2026-01-01T00:00:00Z"))).toBe(
      "2026/01/c3d4.avif",
    );
  });
});

describe("getMediaPublicUrl", () => {
  it("addresses the object inside the public news-media bucket", () => {
    expect(getMediaPublicUrl("2026/08/a1b2.jpg")).toBe(
      "https://proje.supabase.co/storage/v1/object/public/news-media/2026/08/a1b2.jpg",
    );
  });
});

describe("getObjectPosition", () => {
  it("turns the stored 0–1 focal point into percentages", () => {
    expect(getObjectPosition(0.25, 0.75)).toBe("25% 75%");
  });

  it("centres the crop when the editor never moved the focal point", () => {
    expect(getObjectPosition(null, null)).toBe("50% 50%");
    expect(getObjectPosition(0.4, null)).toBe("40% 50%");
  });

  it("clamps values that fall outside the stored range", () => {
    expect(getObjectPosition(-1, 4)).toBe("0% 100%");
    expect(getObjectPosition(Number.NaN, 0.5)).toBe("50% 50%");
  });
});

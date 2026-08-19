import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeaturedCarousel } from "@/components/site/featured-carousel";
import { getHomepageContent } from "@/lib/homepage";

describe("FeaturedCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances automatically at the configured interval", async () => {
    const { featured } = await getHomepageContent();
    render(<FeaturedCarousel slides={featured} intervalMs={7000} />);

    expect(screen.getByRole("heading", { name: featured[0].title })).toBeVisible();

    act(() => vi.advanceTimersByTime(7000));

    expect(screen.getByRole("heading", { name: featured[1].title })).toBeVisible();
  });

  it("supports manual navigation without rendering a pause control", async () => {
    const { featured } = await getHomepageContent();
    render(<FeaturedCarousel slides={featured} intervalMs={7000} />);

    fireEvent.click(screen.getByRole("button", { name: "Sonraki manşet" }));
    expect(screen.getByRole("heading", { name: featured[1].title })).toBeVisible();

    expect(screen.queryByRole("button", { name: /Otomatik geçişi/ })).not.toBeInTheDocument();
  });

  it("pauses while the carousel is hovered", async () => {
    const { featured } = await getHomepageContent();
    render(<FeaturedCarousel slides={featured} intervalMs={7000} />);

    const carousel = screen.getByRole("region", { name: "Öne çıkan haberler" });
    fireEvent.mouseEnter(carousel);
    act(() => vi.advanceTimersByTime(14000));

    expect(screen.getByRole("heading", { name: featured[0].title })).toBeVisible();
  });

  it("does not autoplay when reduced motion is preferred", async () => {
    const { featured } = await getHomepageContent();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });

    render(<FeaturedCarousel slides={featured} intervalMs={7000} />);
    act(() => vi.advanceTimersByTime(14000));

    expect(screen.getByRole("heading", { name: featured[0].title })).toBeVisible();
  });
});

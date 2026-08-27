"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import type { FeaturedStory } from "@/lib/homepage";
import { MediaSurface } from "@/components/site/article-card";
import styles from "./homepage.module.css";

export function FeaturedCarousel({
  slides,
  intervalMs = 7000,
}: {
  slides: FeaturedStory[];
  intervalMs?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const activeSlide = slides[activeIndex];
  const canAutoPlay =
    slides.length > 1 &&
    !isHovered &&
    !hasFocus &&
    isPageVisible &&
    !prefersReducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    const updateVisibility = () => setIsPageVisible(document.visibilityState === "visible");

    updateMotionPreference();
    updateVisibility();
    mediaQuery.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!canAutoPlay) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [canAutoPlay, intervalMs, slides.length]);

  if (!activeSlide) return null;

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div
      className={styles.carousel}
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Öne çıkan haberler"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!regionRef.current?.contains(event.relatedTarget as Node | null)) setHasFocus(false);
      }}
    >
      <MediaSurface
        tone={activeSlide.mediaTone}
        label={activeSlide.location}
        className={styles.carouselMedia}
      />
      <div className={styles.carouselStory} aria-live="off">
        <h1 className="font-editorial">
          <Link href={`/haber/${activeSlide.slug}`}>{activeSlide.title}</Link>
        </h1>
        <p>{activeSlide.summary}</p>
      </div>

      <div className={styles.carouselArrows}>
        <button type="button" onClick={showPrevious} aria-label="Önceki manşet">
          <CaretLeft aria-hidden="true" size={18} weight="bold" />
        </button>
        <button type="button" onClick={showNext} aria-label="Sonraki manşet">
          <CaretRight aria-hidden="true" size={18} weight="bold" />
        </button>
      </div>

      <div className={styles.carouselDots} aria-label="Manşet seçimi">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.id}
            className={index === activeIndex ? styles.activeDot : undefined}
            aria-label={`${index + 1}. manşeti göster`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => setActiveIndex(index)}
          >
            <span>{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

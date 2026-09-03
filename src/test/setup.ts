import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

/**
 * ProseMirror (TipTap'in çekirdeği) imleci konumlandırmak için ölçüm API'lerini
 * çağırıyor; jsdom bunları uygulamıyor ve editör kurulurken hata veriyor.
 * Sıfır dikdörtgen döndürmek yeterli: testlerde ölçülen bir düzen yok.
 */
const emptyRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

// `posAtCoords`, tıklamanın hangi konuma denk geldiğini bununla soruyor.
Document.prototype.elementFromPoint = () => null;

Range.prototype.getBoundingClientRect = () => emptyRect;
Range.prototype.getClientRects = () =>
  Object.assign([], { item: () => null, length: 0 }) as unknown as DOMRectList;

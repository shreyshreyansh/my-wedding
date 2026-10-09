import { describe, expect, it } from "vitest";
import { initSmoothScroll, smoothScrollIntensity } from "./smoothScroll";

describe("smoothScrollIntensity", () => {
  it.each([
    [1920, 40],
    [1280, 40],
    [1279, 30],
    [768, 30],
    [767, 60],
    [390, 60],
    [389, 30],
    [375, 30],
    [374, 60],
    [360, 60],
    [359, 30]
  ])("matches the reference intensity at %ipx", (width, intensity) => {
    expect(smoothScrollIntensity(width)).toBe(intensity);
  });
});

describe("initSmoothScroll", () => {
  it("installs and completely removes the Lenis lifecycle", () => {
    const cleanup = initSmoothScroll();
    expect(document.documentElement.classList.contains("lenis")).toBe(true);

    cleanup();

    expect(document.documentElement.classList.contains("lenis")).toBe(false);
  });
});

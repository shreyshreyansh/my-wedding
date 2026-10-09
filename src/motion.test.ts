import { describe, expect, it } from "vitest";
import { heroParallaxSpeeds, parallaxOffset, storyScrollRange, timelineRevealDelay, timelineRevealState, wideHeroRevealState } from "./motion";

describe("timelineRevealState", () => {
  it("mirrors the reference card entrances across the center line", () => {
    expect(timelineRevealState(0)).toEqual({ opacity: 0, rotation: -10, x: -60, y: 50 });
    expect(timelineRevealState(1)).toEqual({ opacity: 0, rotation: 10, x: 60, y: 50 });
  });
});

describe("wideHeroRevealState", () => {
  it("matches the reference title entrance states", () => {
    expect(wideHeroRevealState(0)).toEqual({ opacity: 1, rotation: 40, y: 862 });
    expect(wideHeroRevealState(1)).toEqual({ opacity: 1, rotation: 33, y: 785 });
    expect(wideHeroRevealState(2)).toEqual({ opacity: 1, rotation: -40, y: 864 });
  });
});

describe("timelineRevealDelay", () => {
  it("stages the six horizontal cards only on large desktop", () => {
    expect(timelineRevealDelay(5, true)).toBe(1);
    expect(timelineRevealDelay(5, false)).toBe(0);
  });
});

describe("hero parallax", () => {
  it("matches the measured reference speeds", () => {
    expect(heroParallaxSpeeds).toEqual({
      cloud: 170,
      mountain: 150,
      sky: 100,
      sun: 170,
      temple: 110
    });
  });

  it("converts Framer speed values into exact scroll offsets", () => {
    expect(parallaxOffset(807, 170)).toBeCloseTo(-564.9, 5);
    expect(parallaxOffset(807, 150)).toBeCloseTo(-403.5, 5);
    expect(parallaxOffset(807, 110)).toBeCloseTo(-80.7, 5);
    expect(parallaxOffset(807, 100)).toBe(0);
  });
});

describe("storyScrollRange", () => {
  it("uses the original message reveal viewport thresholds", () => {
    expect(storyScrollRange).toEqual({ start: "top 90%", end: "top 10%" });
  });
});

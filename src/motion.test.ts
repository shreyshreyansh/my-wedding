import { describe, expect, it } from "vitest";
import { mobileJourneyParallax, storyScrollRange, timelineRevealDelay, timelineRevealState, wideHeroRevealState } from "./motion";

describe("timelineRevealState", () => {
  it("mirrors the reference card entrances across the center line", () => {
    expect(timelineRevealState(0)).toEqual({ opacity: 0, rotation: -10, x: -60, y: 50 });
    expect(timelineRevealState(1)).toEqual({ opacity: 0, rotation: 10, x: 60, y: 50 });
  });
});

describe("wideHeroRevealState", () => {
  it("starts the large-desktop title below the temple before it rises into place", () => {
    expect(wideHeroRevealState(0)).toMatchObject({ y: 782, scaleX: 1.12, scaleY: 1.94 });
    expect(wideHeroRevealState(2).y).toBe(590);
  });
});

describe("timelineRevealDelay", () => {
  it("stages the six horizontal cards only on large desktop", () => {
    expect(timelineRevealDelay(5, true)).toBe(1);
    expect(timelineRevealDelay(5, false)).toBe(0);
  });
});

describe("mobileJourneyParallax", () => {
  it("moves the journey artwork one pixel for every five pixels scrolled", () => {
    expect(mobileJourneyParallax.distance / mobileJourneyParallax.range).toBe(-.2);
  });
});

describe("storyScrollRange", () => {
  it("uses the original message reveal viewport thresholds", () => {
    expect(storyScrollRange).toEqual({ start: "top 85%", end: "bottom 30%" });
  });
});

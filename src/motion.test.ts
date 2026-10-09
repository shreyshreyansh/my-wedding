import { describe, expect, it } from "vitest";
import {
  heroParallaxSpeeds,
  invitationArrowRevealDistance,
  invitationParallaxSpeeds,
  invitationRevealState,
  invitationRevealSteps,
  invitationRevealTransition,
  motionSpringProgress,
  parallaxOffset,
  storyScrollRange,
  timelineRevealDelay,
  timelineRevealState,
  wideHeroRevealState
} from "./motion";

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

describe("invitation reveal", () => {
  it("matches the reference enter state and low-bounce spring", () => {
    expect(invitationRevealState).toEqual({ opacity: 0, y: 24 });
    expect(invitationRevealTransition).toEqual({
      bounce: .12,
      duration: .65,
      threshold: .15
    });
    expect(invitationParallaxSpeeds).toEqual({ narrow: 120, wide: 110 });
    expect(invitationArrowRevealDistance).toEqual({ narrow: 32, wide: 24 });
  });

  it("reveals the artwork and copy one item at a time", () => {
    expect(invitationRevealSteps).toEqual([
      { key: "ganpati-name", delay: 0 },
      { key: "ganpati-icon", delay: .05 },
      { key: "shri-line", delay: .1 },
      { key: "groom-parents", delay: .15 },
      { key: "invitation-line", delay: .2 },
      { key: "groom-name", delay: .25 },
      { key: "and", delay: .3 },
      { key: "bride-name", delay: .35 },
      { key: "daughter-of", delay: .4 },
      { key: "bride-parents", delay: .45 },
      { key: "events-intro", delay: .5 },
      { key: "events-arrow", delay: .55 }
    ]);
  });

  it("uses Motion's duration-and-bounce curve between the endpoints", () => {
    expect(motionSpringProgress(0)).toBe(0);
    expect(motionSpringProgress(.25)).toBeCloseTo(.6796825725, 8);
    expect(motionSpringProgress(.5)).toBeCloseTo(.9717379891, 8);
    expect(motionSpringProgress(.75)).toBeCloseTo(1.0028983178, 8);
    expect(motionSpringProgress(1)).toBe(1);
  });
});

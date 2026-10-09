import { describe, expect, it } from "vitest";
import { calculateCountdown } from "./countdown";

describe("calculateCountdown", () => {
  it("splits a future date into padded countdown units", () => {
    const now = new Date("2026-08-27T16:58:57+05:30");
    const target = new Date("2026-08-29T18:00:00+05:30");

    expect(calculateCountdown(target, now)).toEqual({
      days: "02",
      hours: "01",
      minutes: "01",
      seconds: "03"
    });
  });

  it("clamps every unit to zero after the celebration begins", () => {
    const target = new Date("2026-08-29T18:00:00+05:30");
    const now = new Date("2026-10-09T12:00:00+05:30");

    expect(calculateCountdown(target, now)).toEqual({
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00"
    });
  });
});

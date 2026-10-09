import { describe, expect, it } from "vitest";
import { createBirdGeometry } from "./BirdFlock";

describe("createBirdGeometry", () => {
  it("recreates the nine-vertex bird mesh used by the reference animation", () => {
    const geometry = createBirdGeometry();
    const position = geometry.getAttribute("position");

    expect(position.count).toBe(9);
    expect(Array.from(position.array).slice(0, 9)).toEqual([0, 0, -1.5, -3, 0, 0, 0, 0, 1.5]);
    expect(geometry.getAttribute("normal").count).toBe(9);
    geometry.dispose();
  });
});

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createFlagPlane, WavingFlag } from "./WavingFlag";

describe("WavingFlag", () => {
  it("creates the same segmented mesh topology as the reference shader", () => {
    const plane = createFlagPlane(2, 1);
    expect(Array.from(plane.vertices)).toEqual([0, 0, .5, 0, 1, 0, 0, 1, .5, 1, 1, 1]);
    expect(Array.from(plane.indices)).toEqual([0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5]);
  });

  it("renders the WebGL canvas hook", () => {
    const { container } = render(<WavingFlag className="hero__waving-flag" />);
    expect(container.querySelector('canvas[data-animation="waving-flag"]')).toBeInTheDocument();
  });
});

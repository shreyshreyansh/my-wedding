import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bellIdleAngle, HangingBell } from "./HangingBell";

describe("HangingBell", () => {
  it("uses the original five-second, 2.5-degree idle wave", () => {
    expect(bellIdleAngle(0)).toBe(0);
    expect(bellIdleAngle(1250)).toBeCloseTo(2.5);
    expect(bellIdleAngle(3750)).toBeCloseTo(-2.5);
  });

  it("renders an interactive bell with the reference artwork", () => {
    const { getByRole } = render(<HangingBell className="hero__bell" file="wide-bell-outer.png" />);
    expect(getByRole("img", { name: "Hanging bell with flowers" })).toBeInTheDocument();
  });
});

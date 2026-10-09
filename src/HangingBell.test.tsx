import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { bellIdleAngle, HangingBell } from "./HangingBell";

describe("HangingBell", () => {
  it("uses the original five-second, 2.5-degree idle wave", () => {
    expect(bellIdleAngle(0)).toBe(0);
    expect(bellIdleAngle(1250)).toBeCloseTo(2.5);
    expect(bellIdleAngle(3750)).toBeCloseTo(-2.5);
  });

  it("keeps decorative fallback text hidden until the bell artwork is ready", () => {
    const { container, getByRole } = render(<HangingBell className="hero__bell" file="wide-bell-outer.png" />);
    const host = getByRole("img", { name: "Hanging bell with flowers" });
    const image = container.querySelector("img")!;

    expect(host).toHaveAttribute("data-image-ready", "false");
    expect(image).toHaveAttribute("alt", "");

    fireEvent.load(image);

    expect(host).toHaveAttribute("data-image-ready", "true");
  });
});

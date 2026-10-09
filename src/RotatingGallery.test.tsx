import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { galleryLayout, galleryRotation, RotatingGallery } from "./RotatingGallery";

describe("RotatingGallery", () => {
  it("uses the reference responsive radii and image sizes", () => {
    expect(galleryLayout(393)).toEqual({ arcRadius: 200, imageSize: 80, galleryHeight: 340 });
    expect(galleryLayout(768)).toEqual({ arcRadius: 340, imageSize: 120, galleryHeight: 540 });
    expect(galleryLayout(1440)).toEqual({ arcRadius: 500, imageSize: 160, galleryHeight: 760 });
  });

  it("maps the reference center offsets to a half rotation", () => {
    expect(galleryRotation(3168, 4020, 852)).toBe(0);
    expect(galleryRotation(3920, 4020, 852)).toBeCloseTo(180, 1);
  });

  it("renders five unique images twice around the wheel", () => {
    const { container } = render(<RotatingGallery />);
    expect(container.querySelectorAll(".rotating-gallery__ray")).toHaveLength(10);
  });
});

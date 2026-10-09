import { afterEach, describe, expect, it, vi } from "vitest";
import { heroAssetUrls, preloadHeroAssets } from "./heroPreload";

class LoadedImage {
  static sources: string[] = [];
  decode = vi.fn().mockResolvedValue(undefined);
  fetchPriority = "auto";
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;

  set src(value: string) {
    LoadedImage.sources.push(value);
    queueMicrotask(() => this.onload?.());
  }
}

afterEach(() => {
  LoadedImage.sources = [];
  vi.unstubAllGlobals();
});

describe("hero preloading", () => {
  it("selects only the hero artwork needed for the active layout", () => {
    expect(heroAssetUrls(393)).toContain("/assets/images/be9b608a683e28b1.webp");
    expect(heroAssetUrls(393)).not.toContain("/assets/images/wide-flag.webp");
    expect(heroAssetUrls(1728)).toContain("/assets/images/wide-flag.webp");
    expect(heroAssetUrls(1728)).toContain("/assets/images/wide-bell-outer.png");
    expect(heroAssetUrls(1728)).not.toContain("/assets/images/be9b608a683e28b1.webp");
  });

  it("loads and decodes every critical hero image before resolving", async () => {
    vi.stubGlobal("Image", LoadedImage);

    await preloadHeroAssets({ viewportWidth: 1728, timeoutMs: 100 });

    expect(LoadedImage.sources).toEqual(heroAssetUrls(1728));
  });
});

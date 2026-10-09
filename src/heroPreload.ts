const image = (name: string) => `/assets/images/${name}`;

const sharedHeroAssets = [
  image("wide-flag-cloth.png")
] as const;

const mobileHeroAssets = [
  image("3a1202a6edfbd91f.webp"),
  image("bad6103adb6c57a4.avif"),
  image("81729a55f42074b9.avif"),
  image("c245028d56191860.webp"),
  image("f28f0c87faf11bce.webp"),
  image("ed390e16966c8d20.webp"),
  image("be9b608a683e28b1.webp"),
  image("7e1a3a5150e03a86.avif"),
  image("22081e683158c046.avif")
] as const;

const desktopHeroAssets = [
  image("wide-hero-sky.webp"),
  image("wide-hero-clouds.webp"),
  image("wide-hero-atmosphere.webp"),
  image("wide-hero-temple.webp"),
  image("wide-hero-foreground.webp"),
  image("wide-hero-journey.webp"),
  image("wide-flag.webp"),
  image("wide-bell-outer.png"),
  image("wide-bell-inner.png")
] as const;

const titleFonts = [
  '400 140px "Miofarin"',
  '400 117px "Brother Signature"'
] as const;

export function heroAssetUrls(viewportWidth: number) {
  return [...sharedHeroAssets, ...(viewportWidth >= 1280 ? desktopHeroAssets : mobileHeroAssets)];
}

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const asset = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      asset.onload = null;
      asset.onerror = null;
      resolve();
    };

    asset.fetchPriority = "high";
    asset.onload = () => {
      if (typeof asset.decode !== "function") {
        finish();
        return;
      }
      void asset.decode().catch(() => undefined).then(finish);
    };
    asset.onerror = finish;
    asset.src = src;
  });
}

function loadFonts() {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  return Promise.allSettled(titleFonts.map((font) => document.fonts.load(font))).then(() => undefined);
}

type HeroPreloadOptions = {
  timeoutMs?: number;
  viewportWidth?: number;
};

export function preloadHeroAssets({
  timeoutMs = 4000,
  viewportWidth = window.innerWidth
}: HeroPreloadOptions = {}) {
  const loads = [...heroAssetUrls(viewportWidth).map(loadImage), loadFonts()];

  return new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, timeoutMs);
    void Promise.allSettled(loads).then(() => {
      window.clearTimeout(timeout);
      resolve();
    });
  });
}

import { expect, test } from "@playwright/test";

test("wheel input eases through the same smooth-scroll lifecycle as the reference", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(true);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(50);

  const sample = await page.evaluate(() => ({
    cloudTransform: getComputedStyle(document.querySelector(".wide-hero__clouds")!).transform,
    isScrolling: document.documentElement.classList.contains("lenis-scrolling"),
    scrollY: window.scrollY
  }));
  expect(sample.isScrolling).toBe(true);
  expect(sample.scrollY).toBeGreaterThan(0);
  expect(sample.scrollY).toBeLessThan(880);
  const cloudTranslateY = Number(sample.cloudTransform.slice(sample.cloudTransform.indexOf("(") + 1, -1).split(",")[5]);
  expect(cloudTranslateY).toBeCloseTo(-.7 * sample.scrollY, 0);
});

test("hero artwork follows the reference parallax speeds", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });
  await page.evaluate(() => window.scrollTo(0, 807));
  await page.waitForTimeout(100);

  const translateY = async (selector: string) => page.locator(selector).evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
  });

  expect(await translateY(".wide-hero__clouds")).toBeCloseTo(-564.9, 0);
  expect(await translateY(".wide-hero__temple")).toBeCloseTo(-564.9, 0);
  expect(await translateY(".wide-hero__foreground")).toBeCloseTo(-403.5, 0);
  expect(await translateY(".wide-hero__journey")).toBeCloseTo(-80.7, 0);
  expect(await translateY(".wide-hero__flag")).toBeCloseTo(-80.7, 0);
  expect(await translateY(".hero__waving-flag")).toBeCloseTo(-80.7, 0);
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(false);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(50);
  expect(await page.evaluate(() => window.scrollY)).toBe(900);
});

test("motion timelines rebuild when the layout crosses the desktop breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(100);

  const transforms = await page.evaluate(() => ({
    backdrop: getComputedStyle(document.querySelector(".wide-invitation__backdrop")!).transform,
    copy: getComputedStyle(document.querySelector(".wide-invitation__copy")!).transform
  }));
  expect(transforms.backdrop).not.toBe("none");
  expect(transforms.copy).not.toBe("none");
});

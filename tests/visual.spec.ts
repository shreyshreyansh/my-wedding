import { expect, test } from "@playwright/test";

type Box = { x: number; y: number; width: number; height: number };

function expectBox(actual: Box, expected: Box, tolerance = .06) {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.width - expected.width)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.height - expected.height)).toBeLessThanOrEqual(tolerance);
}

test("393px composition preserves the measured reference geometry", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(6180);

  const bells = page.locator('[aria-label="Hanging bell with flowers"]:visible');
  expect(await bells.count()).toBe(4);
  const expectedBells = [
    { x: 304.18, y: -.98, width: 51.99, height: 181.02 },
    { x: 33.52, y: -.98, width: 42.99, height: 181.02 },
    { x: 9.55, y: 0, width: 37.02, height: 136.99 },
    { x: 330.63, y: 15.01, width: 46.02, height: 121 }
  ];
  for (let index = 0; index < expectedBells.length; index += 1) {
    const box = await bells.nth(index).boundingBox();
    expect(box).not.toBeNull();
    expectBox(box!, expectedBells[index]);
  }

  expectBox((await page.locator(".hero__flock").boundingBox())!, { x: -2.47, y: -1, width: 398, height: 499 });
  expectBox((await page.locator(".hero__waving-flag").boundingBox())!, { x: 194.3, y: 321.2, width: 36.19, height: 33.59 });
});

test("412px composition uses the reference phone breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 852 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  expectBox((await page.locator(".hero__sky").boundingBox())!, { x: -3.06, y: -.98, width: 418.13, height: 801.99 });
  expectBox((await page.locator(".hero__flowers").boundingBox())!, { x: -9.06, y: 0, width: 430.13, height: 219.72 });
  expectBox((await page.locator(".hero__glow").boundingBox())!, { x: -3.06, y: 89.99, width: 419.13, height: 338.09 });
  expectBox((await page.locator(".hero__mountains").boundingBox())!, { x: -42.06, y: 336, width: 498.13, height: 493.02 });
  expectBox((await page.locator(".hero__walkway").boundingBox())!, { x: -4.06, y: 348, width: 420.13, height: 1531.17 });
  expectBox((await page.locator(".invitation__garden").boundingBox())!, { x: -4.55, y: 1169, width: 420.13, height: 458.32 });
  expectBox((await page.locator(".timeline__garden").boundingBox())!, { x: -4.55, y: 1267, width: 420.13, height: 2093.88 });
  expectBox((await page.locator(".couple__backdrop").boundingBox())!, { x: -4.06, y: 2796.98, width: 420.13, height: 1573.76 });
  expectBox((await page.locator(".couple__photo").boundingBox())!, { x: -3.06, y: 4150, width: 418.13, height: 278.75 });
  expectBox((await page.locator(".guest__backdrop").boundingBox())!, { x: -3.06, y: 4143, width: 418.13, height: 2524.75 });
});

test("469px composition expands the hero artwork without shrinking it", async ({ page }) => {
  await page.setViewportSize({ width: 469, height: 852 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(6180);

  expectBox((await page.locator(".hero__sky").boundingBox())!, { x: 16.85, y: -.98, width: 435.3, height: 801.99 });
  expectBox((await page.locator(".hero__flowers").boundingBox())!, { x: 10.85, y: 0, width: 447.3, height: 228.49 });
  expectBox((await page.locator(".hero__glow").boundingBox())!, { x: 16.85, y: 89.99, width: 436.3, height: 351.95 });
  expectBox((await page.locator(".hero__mountains").boundingBox())!, { x: -22.15, y: 336, width: 515.3, height: 510.02 });
  expectBox((await page.locator(".hero__walkway").boundingBox())!, { x: 15.85, y: 348, width: 437.3, height: 1593.75 });

  expectBox((await page.locator(".hero__name--first").boundingBox())!, { x: 139.81, y: 94, width: 189.38, height: 103.2 });
  expectBox((await page.locator(".hero__and").boundingBox())!, { x: 195.91, y: 156, width: 77.18, height: 85.2 });
  expectBox((await page.locator(".hero__name--second").boundingBox())!, { x: 124.46, y: 211, width: 220.08, height: 103.2 });

  expectBox((await page.locator(".invitation__garden").boundingBox())!, { x: 15.35, y: 1169, width: 437.3, height: 477.05 });
  expectBox((await page.locator(".timeline__garden").boundingBox())!, { x: 15.35, y: 1267, width: 437.3, height: 2179.47 });
  expectBox((await page.locator(".couple__backdrop").boundingBox())!, { x: 15.85, y: 2796.98, width: 437.3, height: 1638.09 });
  expectBox((await page.locator(".couple__photo").boundingBox())!, { x: 16.85, y: 4150, width: 435.3, height: 290.2 });
  expectBox((await page.locator(".guest__backdrop").boundingBox())!, { x: 16.85, y: 4143, width: 435.3, height: 2628.44 });
  expectBox((await page.locator(".finale__elephants").boundingBox())!, { x: 17, y: 5651, width: 435, height: 538.36 });
});

test("1440px composition preserves the measured reference geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(12261);

  const firstBell = page.locator(".hero__bell--wide-1");
  const sixthBell = page.locator(".hero__bell--wide-6");
  expectBox((await firstBell.boundingBox())!, { x: 104, y: 0, width: 200, height: 350 });
  expectBox((await sixthBell.boundingBox())!, { x: 1314, y: 160, width: 200, height: 350 });

  expectBox((await page.locator(".hero__flock").boundingBox())!, { x: -36, y: -15, width: 1515, height: 814 });
  expectBox((await page.locator(".hero__waving-flag").boundingBox())!, { x: 705.34, y: 459, width: 121.2, height: 80.8 });

  const gallery = page.locator(".rotating-gallery");
  expect(await gallery.evaluate((element) => ({
    height: element.clientHeight,
    left: Number.parseFloat(getComputedStyle(element).left),
    top: Number.parseFloat(getComputedStyle(element).top),
    width: element.clientWidth
  }))).toEqual({ height: 760, left: -37, top: 7225, width: 1515 });
});

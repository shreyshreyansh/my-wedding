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
  await page.locator(".site-canvas").waitFor({ state: "visible" });
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
  await page.locator(".site-canvas").waitFor({ state: "visible" });
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
  await page.locator(".site-canvas").waitFor({ state: "visible" });
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

test("waving flag has a visible first-paint fallback on refresh", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");

  const firstPaint = await page.locator(".hero__waving-flag").evaluate((element) => ({
    animationName: getComputedStyle(element).animationName,
    backgroundImage: getComputedStyle(element).backgroundImage,
    opacity: getComputedStyle(element).opacity,
    textureReady: element.getAttribute("data-texture-ready")
  }));

  expect(firstPaint).toEqual({
    animationName: "none",
    backgroundImage: expect.stringContaining("wide-flag-cloth.png"),
    opacity: "1",
    textureReady: "false"
  });

  const readyBackground = await page.locator(".hero__waving-flag").evaluate((element) => {
    element.setAttribute("data-texture-ready", "true");
    return getComputedStyle(element).backgroundImage;
  });
  expect(readyBackground).toBe("none");
});

test("cold loading reveals the pole, cloth, and bells as one hero scene", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  const delayedFiles = ["wide-flag.webp", "wide-flag-cloth.png", "wide-bell-outer.png", "wide-bell-inner.png"];
  await page.route("**/assets/images/*", async (route) => {
    if (delayedFiles.some((file) => route.request().url().endsWith(file))) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    await route.continue();
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  expect(await page.locator(".site-canvas").count()).toBe(0);
  expect(await page.locator('.hanging-bell__body img[alt="Hanging bell"]').count()).toBe(0);

  await page.locator(".site-canvas").waitFor({ state: "visible" });
  expect(await page.locator('.hero__bell[data-image-ready="true"]:visible').count()).toBe(6);
  await expect(page.locator(".wide-hero__flag")).toBeVisible();
  await expect(page.locator(".hero__waving-flag")).toBeVisible();
});

test("the flag pole stays anchored to the temple while the cloth waves", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");

  const mobilePole = page.locator(".hero__flag");
  expect(await mobilePole.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expectBox((await mobilePole.boundingBox())!, { x: 166.99, y: 317, width: 58, height: 61 });

  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");

  const desktopPole = page.locator(".wide-hero__flag");
  expect(await desktopPole.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  expectBox((await desktopPole.boundingBox())!, { x: 749.5, y: 474, width: 225, height: 191 });
});

test("the temple journey artwork masks the lower flag pole", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  const layers = await page.evaluate(() => {
    const pole = document.querySelector(".wide-hero__flag");
    const cloth = document.querySelector(".hero__waving-flag");
    const journey = document.querySelector(".wide-hero__journey");
    if (!(pole instanceof HTMLElement) || !(cloth instanceof HTMLElement) || !(journey instanceof HTMLElement)) {
      throw new Error("Expected wide hero flag layers");
    }

    return {
      clothBeforeJourney: Boolean(cloth.compareDocumentPosition(journey) & Node.DOCUMENT_POSITION_FOLLOWING),
      clothZIndex: getComputedStyle(cloth).zIndex,
      journeyZIndex: getComputedStyle(journey).zIndex,
      poleBeforeJourney: Boolean(pole.compareDocumentPosition(journey) & Node.DOCUMENT_POSITION_FOLLOWING),
      poleZIndex: getComputedStyle(pole).zIndex
    };
  });

  expect(layers).toEqual({
    clothBeforeJourney: true,
    clothZIndex: "9",
    journeyZIndex: "9",
    poleBeforeJourney: true,
    poleZIndex: "9"
  });
});

test("1728px composition uses the full-width desktop reference variant", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ".wide-hero__flag { animation: none !important; }" });

  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(13103);

  expectBox((await page.locator(".site-canvas").boundingBox())!, { x: -6, y: 0, width: 1740, height: 13107 });
  expectBox((await page.locator(".wide-hero__sky").boundingBox())!, { x: -6, y: -2, width: 1740, height: 1403.59 });
  expectBox((await page.locator(".wide-hero__clouds").boundingBox())!, { x: -96, y: -186.73, width: 1920, height: 980.79 });
  expectBox((await page.locator(".wide-hero__atmosphere").boundingBox())!, { x: -6, y: 0, width: 1740, height: 1565 });
  expectBox((await page.locator(".wide-hero__temple").boundingBox())!, { x: 229.52, y: 173, width: 1025.36, height: 870 });
  expectBox((await page.locator(".wide-hero__foreground").boundingBox())!, { x: -6, y: 451, width: 1740, height: 1724.05 });
  expectBox((await page.locator(".wide-hero__journey").boundingBox())!, { x: -6, y: 376, width: 1740, height: 4500 });
  expectBox((await page.locator(".wide-hero__flag").boundingBox())!, { x: 749.5, y: 474, width: 225, height: 191 });
  expectBox((await page.locator(".hero__waving-flag").boundingBox())!, { x: 846.6, y: 502, width: 139.2, height: 92.8 });
  expectBox((await page.locator(".hero__flock").boundingBox())!, { x: -5, y: -17, width: 1740, height: 814 });

  const daughterSpacing = await page.locator(".wide-invitation__relation").evaluate((element) => {
    const relation = element.getBoundingClientRect();
    const parents = document.querySelector(".wide-invitation__parents--second")!.getBoundingClientRect();
    return {
      gap: parents.top - relation.bottom,
      relationHeight: relation.height,
      whiteSpace: getComputedStyle(element).whiteSpace
    };
  });
  expect(daughterSpacing.whiteSpace).toBe("pre");
  expect(daughterSpacing.relationHeight).toBeCloseTo(28.8, 0);
  expect(daughterSpacing.gap).toBeGreaterThan(10);

  const coupleHeading = await page.locator(".couple__heading").boundingBox();
  expect(coupleHeading).not.toBeNull();
  expect(coupleHeading!.width).toBeCloseTo(1203.6, 0);
  expect(coupleHeading!.x + coupleHeading!.width / 2).toBeCloseTo(864, 0);

  expectBox((await page.locator(".wide-couple__portrait").boundingBox())!, { x: 462, y: 6899, width: 804, height: 989.74 });
  expectBox((await page.locator(".rotating-gallery").boundingBox())!, { x: -66.92, y: 7996.28, width: 1852.8, height: 637.44 });
  expectBox((await page.locator(".wide-couple__photo").boundingBox())!, { x: -6, y: 8647, width: 1740, height: 1160 });
  expectBox((await page.locator(".wide-guest__backdrop").boundingBox())!, { x: -122, y: 8627, width: 1972, height: 10414 });
  expectBox((await page.locator(".wide-finale__backdrop").boundingBox())!, { x: -6, y: 11137, width: 1740, height: 2153.46 });

  const locationStyles = await page.locator(".location-card").evaluate((element) => ({
    height: Number.parseFloat(getComputedStyle(element).height),
    left: Number.parseFloat(getComputedStyle(element).left),
    scale: getComputedStyle(element).scale,
    top: Number.parseFloat(getComputedStyle(element).top),
    width: Number.parseFloat(getComputedStyle(element).width)
  }));
  expectBox({ x: locationStyles.left, y: locationStyles.top, width: locationStyles.width, height: locationStyles.height }, { x: 312.31, y: 10023.71, width: 1114.65, height: 453.93 });
  expect(locationStyles.scale).toBe("none");

  const rsvpStyles = await page.locator(".rsvp-card").evaluate((element) => ({
    height: Number.parseFloat(getComputedStyle(element).height),
    left: Number.parseFloat(getComputedStyle(element).left),
    scale: getComputedStyle(element).scale,
    top: Number.parseFloat(getComputedStyle(element).top),
    width: Number.parseFloat(getComputedStyle(element).width)
  }));
  expectBox({ x: rsvpStyles.left, y: rsvpStyles.top, width: rsvpStyles.width, height: rsvpStyles.height }, { x: 555.99, y: 10556.14, width: 627.64, height: 295.72 });
  expect(rsvpStyles.scale).toBe("none");
});

test("wide couple heading stays centered before and after its reveal", async ({ page }) => {
  for (const width of [1440, 1559, 1728, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.locator(".site-canvas").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);

    const entrance = await page.locator(".couple__heading").boundingBox();
    expect(entrance).not.toBeNull();
    expect(entrance!.width).toBeCloseTo(1203.6, 0);
    expect(entrance!.x + entrance!.width / 2).toBeCloseTo(width / 2, 0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".couple__heading")).toHaveCSS("transform", "none");

    const settled = await page.locator(".couple__heading").boundingBox();
    expect(settled).not.toBeNull();
    expect(settled!.width).toBeCloseTo(891.55, 0);
    expect(settled!.x + settled!.width / 2).toBeCloseTo(width / 2, 0);
  }
});

test("desktop breakpoint boundaries preserve their measured reference canvases", async ({ page }) => {
  const cases = [
    { viewport: 1559, scrollHeight: 12261, canvas: { x: 0, y: 0, width: 1559, height: 12261 }, sky: { x: 0, y: -2, width: 1559, height: 1257.58 }, flag: { x: 666.48, y: 396, width: 225, height: 191 }, wave: { x: 763.91, y: 424, width: 124.72, height: 83.14 } },
    { viewport: 1727, scrollHeight: 12261, canvas: { x: 84, y: 0, width: 1559, height: 12261 }, sky: { x: 84, y: -2, width: 1559, height: 1257.58 }, flag: { x: 750.48, y: 396, width: 225, height: 191 }, wave: { x: 847.91, y: 424, width: 124.72, height: 83.14 } },
    { viewport: 1728, scrollHeight: 13103, canvas: { x: -6, y: 0, width: 1740, height: 13107 }, sky: { x: -6, y: -2, width: 1740, height: 1403.59 }, flag: { x: 749.5, y: 474, width: 225, height: 191 }, wave: { x: 846.6, y: 502, width: 139.2, height: 92.8 } },
    { viewport: 1919, scrollHeight: 13103, canvas: { x: 89.5, y: 0, width: 1740, height: 13107 }, sky: { x: 89.5, y: -2, width: 1740, height: 1403.59 }, flag: { x: 845, y: 474, width: 225, height: 191 }, wave: { x: 942.1, y: 502, width: 139.2, height: 92.8 } },
    { viewport: 1920, scrollHeight: 13103, canvas: { x: 0, y: 0, width: 1920, height: 13107 }, sky: { x: 0, y: -2, width: 1920, height: 1548.8 }, flag: { x: 844.5, y: 461, width: 225, height: 191 }, wave: { x: 940.8, y: 489, width: 153.59, height: 102.39 } }
  ];

  for (const expected of cases) {
    await page.setViewportSize({ width: expected.viewport, height: 1000 });
    await page.goto("/");
    await page.locator(".site-canvas").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ".wide-hero__flag { animation: none !important; }" });

    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(expected.scrollHeight);
    expectBox((await page.locator(".site-canvas").boundingBox())!, expected.canvas);
    expectBox((await page.locator(".wide-hero__sky").boundingBox())!, expected.sky);
    expectBox((await page.locator(".wide-hero__flag").boundingBox())!, expected.flag);
    expectBox((await page.locator(".hero__waving-flag").boundingBox())!, expected.wave);

    const heading = await page.locator(".couple__heading").boundingBox();
    expect(heading).not.toBeNull();
    expect(heading!.width).toBeCloseTo(1203.6, 0);
    expect(heading!.x + heading!.width / 2).toBeCloseTo(expected.viewport / 2, 0);
  }
});

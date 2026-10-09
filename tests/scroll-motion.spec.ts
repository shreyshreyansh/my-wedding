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

  const invitationMotion = await page.locator('.wide-invitation__copy [data-invitation-motion="groom-parents"]').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      opacity: styles.opacity,
      parallaxY: styles.getPropertyValue("--invitation-parallax-y").trim(),
      revealY: styles.getPropertyValue("--invitation-reveal-y").trim()
    };
  });
  expect(invitationMotion).toEqual({ opacity: "1", parallaxY: "0px", revealY: "0px" });
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
    copyItemY: Number.parseFloat(getComputedStyle(document.querySelector('.wide-invitation__copy [data-invitation-motion="groom-parents"]')!).getPropertyValue("--invitation-parallax-y"))
  }));
  expect(transforms.backdrop).not.toBe("none");
  expect(transforms.copyItemY).toBeLessThan(0);
});

test("invitation copy reveals in the reference order instead of as one block", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  const item = (key: string) => page.locator(`.wide-invitation__copy [data-invitation-motion="${key}"]`);
  await expect(item("groom-parents")).toHaveCSS("opacity", "0");
  await expect(item("groom-name")).toHaveCSS("opacity", "0");

  await page.evaluate(() => window.scrollTo(0, 1700));
  await page.waitForTimeout(950);

  await expect(item("groom-parents")).toHaveCSS("opacity", "1");
  await expect(item("invitation-line")).toHaveCSS("opacity", "1");
  await expect(item("groom-name")).toHaveCSS("opacity", "0");

  await page.evaluate(() => window.scrollTo(0, 2450));
  await page.waitForTimeout(1200);
  await expect(item("events-intro")).toHaveCSS("opacity", "1");
});

test("invitation copy starts at the reference 15 percent visibility threshold", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  const parents = page.locator('.wide-invitation__copy [data-invitation-motion="groom-parents"]');
  const startScroll = await parents.evaluate((element) => {
    const styles = getComputedStyle(element);
    const revealY = Number.parseFloat(styles.getPropertyValue("--invitation-reveal-y")) || 0;
    const layoutTop = element.getBoundingClientRect().top + window.scrollY - revealY;
    const visibleThreshold = window.innerHeight - (element as HTMLElement).offsetHeight * .15;
    return Math.max(0, (layoutTop - visibleThreshold) / 1.1);
  });

  await page.evaluate((scrollY) => window.scrollTo(0, scrollY - 6), startScroll);
  await page.waitForTimeout(900);
  await expect(parents).toHaveCSS("opacity", "0");

  await page.evaluate((scrollY) => window.scrollTo(0, scrollY + 6), startScroll);
  await page.waitForTimeout(900);
  await expect(parents).toHaveCSS("opacity", "1");
});

test("invitation reveal passes through the reference spring between endpoints", async ({ page }) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });

  const ganpatiName = page.locator('.wide-invitation__scroll[data-invitation-motion="ganpati-name"]');
  const startScroll = await ganpatiName.evaluate((element) => {
    const styles = getComputedStyle(element);
    const revealY = Number.parseFloat(styles.getPropertyValue("--invitation-reveal-y")) || 0;
    const layoutTop = element.getBoundingClientRect().top + window.scrollY - revealY;
    const visibleThreshold = window.innerHeight - (element as HTMLElement).offsetHeight * .15;
    return Math.max(0, (layoutTop - visibleThreshold) / 1.1);
  });
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY + 6), startScroll);
  await page.clock.runFor(325);

  const frame = await ganpatiName.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      opacity: Number.parseFloat(styles.opacity),
      revealY: Number.parseFloat(styles.getPropertyValue("--invitation-reveal-y"))
    };
  });
  expect(frame.opacity).toBeGreaterThan(.94);
  expect(frame.opacity).toBeLessThan(.995);
  expect(frame.revealY).toBeCloseTo(24 * (1 - frame.opacity), 2);
});

test("invitation items use the reference desktop parallax speed", async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 1000 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });
  await page.evaluate(() => window.scrollTo(0, 2450));
  await page.waitForTimeout(1200);

  const parallaxY = await page.locator('.wide-invitation__copy [data-invitation-motion="groom-parents"]').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--invitation-parallax-y"))
  );
  expect(parallaxY).toBeCloseTo(-245, 0);
});

test("invitation items use the reference mobile parallax speed", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.locator(".site-canvas").waitFor({ state: "visible" });
  await page.evaluate(() => window.scrollTo(0, 760));
  await page.waitForTimeout(150);

  const parallaxY = await page.locator('.invitation__copy [data-invitation-motion="groom-parents"]').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).getPropertyValue("--invitation-parallax-y"))
  );
  expect(parallaxY).toBeCloseTo(-152, 0);
});

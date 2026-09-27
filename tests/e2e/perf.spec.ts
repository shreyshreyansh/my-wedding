// A mid-range phone on a busy 4G connection: 6 Mbps, 85 ms, CPU four times slower.
import { expect, test } from '@playwright/test';

test.use({ contextOptions: { reducedMotion: 'no-preference' } });

test('loads fast, holds still, and answers the tap quickly', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 85, downloadThroughput: (6e6 / 8), uploadThroughput: (1.5e6 / 8) });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    const w = window as unknown as { lcp: number; cls: number; events: { name: string; duration: number; id: number }[] };
    w.lcp = 0; w.cls = 0; w.events = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) w.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) w.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    /* interactions only (as INP counts them): hover events fired while the cloth slides under a still pointer don't count */
    new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { interactionId: number })[]) if (e.interactionId) w.events.push({ name: e.name, duration: e.duration, id: e.interactionId }); }).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);
  });
  await page.goto('/?g=abc234', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const { lcp, cls } = await page.evaluate(() => ({ lcp: (window as unknown as { lcp: number }).lcp, cls: (window as unknown as { cls: number }).cls }));
  console.log(`LCP ${lcp.toFixed(0)} ms, CLS ${cls.toFixed(3)}`);
  expect(lcp).toBeLessThan(2500);
  expect(cls).toBeLessThan(0.05);
  await page.locator('#openBtn').click();
  await page.waitForTimeout(1500);
  const events = await page.evaluate(() => (window as unknown as { events: { name: string; duration: number }[] }).events);
  expect(events.length).toBeGreaterThan(0);
  const slowest = Math.max(...events.map((e) => e.duration));
  console.log(`slowest tap response ${slowest.toFixed(0)} ms`);
  expect(slowest).toBeLessThan(200);
});

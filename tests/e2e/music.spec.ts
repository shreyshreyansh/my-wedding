// The couple's recording: play() runs inside the cover tap (or browsers block it), the bell mutes, the mute is remembered.
import { expect, test } from '@playwright/test';
import { openCover } from './helpers';

test('music starts in the tap and the bell remembers a mute', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    (window as unknown as { plays: unknown[] }).plays = [];
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { plays: unknown[] }).plays.push({ inTap: navigator.userActivation?.isActive, coverStillThere: !!document.getElementById('cover') });
      return play.call(this);
    };
  });
  await page.goto('/?g=mus234');
  await expect(page.locator('#controls')).toBeHidden();
  await openCover(page);
  expect(await page.evaluate(() => (window as unknown as { plays: unknown[] }).plays)).toEqual([{ inTap: true, coverStillThere: true }]);
  const bell = page.locator('#bellBtn');
  await expect(bell).toHaveAttribute('data-state', 'on');
  await expect(bell).toHaveAttribute('aria-label', 'Mute the music');
  await bell.click();
  await expect(bell).toHaveAttribute('data-state', 'off');
  await expect(bell).toHaveAttribute('aria-label', 'Play the music');
  await page.reload();
  await openCover(page);
  expect(await page.evaluate(() => (window as unknown as { plays: unknown[] }).plays)).toEqual([]);
  await expect(page.locator('#music')).toHaveJSProperty('paused', true);
});

test('music pauses when the guest switches apps', async ({ page }) => {
  await page.goto('/?g=mus234');
  await page.evaluate(() => localStorage.removeItem('sm-muted'));
  await openCover(page);
  await expect(page.locator('#music')).toHaveJSProperty('paused', false);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('#music')).toHaveJSProperty('paused', true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.locator('#music')).toHaveJSProperty('paused', false);
});

test('the music plays round and round, and the bell stays on screen all the way down', async ({ page }) => {
  await page.goto('/?g=mus234');
  await page.evaluate(() => localStorage.removeItem('sm-muted'));
  await openCover(page);
  await expect(page.locator('#music')).toHaveJSProperty('loop', true);
  for (const y of [0.3, 0.7, 1]) {
    await page.evaluate((f) => scrollTo(0, f * (document.documentElement.scrollHeight - innerHeight)), y);
    await expect(page.locator('#bellBtn')).toBeInViewport();
  }
  await page.locator('#bellBtn').click();
  await expect(page.locator('#music')).toHaveJSProperty('paused', true);
  await page.locator('#bellBtn').click();
  await expect(page.locator('#music')).toHaveJSProperty('paused', false);
});

/* Safari (every browser on an iPhone) asks for bytes=0-1 first and will not play from a server that answers 200 */
test('the music file is served in byte ranges', async ({ request }) => {
  const head = await request.get('/audio/invite.m4a?v=1', { headers: { Range: 'bytes=0-1' } });
  expect(head.status()).toBe(206);
  expect(head.headers()['content-range']).toMatch(/^bytes 0-1\/\d{5,}$/);
  expect((await head.body()).length).toBe(2);
  const size = Number(head.headers()['content-range'].split('/')[1]);
  const tail = await request.get('/audio/invite.m4a?v=1', { headers: { Range: `bytes=${size - 100}-` } });
  expect([tail.status(), (await tail.body()).length]).toEqual([206, 100]);
  const whole = await request.get('/audio/invite.m4a?v=1');
  expect([whole.status(), whole.headers()['accept-ranges'], (await whole.body()).length]).toEqual([200, 'bytes', size]);
});

/* An iPhone (every browser there is Safari underneath) mutes "ambient" page sound when the phone is set to silent. The
   chime used to set that for the whole page, music included, so a phone on silent played the music without a sound. */
test('on an iPhone the music plays as playback, not ambient sound, even though the chime runs too', async ({ page }) => {
  await page.addInitScript(() => { (navigator as unknown as { audioSession: { type: string } }).audioSession = { type: 'auto' }; });
  await page.goto('/?g=mus234');
  await page.evaluate(() => localStorage.removeItem('sm-muted'));
  await page.reload();
  await openCover(page);
  await expect(page.locator('#music')).toHaveJSProperty('paused', false);
  expect(await page.evaluate(() => (navigator as unknown as { audioSession: { type: string } }).audioSession.type)).toBe('playback');
});

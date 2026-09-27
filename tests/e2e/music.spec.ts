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

// The link preview is the same for everyone and names no one; headers keep the page private; calendars are right.
import { expect, test } from '@playwright/test';

const meta = (html: string) => [...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map((m) => m[1] + '=' + m[2]);

test('every guest gets the same preview, and no preview names a family', async ({ request }) => {
  const plain = await (await request.get('/')).text();
  const guest = await (await request.get('/?g=abc234')).text();
  expect(meta(guest)).toEqual(meta(plain));
  const head = guest.slice(0, guest.indexOf('</head>'));
  expect(head).not.toContain('Sharma');
  expect(head).not.toContain('शर्मा');
  expect(plain.indexOf('property="og:image"')).toBeLessThan(4096);
});

test('the page is private: not cached, not indexed, no referrer', async ({ request }) => {
  const res = await request.get('/?g=abc234');
  expect(res.headers()['cache-control']).toBe('private, no-store');
  expect(res.headers()['x-robots-tag']).toContain('noindex');
  expect(res.headers()['referrer-policy']).toBe('no-referrer');
  const img = await request.get('/og/og.jpg');
  expect(img.ok()).toBe(true);
  expect(img.headers()['x-robots-tag']).toContain('noindex');
  expect((await img.body()).length).toBeLessThan(300 * 1024);
  expect((await request.get('/robots.txt')).status()).not.toBe(200);
});

test('calendar files: UTC times, a day-before reminder, served as text/calendar', async ({ request }) => {
  const res = await request.get('/cal/haldi.ics');
  expect(res.headers()['content-type']).toContain('text/calendar');
  const ics = await res.text();
  expect(ics).toContain('DTSTART:20261208T063000Z'); /* 12 noon IST */
  expect(ics).toContain('DTEND:20261208T093000Z');
  expect(ics).toContain('TRIGGER:-P1D');
  expect(ics).toContain('SUMMARY:Haldi · Shreyansh & Mrunalini');
  const shaadi = await (await request.get('/cal/shaadi.ics')).text();
  expect(shaadi).toContain('DTSTART:20261209T143000Z'); /* 8 pm IST */
  expect(shaadi).toContain('DTEND:20261209T183000Z'); /* midnight IST */
});

test('Apple devices get the .ics; others get Google Calendar', async ({ browser }) => {
  const iphone = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', reducedMotion: 'reduce' });
  const p = await iphone.newPage();
  await p.goto('http://127.0.0.1:8788/');
  await expect(p.locator('.rite[data-cal="haldi"]')).toHaveAttribute('href', '/cal/haldi.ics');
  await iphone.close();
  const android = await browser.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36', reducedMotion: 'reduce' });
  const a = await android.newPage();
  await a.goto('http://127.0.0.1:8788/');
  await expect(a.locator('.rite[data-cal="haldi"]')).toHaveAttribute('href', /calendar\.google\.com.*dates=20261208T063000Z\/20261208T093000Z/);
  await android.close();
});

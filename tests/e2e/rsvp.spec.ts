// Replying: to KV and on to the Sheet; the WhatsApp fallback; changing a reply; the closed state.
import { expect, test } from '@playwright/test';
import { LATE, SHEET, openCover, sheetRows } from './helpers';

test('send a reply: it lands in the Sheet, and the page remembers it', async ({ page, request }) => {
  await page.goto('/?g=rsv222');
  await openCover(page);
  await page.locator('.row[data-event="haldi"] button[data-d="-1"]').click();
  await expect(page.locator('.row[data-event="shaadi"] button[data-d="1"]')).toBeDisabled(); /* already at the party size */
  await page.fill('#rsvpName', 'Rahul');
  await page.fill('#rsvpNote', 'Can’t wait!');
  await page.locator('.r-send').click();
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  await expect(page.locator('.r-summary li')).toHaveText(['Haldi · 2 guests', 'Sangeet · 3 guests', 'Shaadi · 3 guests']);
  await expect(page.locator('.r-thanks')).toBeFocused();
  await expect.poll(async () => (await sheetRows(request, 'rsv222')).length).toBe(1);
  const [row] = await sheetRows(request, 'rsv222');
  expect(row).toMatchObject({ family: 'the RSV222 family', n: { haldi: 2, sangeet: 3, shaadi: 3 }, name: 'Rahul', note: 'Can’t wait!', rev: 1 });
  await page.reload();
  await openCover(page);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  await expect(page.locator('.r-summary li').first()).toHaveText('Haldi · 2 guests');
});

test('a reply sent from the Marathi page: the summary in Marathi, the Sheet and WhatsApp in English', async ({ page, request }) => {
  await page.route('**/api/rsvp', (r) => r.abort());
  await page.goto('/?g=mra234&lang=mr');
  await openCover(page);
  await page.locator('.row[data-event="sangeet"] button[data-d="-1"]').click();
  await page.locator('.row[data-event="sangeet"] button[data-d="-1"]').click();
  await page.locator('.r-send').click();
  await expect(page.locator('.r-failed')).toBeVisible({ timeout: 20_000 });
  const text = decodeURIComponent((await page.locator('.r-failed .r-wa').getAttribute('href'))!.split('text=')[1]);
  expect(text).toBe('RSVP · the MRA234 family (mra234)\nSangeet: 0\nShaadi: 2');
  await page.unroute('**/api/rsvp');
  await page.locator('.r-retry').click();
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  await expect(page.locator('.r-summary li')).toHaveText(['संगीत · येणार नाही', 'लग्न · २ पाहुणे']);
  await expect.poll(async () => (await sheetRows(request, 'mra234')).length).toBe(1);
  expect((await sheetRows(request, 'mra234'))[0]).toMatchObject({ n: { sangeet: 0, shaadi: 2 } });
  await page.reload();
  await openCover(page);
  await expect(page.locator('.r-summary li').last()).toHaveText('लग्न · २ पाहुणे');
});

test('change a reply: the form comes back filled in, and the new answer replaces the old', async ({ page, request }) => {
  await page.goto('/?g=rsv333');
  await openCover(page);
  await page.locator('.r-send').click();
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  const first = (await (await request.get('/api/guest?g=rsv333')).json()).reply.rev;
  await page.locator('.r-change').click();
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'form');
  await expect(page.locator('#n-haldi')).toHaveValue('3');
  await page.fill('#n-haldi', '0');
  await page.locator('#n-haldi').blur();
  await page.locator('.r-send').click();
  await expect(page.locator('.r-summary li').first()).toHaveText('Haldi · not coming');
  const api = await (await request.get('/api/guest?g=rsv333')).json();
  expect(api.reply).toMatchObject({ n: { haldi: 0, shaadi: 3 }, rev: first + 1 });
  await expect.poll(async () => (await sheetRows(request, 'rsv333')).map((r) => (r as { rev: number }).rev).slice(-2)).toEqual([first, first + 1]);
});

test('when sending fails: a WhatsApp reply, already written, and a quiet resend next time', async ({ page }) => {
  await page.route('**/api/rsvp', (r) => r.abort());
  await page.goto('/?g=rsv444');
  await openCover(page);
  await page.fill('#rsvpName', 'Asha');
  await page.locator('.r-send').click();
  await expect(page.locator('.r-failed')).toBeVisible({ timeout: 20_000 });
  const href = await page.locator('.r-failed .r-wa').getAttribute('href');
  expect(href).toMatch(/^https:\/\/wa\.me\/910000000002\?text=/);
  const text = decodeURIComponent(href!.split('text=')[1]);
  expect(text).toBe('RSVP · the RSV444 family (rsv444)\nSangeet: 3\nShaadi: 3\nFrom: Asha');
  expect(await page.evaluate(() => localStorage.getItem('sm-pending:rsv444'))).toContain('"name":"Asha"');
  await page.unroute('**/api/rsvp');
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sm-pending:rsv444'))).toBeNull();
  await openCover(page);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
});

test('the Sheet being down never bothers the guest', async ({ page, request }) => {
  await request.post(SHEET + '/fail?code=rsv555&on=1');
  try {
    await page.goto('/?g=rsv555');
    await openCover(page);
    await page.locator('.r-send').click();
    await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'replied');
  } finally {
    await request.post(SHEET + '/fail?code=rsv555&on=0');
  }
  expect(await sheetRows(request, 'rsv555')).toHaveLength(0);
});

test('the API clamps counts and never counts a retry twice', async ({ request }) => {
  const t = Date.now() - 60_000;
  const one = await (await request.post('/api/rsvp', { data: { g: 'rsv666', t, rid: 'same', n: { haldi: 50, sangeet: -1, shaadi: 2 } } })).json();
  expect(one.reply).toMatchObject({ n: { haldi: 3, sangeet: 0 }, rev: 1 });
  expect(one.reply.n.shaadi).toBeUndefined();
  const retry = await (await request.post('/api/rsvp', { data: { g: 'rsv666', t, rid: 'same', n: { haldi: 1 } } })).json();
  expect(retry.reply.rev).toBe(1);
  const bot = await request.post('/api/rsvp', { data: { g: 'rsv777', t, hp: 'x', n: { shaadi: 1 } } });
  expect(bot.status()).toBe(200);
  expect((await (await request.get('/api/guest?g=rsv777')).json()).reply).toBeNull();
});

test('after the deadline: a closed notice with WhatsApp, and the API refuses', async ({ page, request }) => {
  await page.goto(LATE + '/?g=rsv999');
  await openCover(page);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'closed');
  await expect(page.locator('.r-closed .r-wa')).toHaveAttribute('href', /^https:\/\/wa\.me\/910000000002\?text=Namaste/);
  const res = await request.post(LATE + '/api/rsvp', { data: { g: 'rsv999', t: 1, n: { haldi: 1 } } });
  expect(res.status()).toBe(410);
});

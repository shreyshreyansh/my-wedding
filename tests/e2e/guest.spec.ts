// Personal links: the edge greets the family, keeps only their events, picks their language; ?name= greets a person.
import { expect, test } from '@playwright/test';
import { noSideways, openCover } from './helpers';

test('without a code: a generic greeting, every event, and a pointer to WhatsApp instead of a form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('.chapter')).toHaveCount(3);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'nocode');
  await expect(page.locator('.r-nocode')).toBeVisible();
  await expect(page.locator('.r-bad')).toBeHidden();
  await expect(page.locator('#rsvpForm')).toBeHidden();
  await expect(page.locator('#guest')).toHaveCount(0);
});

test('a code that matches nobody adds one quiet line and nothing else', async ({ page }) => {
  await page.goto('/?g=zzzzzz');
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('.r-bad')).toBeVisible();
  await expect(page.locator('.chapter')).toHaveCount(3);
});

test('a Hindi family: their name in Devanagari, the Hindi card, all three events, their party size', async ({ page }) => {
  await page.goto('/?g=abc234');
  const name = page.locator('[data-guest-name]');
  await expect(name).toHaveText('शर्मा परिवार');
  await expect(name).toHaveAttribute('lang', 'hi');
  await openCover(page);
  await expect(page.locator('#inv-hi')).toBeChecked();
  await expect(page.locator('.inv-card.c-hi')).toBeVisible();
  await expect(page.locator('.inv-card.c-en')).toBeHidden();
  await expect(page.locator('.chapter')).toHaveCount(3);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'form');
  await expect(page.locator('[data-guest-ask]')).toHaveText('The Sharma family, how many of you will come to each celebration?');
  for (const id of ['haldi', 'sangeet', 'shaadi']) await expect(page.locator('#n-' + id)).toHaveValue('4');
});

test('a Marathi family invited to two events sees only those', async ({ page }) => {
  await page.goto('/?g=mrw567');
  await openCover(page);
  await expect(page.locator('#inv-mr')).toBeChecked();
  await expect(page.locator('.inv-card.c-mr')).toBeVisible();
  await expect(page.locator('.chapter')).toHaveCount(2);
  await expect(page.locator('.chapter[data-event="haldi"]')).toHaveCount(0);
  await expect(page.locator('[data-count-title]')).toHaveText('two celebrations');
  await expect(page.locator('.row[data-event]')).toHaveCount(2);
});

test('invited to the wedding only: one date, one chapter, one RSVP row', async ({ page }) => {
  await page.goto('/?g=pqr789');
  await expect(page.locator('#cover [data-dates-short]')).toHaveText('9 December 2026');
  await openCover(page);
  await expect(page.locator('[data-dates-long]')).toHaveText('Wednesday 9 December 2026');
  await expect(page.locator('[data-count-title]')).toHaveText('one celebration');
  await expect(page.locator('.chapter')).toHaveCount(1);
  await expect(page.locator('.row[data-event="shaadi"]')).toHaveCount(1);
  await expect(page.locator('#inv-en')).toBeChecked();
});

test('a code pasted with capitals and punctuation still works', async ({ page }) => {
  await page.goto('/?g=ABC-234.');
  await expect(page.locator('[data-guest-name]')).toHaveText('शर्मा परिवार');
});

test('a long family name wraps without pushing the page sideways', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/?g=xng456');
  expect(await noSideways(page)).toBe(true);
  await openCover(page);
  await page.locator('#rsvp').scrollIntoViewIfNeeded();
  expect(await noSideways(page)).toBe(true);
});

test('a #rsvp link lands on the RSVP once the cover opens', async ({ page }) => {
  await page.goto('/?g=abc234#rsvp');
  await openCover(page);
  await expect(page.locator('#rsvp h2')).toBeInViewport();
});

test('?name= greets the guest by name on the cover, the invitation, the RSVP and its thank-you', async ({ page }) => {
  await page.goto('/?name=rahul');
  await expect(page.locator('[data-guest-name]')).toHaveText('Rahul');
  await openCover(page);
  await expect(page.locator('#invTitle')).toHaveText('Rahul, you are invited');
  await expect(page.locator('#rsvpTitle')).toHaveText('Will you join us, Rahul?');
  await expect(page.locator('.r-thanks-title')).toHaveText('Thank you, Rahul!');
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'nocode');
});

test('?name= with a family code: the person by name, the family’s events and RSVP', async ({ page }) => {
  await page.goto('/?g=abc234&name=Anjali');
  await expect(page.locator('[data-guest-name]')).toHaveText('Anjali');
  await openCover(page);
  await expect(page.locator('#rsvp')).toHaveAttribute('data-rsvp', 'form');
  await expect(page.locator('[data-guest-ask]')).toHaveText(/^Anjali, how many of you/);
  await expect(page.locator('#rsvpName')).toHaveValue('Anjali');
});

test('a name in Devanagari is marked as Hindi; anything that is not a name is left out', async ({ page }) => {
  await page.goto('/?name=' + encodeURIComponent('राहुल'));
  await expect(page.locator('[data-guest-name] span')).toHaveAttribute('lang', 'hi');
  await page.goto('/?name=' + encodeURIComponent('<img src=x onerror=alert(1)>'));
  await expect(page.locator('[data-guest-name] img')).toHaveCount(0);
  await expect(page.locator('[data-guest-name]')).toHaveText('Img Src X Onerror Alert');
  await page.goto('/?name=' + encodeURIComponent('!!!'));
  await expect(page.locator('[data-guest-name]')).toHaveText('our family and friends');
  await openCover(page);
  await expect(page.locator('#invTitle')).toHaveText('You are invited');
  await expect(page.locator('#rsvpTitle')).toHaveText('Will you join us?');
});

/* ?lang=: the whole page in one language; without it (or with anything else) the page stays as it is */
test('?lang=mr: the page in Marathi, the Marathi card open, the holy lines as they are', async ({ page }) => {
  await page.goto('/?lang=mr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'mr');
  await expect(page.locator('[data-guest-name]')).toHaveText('आमचे सर्व आप्तेष्ट आणि मित्रपरिवार');
  await expect(page.locator('#cover .cv-date')).toContainText('८ व ९ डिसेंबर २०२६');
  await openCover(page);
  await expect(page.locator('#homesTitle')).toHaveText('बिहार आणि महाराष्ट्र, आणि त्यांना जोडणारे जुने धागे');
  await expect(page.locator('#invTitle')).toHaveText('आपणास सस्नेह निमंत्रण');
  await expect(page.locator('#inv-mr')).toBeChecked();
  await expect(page.locator('.ch-haldi h3')).toHaveText('हळद');
  await expect(page.locator('#tour-haldi .tour-list li').first()).toContainText('पाटण्याच्या बाजारातील हळद');
  await expect(page.locator('#rsvpTitle')).toHaveText('आपण याल ना?');
  await expect(page.locator('#ivTitle')).toContainText('॥ श्री गणेशाय नमः ॥');
  await expect(page.locator('#savdhan')).toHaveText('॥ शुभमंगल सावधान ॥');
  /* nothing left in English but the names, the art credits, the English invitation card (and placeholders still to fill) */
  const english = await page.evaluate(() => {
    const out: string[] = [];
    const w = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const el = n.parentElement!;
      if (el.closest('style, script, .c-en, .inv-tabs, .h-names, .hp, [lang="en"]') || !/[A-Za-z]{3}/.test((n.textContent || '').replace(/⟦[^⟧]*⟧/g, ''))) continue;
      out.push((n.textContent || '').trim().slice(0, 40));
    }
    return out;
  });
  expect(english).toEqual([]);
});

test('?lang=hi with a family code: the family, their events and dates, all in Hindi', async ({ page }) => {
  await page.goto('/?g=mrw567&lang=hi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.locator('[data-guest-name]')).toHaveText('वाघमारे काका आणि कुटुंब');
  await expect(page.locator('[data-dates-short]')).toHaveText('८ और ९ दिसंबर २०२६');
  await openCover(page);
  await expect(page.locator('[data-count-title]')).toHaveText('दो समारोह');
  await expect(page.locator('#inv-hi')).toBeChecked(); /* the link's language, not the family's */
  await expect(page.locator('.row[data-event] .ev b')).toHaveText(['संगीत संध्या', 'शुभ विवाह']);
  await expect(page.locator('[data-guest-ask]')).toHaveText('वाघमारे काका आणि कुटुंब, हर समारोह में आप कितने लोग आएँगे?');
});

test('?lang=en: English only, no Devanagari beside it but the holy lines and the names', async ({ page }) => {
  await page.goto('/?lang=en&g=abc234');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-guest-name]')).toHaveText('the Sharma family');
  await openCover(page);
  await expect(page.locator('#inv-en')).toBeChecked();
  await expect(page.locator('#homes .eyebrow')).toHaveText('two homes');
  await expect(page.locator('.ch-haldi .ch-no')).toHaveText('01');
  await expect(page.locator('.dhanyavad')).toHaveCount(0);
  await expect(page.locator('[data-guest-ask]')).toHaveText(/^The Sharma family, how many of you/);
});

test('?lang= with anything else, or none, leaves the page as it is', async ({ page }) => {
  for (const q of ['/?lang=fr', '/?lang=MR', '/']) {
    await page.goto(q);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#homes .eyebrow')).toHaveText('दो घर · दोन घरं · two homes');
  }
});

test('/mr/ and the like lead to ?lang=, keeping the rest of the link', async ({ page, request }) => {
  const res = await request.get('/hi/?g=abc234', { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  expect(new URL(res.headers().location).search).toBe('?g=abc234&lang=hi');
  await page.goto('/mr');
  await expect(page).toHaveURL(/\/\?lang=mr$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'mr');
});

test('?lang= with ?name=: the person greeted in that language, their name kept as written', async ({ page }) => {
  await page.goto('/?lang=mr&name=rahul');
  await expect(page.locator('[data-guest-name] .who')).toHaveAttribute('lang', 'en');
  await openCover(page);
  await expect(page.locator('#invTitle')).toHaveText('Rahul, आपणास सस्नेह निमंत्रण');
  await expect(page.locator('.r-thanks-title')).toHaveText('Rahul, मनःपूर्वक आभार!');
  await page.goto('/?lang=hi&name=' + encodeURIComponent('राहुल') + '&g=abc234');
  await expect(page.locator('#rsvpTitle')).toHaveText('राहुल, क्या आप पधारेंगे?');
  await expect(page.locator('#rsvpTitle .who')).not.toHaveAttribute('lang', /./);
  await expect(page.locator('.r-change')).toHaveAttribute('href', /lang=hi/);
});

test('the Marathi and Hindi pages fit small phones', async ({ page }) => {
  for (const lang of ['mr', 'hi']) {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/?g=abc234&lang=' + lang);
    await openCover(page);
    expect(await noSideways(page), lang).toBe(true);
  }
});

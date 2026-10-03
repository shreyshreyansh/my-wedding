import { expect, test } from '@playwright/test';
import { cleanGuest, normaliseCode, type Guest } from '../../server/guests';
import { cleanName, isDevanagari } from '../../server/name';
import { clampCounts, handleRsvp } from '../../server/rsvp';
import { buildIcs, fold, icsText, utc } from '../../src/lib/ics';
import { rsvpMessage, summaryLine, waLink } from '../../src/lib/wa';
import { datesFor, events, rsvp as rules } from '../../src/data/wedding';
import { guestList, parseCsv } from '../../scripts/lib.mjs';

test('a ?name= keeps only what a name is made of, at most 40 characters', () => {
  expect(cleanName('rahul')).toBe('Rahul');
  expect(cleanName('  rahul   kumar  ')).toBe('Rahul Kumar');
  expect(cleanName('Anjali & Vikram')).toBe('Anjali & Vikram');
  expect(cleanName("d'souza-mehta")).toBe("D'souza-Mehta");
  expect(cleanName('McDonald')).toBe('McDonald');
  expect(cleanName('राहुल')).toBe('राहुल');
  expect(isDevanagari('राहुल')).toBe(true);
  expect(cleanName('<script>alert(1)</script>')).toBe('Script Alert Script');
  expect(cleanName('a'.repeat(80))!.length).toBe(40);
  expect(cleanName('')).toBeNull();
  expect(cleanName(null)).toBeNull();
  expect(cleanName('123 !!')).toBeNull();
});

test('guest codes are normalised from what people paste', () => {
  expect(normaliseCode('abc234')).toBe('abc234');
  expect(normaliseCode(' ABC-234. ')).toBe('abc234');
  expect(normaliseCode('abc23')).toBeNull();
  expect(normaliseCode('abc2345')).toBeNull();
  expect(normaliseCode('abl234')).toBeNull(); /* l is not in the alphabet */
  expect(normaliseCode('')).toBeNull();
  expect(normaliseCode(null)).toBeNull();
});

test('guests are cleaned: known events in page order, sane numbers', () => {
  const g = cleanGuest({ label: 'x', lang: 'fr' as never, side: 'bride', ev: ['shaadi', 'nope' as never, 'haldi'], party: 99 } as Guest);
  expect(g.ev).toEqual(['haldi', 'shaadi']);
  expect(g.lang).toBe('en');
  expect(g.party).toBe(rules.maxPerEvent);
  expect(g.max).toBe(rules.maxPerEvent);
  expect(cleanGuest({ label: 'y', lang: 'mr', side: 'groom', ev: ['sangeet'], party: 2, max: 4 } as Guest).max).toBe(4);
});

test('counts are clamped to invited events and the family maximum', () => {
  const g = cleanGuest({ label: 'x', lang: 'en', side: 'groom', ev: ['haldi', 'sangeet'], party: 3 } as Guest);
  expect(clampCounts(g, { n: { haldi: 9, sangeet: -2, shaadi: 4 } })).toEqual({ haldi: 3, sangeet: 0 });
  expect(clampCounts(g, { n_haldi: '2', n_sangeet: '1.6' })).toEqual({ haldi: 2, sangeet: 2 });
  expect(clampCounts(g, { n: { haldi: 'abc' } })).toEqual({ haldi: 0, sangeet: 0 });
});

test('IST times become UTC for calendars', () => {
  const haldi = events.find((e) => e.id === 'haldi')!;
  expect(utc(haldi.start)).toBe('20261208T063000Z');
  expect(utc(events.find((e) => e.id === 'shaadi')!.end)).toBe('20261209T183000Z');
});

test('.ics files escape text and fold long lines without splitting characters', () => {
  expect(icsText('a, b; c\\d\ne')).toBe('a\\, b\; c\\\\d\\ne');
  const long = 'DESCRIPTION:' + 'श्रेयांश '.repeat(12);
  const folded = fold(long).split('\r\n ');
  expect(folded.length).toBeGreaterThan(1);
  for (const part of folded) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
  expect(folded.join('')).toBe(long);
  const ics = buildIcs({ uid: 'u', start: '2026-12-08T12:00:00+05:30', end: '2026-12-08T15:00:00+05:30', title: 'Haldi', where: 'Haveli Banquet, Ranchi', description: 'x', sequence: 2, stamp: new Date('2026-10-01T00:00:00Z') });
  expect(ics).toContain('DTSTART:20261208T063000Z\r\n');
  expect(ics).toContain('SEQUENCE:2\r\n');
  expect(ics).toContain('TRIGGER:-P1D');
  expect(ics).toContain('LOCATION:Haveli Banquet\\, Ranchi');
});

test('dates follow the events a family is invited to', () => {
  expect(datesFor(['haldi', 'sangeet', 'shaadi'])).toEqual({ short: '8 & 9 December 2026', long: 'Tuesday 8 & Wednesday 9 December 2026' });
  expect(datesFor(['shaadi'])).toEqual({ short: '9 December 2026', long: 'Wednesday 9 December 2026' });
  expect(datesFor(['haldi', 'sangeet']).short).toBe('8 December 2026');
});

test('the WhatsApp fallback carries every count', () => {
  const msg = rsvpMessage({ label: 'the Sharma family', code: 'abc234', rows: [{ name: 'Haldi', n: 2 }, { name: 'Shaadi', n: 0 }], name: 'Rahul', note: 'Yay' });
  expect(msg).toBe('RSVP · the Sharma family (abc234)\nHaldi: 2\nShaadi: 0\nFrom: Rahul\nNote: Yay');
  expect(waLink('+91 98123-45678', 'hi there')).toBe('https://wa.me/919812345678?text=hi%20there');
  expect(summaryLine({ name: 'Haldi', n: 1 })).toBe('Haldi · 1 guest');
  expect(summaryLine({ name: 'Haldi', n: 0 })).toBe('Haldi · not coming');
});

test('a Sheet export becomes the KV guest list, without phone numbers', () => {
  const { rows } = parseCsv('code,family,family_dev,lang,side,inv_haldi,inv_sangeet,inv_shaadi,party,max,phone\nabc234,"Sharma, Ranchi",शर्मा परिवार,hi,groom,TRUE,FALSE,TRUE,4,,919812345678\n,Nobody,,en,bride,TRUE,,,1,,\nzzz,Bad,,en,bride,TRUE,,,1,,\n');
  const { list, problems } = guestList(rows);
  expect(list.abc234).toEqual({ label: 'Sharma, Ranchi', label_dev: 'शर्मा परिवार', lang: 'hi', side: 'groom', ev: ['haldi', 'shaadi'], party: 4 });
  expect(JSON.stringify(list)).not.toContain('9812345678');
  expect(problems.join()).toContain('Nobody');
  expect(problems.join()).toContain('Bad');
});

/* the RSVP handler against an in-memory KV */
function fakeEnv(now: string, guests: Record<string, unknown>) {
  const store = new Map<string, string>([['guests', JSON.stringify(guests)]]);
  const kv = {
    get: async (k: string, o?: { type?: string }) => { const v = store.get(k); return v === undefined ? null : o?.type === 'json' ? JSON.parse(v) : v; },
    put: async (k: string, v: string) => { store.set(k, v); },
    delete: async (k: string) => { store.delete(k); }
  };
  return { store, env: { GUESTS: kv as unknown as KVNamespace, NOW: now } };
}
const post = (body: unknown) => new Request('http://x/api/rsvp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const G = { abc234: { label: 'the Sharma family', lang: 'en', side: 'groom', ev: ['haldi', 'shaadi'], party: 2 } };

test('replies are saved once per rid, revised by a new one, and remembered for the Sheet when it is unreachable', async () => {
  const { store, env } = fakeEnv('2026-11-01T10:00:00+05:30', G);
  const later: Promise<unknown>[] = [];
  const t = Date.parse('2026-11-01T09:00:00+05:30');
  const r1 = await (await handleRsvp(post({ g: 'abc234', t, rid: 'a', n: { haldi: 5, shaadi: 1 }, name: ' Rahul ' }), env, (p) => later.push(p))).json();
  expect(r1.reply).toMatchObject({ n: { haldi: 2, shaadi: 1 }, name: 'Rahul', rev: 1 });
  const again = await (await handleRsvp(post({ g: 'abc234', t, rid: 'a', n: { haldi: 0 } }), env, () => {})).json();
  expect(again.reply.rev).toBe(1);
  const r2 = await (await handleRsvp(post({ g: 'abc234', t, rid: 'b', n: { haldi: 0, shaadi: 2 } }), env, (p) => later.push(p))).json();
  expect(r2.reply).toMatchObject({ n: { haldi: 0, shaadi: 2 }, rev: 2 });
  await Promise.all(later);
  expect(store.get('fail:abc234')).toBe('2'); /* no APPS_SCRIPT_URL here, so it is kept for rsvp:resync */
});

test('replies close after the deadline and its grace period', async () => {
  const close = Date.parse(rules.deadline);
  const inGrace = new Date(close + 3600e3).toISOString(), after = new Date(close + (rules.graceHours + 1) * 3600e3).toISOString();
  const t = close - 86400e3;
  expect((await handleRsvp(post({ g: 'abc234', t, rid: 'x', n: {} }), fakeEnv(inGrace, G).env, () => {})).status).toBe(200);
  expect((await handleRsvp(post({ g: 'abc234', t, rid: 'x', n: {} }), fakeEnv(after, G).env, () => {})).status).toBe(410);
});

test('bots and strangers get nowhere', async () => {
  const { store, env } = fakeEnv('2026-11-01T10:00:00+05:30', G);
  const t = Date.parse('2026-11-01T09:00:00+05:30');
  expect((await handleRsvp(post({ g: 'abc234', t, hp: 'http://spam', n: { haldi: 1 } }), env, () => {})).status).toBe(200);
  const early = await handleRsvp(post({ g: 'abc234', t: Date.parse('2026-11-01T09:59:59+05:30'), n: { haldi: 1 } }), env, () => {});
  expect(early.status).toBe(429);
  expect((await early.json()).wait).toBe(1500);
  expect(store.has('r:abc234')).toBe(false);
  expect((await handleRsvp(post({ g: 'zzzzzz', t, n: {} }), env, () => {})).status).toBe(404);
  const big = new Request('http://x/api/rsvp', { method: 'POST', body: 'x'.repeat(5000) });
  expect((await handleRsvp(big, env, () => {})).status).toBe(413);
});

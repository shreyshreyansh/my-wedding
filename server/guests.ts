// The guest list lives in one KV key, `guests`, published from the family's Google Sheet. It never goes in the repo.
import type { Env } from './env';
import type { EventId, Lang } from '../src/data/schema';
import { events, rsvp as rules } from '../src/data/wedding';

export interface Guest {
  /** how the family is greeted, e.g. "the Sharma family" */
  label: string;
  /** the same in Devanagari, shown when their language is Marathi or Hindi */
  label_dev?: string;
  lang: Lang;
  side: 'bride' | 'groom';
  ev: EventId[];
  /** how many people the invitation is for; the RSVP starts at this number */
  party: number;
  /** the most the family can reply per event (defaults to party) */
  max?: number;
  /** test rows: replies go to the Sheet marked as tests */
  test?: boolean;
}

export interface Reply {
  n: Partial<Record<EventId, number>>;
  name: string;
  note: string;
  at: string;
  rev: number;
  rid: string;
}

export const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const CODE = new RegExp('^[' + ALPHABET + ']{6}$');
const ORDER = events.map((e) => e.id);

/** "?g=ABC234." copied from WhatsApp becomes "abc234"; anything else is null. */
export function normaliseCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const c = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CODE.test(c) ? c : null;
}

/** Guests' events in page order, only ones that exist, and sane numbers. */
export function cleanGuest(g: Guest): Guest {
  const ev = ORDER.filter((id) => g.ev?.includes(id));
  const party = Math.max(1, Math.min(rules.maxPerEvent, Math.round(Number(g.party) || 1)));
  const max = Math.max(party, Math.min(rules.maxPerEvent, Math.round(Number(g.max) || party)));
  const lang: Lang = g.lang === 'mr' || g.lang === 'hi' ? g.lang : 'en';
  return { label: String(g.label || '').slice(0, 80), label_dev: g.label_dev ? String(g.label_dev).slice(0, 80) : undefined, lang, side: g.side === 'bride' ? 'bride' : 'groom', ev, party, max, test: !!g.test };
}

export async function findGuest(env: Env, code: string | null): Promise<Guest | null> {
  if (!code) return null;
  const all = await env.GUESTS.get<Record<string, Guest>>('guests', { type: 'json', cacheTtl: 60 });
  const g = all?.[code];
  return g && Array.isArray(g.ev) && g.ev.length ? cleanGuest(g) : null;
}

export async function findReply(env: Env, code: string): Promise<Reply | null> {
  return env.GUESTS.get<Reply>('r:' + code, { type: 'json' });
}

export const waNumber = (env: Env, g: Guest) => ((g.side === 'bride' ? env.WA_BRIDE : env.WA_GROOM) || '').replace(/\D/g, '');

export function deadlines() {
  const close = Date.parse(rules.deadline);
  return { close, hard: close + rules.graceHours * 3600e3 };
}

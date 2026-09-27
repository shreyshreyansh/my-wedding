// POST /api/rsvp: check, clamp, save to KV, answer the guest, then forward to the Sheet in the background.
import type { Env } from './env';
import { now } from './env';
import { deadlines, findGuest, findReply, normaliseCode, type Guest, type Reply } from './guests';
import { forwardOrRemember, toRow } from './forward';
import { json, PRIVATE } from './headers';
import { rsvp as rules } from '../src/data/wedding';
import type { EventId } from '../src/data/schema';

const MAX_BODY = 4096;

export interface Incoming {
  g?: string; rid?: string; name?: string; note?: string; hp?: string; t?: string | number;
  n?: Record<string, unknown>;
  [k: string]: unknown;
}

const clean = (s: unknown, max: number) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+\n/g, '\n').trim().slice(0, max);
const int = (v: unknown) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : 0; };

/** Only the guest's own events, whole numbers from 0 to their max. */
export function clampCounts(g: Guest, input: Incoming): Reply['n'] {
  const n: Reply['n'] = {};
  for (const id of g.ev) {
    const raw = input.n?.[id] ?? input['n_' + id];
    n[id as EventId] = Math.max(0, Math.min(g.max ?? g.party, int(raw)));
  }
  return n;
}

async function parse(req: Request): Promise<{ body: Incoming; form: boolean } | null> {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > MAX_BODY) return null;
  const text = await req.text();
  if (text.length > MAX_BODY) return null;
  const type = req.headers.get('content-type') || '';
  if (type.includes('application/x-www-form-urlencoded')) {
    const p = new URLSearchParams(text), body: Incoming = {};
    p.forEach((v, k) => { body[k] = v; });
    body.hp = p.get('website') || '';
    return { body, form: true };
  }
  try { return { body: JSON.parse(text) as Incoming, form: false }; } catch { return { body: {}, form: false }; }
}

export async function handleRsvp(req: Request, env: Env, waitUntil: (p: Promise<unknown>) => void): Promise<Response> {
  const parsed = await parse(req);
  if (!parsed) return json({ ok: false, error: 'too-large' }, 413);
  const { body, form } = parsed;
  const code = normaliseCode(String(body.g ?? ''));
  const back = (hash: string) => new Response(null, { status: 303, headers: { ...PRIVATE, Location: '/?g=' + (code ?? '') + hash } });

  /* a filled honeypot is a bot: pretend it worked, keep nothing */
  if (clean(body.hp, 100)) return form ? back('#rsvp') : json({ ok: true });
  /* faster than a person reads: ask the page to try again in a moment (it does, by itself) */
  const t = Number(body.t), early = rules.minMs - (now(env) - t);
  if (Number.isFinite(t) && t > 0 && early > 0) return form ? back('#rsvp') : json({ ok: false, error: 'wait', wait: early }, 429);

  const guest = await findGuest(env, code);
  if (!code || !guest) return form ? back('#rsvp') : json({ ok: false, error: 'code' }, 404);

  const { hard } = deadlines();
  if (now(env) > hard) return form ? back('#rsvp') : json({ ok: false, error: 'closed' }, 410);

  const rid = clean(body.rid, 64) || crypto.randomUUID();
  const prev = await findReply(env, code);
  if (prev && prev.rid === rid) return form ? back('#rsvp') : json({ ok: true, reply: prev });

  const reply: Reply = {
    n: clampCounts(guest, body),
    name: clean(body.name, 80),
    note: clean(body.note, 500),
    at: new Date(now(env)).toISOString(),
    rev: (prev?.rev ?? 0) + 1,
    rid
  };
  await env.GUESTS.put('r:' + code, JSON.stringify(reply));
  waitUntil(forwardOrRemember(env, toRow(env, code, guest, reply)));
  return form ? back('#rsvp') : json({ ok: true, reply });
}

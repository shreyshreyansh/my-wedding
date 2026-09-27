// GET /api/guest?g=<code> — a family's invitation and latest reply, for the page to refresh itself (e.g. after a quiet retry).
import type { Env } from '../../server/env';
import { findGuest, findReply, normaliseCode } from '../../server/guests';
import { json } from '../../server/headers';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const code = normaliseCode(new URL(request.url).searchParams.get('g'));
  const guest = await findGuest(env, code);
  if (!code || !guest) return json({ ok: false, error: 'code' }, 404);
  const reply = await findReply(env, code);
  return json({ ok: true, guest: { label: guest.label, ev: guest.ev, party: guest.party, max: guest.max, lang: guest.lang }, reply });
};

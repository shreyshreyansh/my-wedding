// POST /api/rsvp — see server/rsvp.ts.
import type { Env } from '../../server/env';
import { json } from '../../server/headers';
import { handleRsvp } from '../../server/rsvp';

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  try {
    return await handleRsvp(request, env, waitUntil);
  } catch {
    return json({ ok: false, error: 'server' }, 500);
  }
};

export const onRequest: PagesFunction<Env> = async () => json({ ok: false, error: 'method' }, 405);

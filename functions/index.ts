// GET / — the invitation. With ?g=<code> it becomes that family's own; if anything fails, everyone gets the generic page.
import type { Env } from '../server/env';
import { now } from '../server/env';
import { deadlines, findGuest, findReply, normaliseCode, waNumber } from '../server/guests';
import { withPrivate } from '../server/headers';
import { personalize, type View } from '../server/personalize';

export const onRequestGet: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url);
  const page = await next();
  if (!(page.headers.get('content-type') || '').includes('text/html')) return page;
  const raw = url.searchParams.get('g');
  try {
    const code = normaliseCode(raw);
    const guest = await findGuest(env, code);
    const reply = guest && code ? await findReply(env, code) : null;
    const t = now(env);
    const view: View = {
      code: guest ? code : null, guest, bad: !!raw && !guest, reply,
      closed: t > deadlines().close, change: url.searchParams.has('change'),
      wa: guest ? waNumber(env, guest) : '', now: t
    };
    return withPrivate(personalize(page, view));
  } catch {
    return withPrivate(page);
  }
};

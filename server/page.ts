// GET / — the invitation. With ?g=<code> it becomes that family's own; if anything fails, everyone gets the generic page.
import type { Env } from './env';
import { now } from './env';
import { deadlines, findGuest, findReply, normaliseCode, waNumber } from './guests';
import { withPrivate } from './headers';
import { personalize, type View } from './personalize';

export async function invitation(request: Request, env: Env, page: Response): Promise<Response> {
  if (!(page.headers.get('content-type') || '').includes('text/html')) return page;
  const url = new URL(request.url);
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
}

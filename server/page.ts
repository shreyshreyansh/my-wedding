// GET / — the invitation. With ?g=<code> it becomes that family's own, and with ?name=<name> it greets that person by
// name (either, both or neither); ?lang=en|mr|hi has already chosen the page (worker/index.ts). If anything fails,
// everyone gets the generic page.
import type { Env } from './env';
import { now } from './env';
import { deadlines, findGuest, findReply, normaliseCode, waNumber } from './guests';
import { withPrivate } from './headers';
import { cleanName } from './name';
import { personalize, type View } from './personalize';
import { isLang } from '../src/data/i18n';

export async function invitation(request: Request, env: Env, page: Response): Promise<Response> {
  if (!(page.headers.get('content-type') || '').includes('text/html')) return page;
  const url = new URL(request.url);
  const raw = url.searchParams.get('g');
  const lang = url.searchParams.get('lang');
  try {
    const code = normaliseCode(raw);
    const guest = await findGuest(env, code);
    const reply = guest && code ? await findReply(env, code) : null;
    const t = now(env);
    const view: View = {
      code: guest ? code : null, guest, bad: !!raw && !guest, reply,
      closed: t > deadlines().close, change: url.searchParams.has('change'),
      wa: guest ? waNumber(env, guest) : '', now: t,
      person: cleanName(url.searchParams.get('name')),
      reading: isLang(lang) ? lang : 'mixed'
    };
    return withPrivate(personalize(page, view));
  } catch {
    return withPrivate(page);
  }
}

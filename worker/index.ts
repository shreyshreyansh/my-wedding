// The Worker in front of the static site (dist/). It runs first only for /, /api/* and the language pages (see
// wrangler.toml); everything else is served straight from the static files.
import type { Env } from '../server/env';
import { guestApi } from '../server/guest-api';
import { json } from '../server/headers';
import { invitation } from '../server/page';
import { handleRsvp } from '../server/rsvp';
import { isLang } from '../src/data/i18n';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), { pathname } = url;
    if (pathname === '/api/rsvp') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      try { return await handleRsvp(request, env, (p) => ctx.waitUntil(p)); } catch { return json({ ok: false, error: 'server' }, 500); }
    }
    if (pathname === '/api/guest') return request.method === 'GET' ? guestApi(request, env) : json({ ok: false, error: 'method' }, 405);
    if (pathname.startsWith('/api/')) return json({ ok: false, error: 'not-found' }, 404);
    /* /mr/ and the like are how the build stores each language; the address guests use is /?lang=mr */
    const own = /^\/(en|mr|hi)(\/|\/index\.html)?$/.exec(pathname);
    if (own) {
      url.pathname = '/';
      url.searchParams.set('lang', own[1]);
      return Response.redirect(url.href, 302);
    }
    if (pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
      /* ?lang=en|mr|hi: the whole page in that language (src/data/i18n.ts); anything else, the page as it is */
      const lang = url.searchParams.get('lang');
      const page = isLang(lang) ? await env.ASSETS.fetch(new Request(new URL('/' + lang + '/', url), request)) : await env.ASSETS.fetch(request);
      return invitation(request, env, page);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;

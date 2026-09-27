// The Worker in front of the static site (dist/). It runs first only for / and /api/* (see wrangler.toml);
// everything else is served straight from the static files.
import type { Env } from '../server/env';
import { guestApi } from '../server/guest-api';
import { json } from '../server/headers';
import { invitation } from '../server/page';
import { handleRsvp } from '../server/rsvp';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/rsvp') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
      try { return await handleRsvp(request, env, (p) => ctx.waitUntil(p)); } catch { return json({ ok: false, error: 'server' }, 500); }
    }
    if (pathname === '/api/guest') return request.method === 'GET' ? guestApi(request, env) : json({ ok: false, error: 'method' }, 405);
    if (pathname.startsWith('/api/')) return json({ ok: false, error: 'not-found' }, 404);
    const asset = await env.ASSETS.fetch(request);
    if (pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) return invitation(request, env, asset);
    return asset;
  }
} satisfies ExportedHandler<Env>;

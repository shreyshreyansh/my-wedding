// Every personalised response is private: no caching anywhere, no search engines, no referrer leaking the code.
export const PRIVATE: Record<string, string> = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff'
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...PRIVATE, 'Content-Type': 'application/json; charset=utf-8' } });
}

export function withPrivate(res: Response) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(PRIVATE)) out.headers.set(k, v);
  return out;
}

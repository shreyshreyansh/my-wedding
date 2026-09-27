// Sends a saved reply on to the family's Google Sheet (Apps Script). Runs after the guest has their answer;
// if the Sheet is down, `fail:<code>` remembers it for `npm run rsvp:resync`.
import type { Env } from './env';
import type { Guest, Reply } from './guests';

export interface SheetRow {
  secret: string;
  code: string;
  family: string;
  side: string;
  test: boolean;
  n: Reply['n'];
  name: string;
  note: string;
  at: string;
  rev: number;
  rid: string;
}

export const toRow = (env: Env, code: string, g: Guest, r: Reply): SheetRow => ({
  secret: env.APPS_SCRIPT_SECRET || '', code, family: g.label, side: g.side, test: !!g.test,
  n: r.n, name: r.name, note: r.note, at: r.at, rev: r.rev, rid: r.rid
});

export async function forward(env: Env, row: SheetRow): Promise<boolean> {
  if (!env.APPS_SCRIPT_URL) return false;
  try {
    // text/plain keeps Apps Script from needing a CORS preflight, and it follows the script's redirect to its answer
    const res = await fetch(env.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row), redirect: 'follow' });
    const text = await res.text();
    return res.ok && /"ok"\s*:\s*true/.test(text);
  } catch {
    return false;
  }
}

export async function forwardOrRemember(env: Env, row: SheetRow) {
  const ok = await forward(env, row);
  if (ok) await env.GUESTS.delete('fail:' + row.code);
  else await env.GUESTS.put('fail:' + row.code, String(row.rev));
  return ok;
}

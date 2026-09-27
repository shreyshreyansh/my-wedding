// Shared by the operator scripts: CSV, the guest list shape (same as the Sheet's Publish), Cloudflare KV, .dev.vars.
import { existsSync, readFileSync } from 'node:fs';

export const EVENTS = ['haldi', 'sangeet', 'shaadi'];
export const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';

/** Values from the environment, falling back to .dev.vars. */
export function vars() {
  const out = { ...process.env };
  if (existsSync('.dev.vars')) {
    for (const line of readFileSync('.dev.vars', 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  }
  return out;
}

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return { head, rows: body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()]))) };
}

export function toCsv(head, rows) {
  const esc = (v) => (/[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  return [head, ...rows.map((r) => head.map((h) => r[h] ?? ''))].map((r) => r.map((v) => esc(String(v))).join(',')).join('\n') + '\n';
}

const yes = (v) => /^(yes|y|true|1|✓)$/i.test(String(v ?? '').trim());

/** The Guests tab (as CSV rows) → the `guests` KV value. Phone numbers are left behind. */
export function guestList(rows) {
  const list = {}, problems = [];
  rows.forEach((r, i) => {
    const code = (r.code || '').toLowerCase();
    if (!r.family) return;
    if (!new RegExp('^[' + ALPHABET + ']{6}$').test(code)) { problems.push(`Row ${i + 2} (${r.family}): missing or invalid code "${r.code}"`); return; }
    if (list[code]) problems.push(`Row ${i + 2}: code ${code} is used twice`);
    const ev = EVENTS.filter((id) => yes(r['inv_' + id]));
    if (!ev.length) problems.push(`Row ${i + 2} (${r.family}): not invited to any event`);
    const lang = (r.lang || 'en').toLowerCase();
    list[code] = {
      label: r.family,
      ...(r.family_dev ? { label_dev: r.family_dev } : {}),
      lang: lang === 'mr' || lang === 'hi' ? lang : 'en',
      side: (r.side || '').toLowerCase() === 'bride' ? 'bride' : 'groom',
      ev,
      party: Number(r.party) || 1,
      ...(Number(r.max) ? { max: Number(r.max) } : {}),
      ...(yes(r.test) ? { test: true } : {})
    };
  });
  return { list, problems };
}

export function kvApi(v = vars()) {
  const need = ['CF_ACCOUNT_ID', 'CF_NAMESPACE_ID', 'CF_API_TOKEN'].filter((k) => !v[k]);
  if (need.length) throw new Error('Missing ' + need.join(', ') + ' (environment or .dev.vars)');
  const base = `https://api.cloudflare.com/client/v4/accounts/${v.CF_ACCOUNT_ID}/storage/kv/namespaces/${v.CF_NAMESPACE_ID}`;
  const auth = { Authorization: 'Bearer ' + v.CF_API_TOKEN };
  return {
    async get(key) { const r = await fetch(base + '/values/' + encodeURIComponent(key), { headers: auth }); return r.ok ? r.text() : null; },
    async put(key, value) { const r = await fetch(base + '/values/' + encodeURIComponent(key), { method: 'PUT', headers: { ...auth, 'Content-Type': 'text/plain' }, body: value }); if (!r.ok) throw new Error('KV put ' + key + ': ' + r.status + ' ' + (await r.text())); },
    async del(key) { await fetch(base + '/values/' + encodeURIComponent(key), { method: 'DELETE', headers: auth }); },
    async keys(prefix) { const r = await fetch(base + '/keys?prefix=' + encodeURIComponent(prefix), { headers: auth }); const j = await r.json(); return (j.result || []).map((k) => k.name); }
  };
}

// Resends replies the Sheet didn't get (the edge marks them fail:<code>). Safe to run any time: the Sheet ignores old revisions.
//   npm run rsvp:resync      (needs CF_* and APPS_SCRIPT_URL, APPS_SCRIPT_SECRET in the environment or .dev.vars)
import { kvApi, vars } from './lib.mjs';

const v = vars();
const kv = kvApi(v);
const guests = JSON.parse((await kv.get('guests')) || '{}');
const failed = await kv.keys('fail:');
let sent = 0;
for (const key of failed) {
  const code = key.slice(5);
  const reply = JSON.parse((await kv.get('r:' + code)) || 'null');
  const g = guests[code];
  if (!reply || !g) { await kv.del(key); continue; }
  const row = { secret: v.APPS_SCRIPT_SECRET, code, family: g.label, side: g.side, test: !!g.test, ...reply };
  const res = await fetch(v.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row), redirect: 'follow' });
  const text = await res.text();
  if (res.ok && /"ok"\s*:\s*true/.test(text)) { await kv.del(key); sent++; console.log('sent', code, g.label); }
  else console.log('still failing', code, res.status, text.slice(0, 200));
}
console.log(`${sent} of ${failed.length} replies resent.`);

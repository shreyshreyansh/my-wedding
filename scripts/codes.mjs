// Backup to the Sheet's "Wedding → Generate missing codes": fills blank codes in a CSV. Existing codes never change.
//   npm run codes -- private/guests.csv
import { readFileSync, writeFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { ALPHABET, parseCsv, toCsv } from './lib.mjs';

const file = process.argv[2] || 'private/guests.csv';
const { head, rows } = parseCsv(readFileSync(file, 'utf8'));
if (!head.includes('code')) head.unshift('code');
const used = new Set(rows.map((r) => (r.code || '').toLowerCase()).filter(Boolean));
let made = 0;
for (const r of rows) {
  if (!r.family || r.code) continue;
  let c;
  do { c = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join(''); } while (used.has(c));
  used.add(c);
  r.code = c;
  made++;
}
writeFileSync(file, toCsv(head, rows));
console.log(made + ' new codes written to ' + file);

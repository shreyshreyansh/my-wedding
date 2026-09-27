// Backup to the Sheet's "Wedding → Publish guest list": publish a CSV export of the Guests tab to KV.
//   npm run guests:push -- private/guests.csv            (to Cloudflare; needs CF_* in the environment or .dev.vars)
//   npm run guests:push -- private/guests.csv --local    (to the local test KV used by `wrangler pages dev`)
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { guestList, kvApi, parseCsv } from './lib.mjs';

const [file = 'private/guests.csv', ...flags] = process.argv.slice(2);
const { rows } = parseCsv(readFileSync(file, 'utf8'));
const { list, problems } = guestList(rows);
if (problems.length) { console.error('Fix these first:\n  ' + problems.join('\n  ')); process.exit(1); }
const json = JSON.stringify(list);
if (flags.includes('--local')) {
  const tmp = join(mkdtempSync(join(tmpdir(), 'guests-')), 'guests.json');
  writeFileSync(tmp, json);
  execFileSync('npx', ['wrangler', 'kv', 'key', 'put', 'guests', '--path', tmp, '--binding', 'GUESTS', '--local'], { stdio: 'inherit' });
} else {
  await kvApi().put('guests', json);
}
console.log('Published ' + Object.keys(list).length + ' families.');

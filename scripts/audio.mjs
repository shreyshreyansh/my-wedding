// Prepares the couple's recording for the page: even loudness, a soft fade in and out, AAC in .m4a, at most 1 MB.
//   npm run audio -- path/to/recording.wav [seconds]     → public/audio/invite.m4a
// Needs ffmpeg: `npm i -D ffmpeg-static` once, or ffmpeg on the PATH (brew install ffmpeg).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';

const [input, maxSeconds] = process.argv.slice(2);
if (!input) { console.error('Usage: npm run audio -- recording.wav [seconds]'); process.exit(1); }
let ffmpeg = 'ffmpeg';
try { ffmpeg = (await import('ffmpeg-static')).default || ffmpeg; } catch { /* use the PATH */ }

const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', input], { encoding: 'utf8' });
const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(probe.stderr || '');
if (!m) { console.error('Could not read ' + input + (probe.error ? ': ' + probe.error.message : '')); process.exit(1); }
const full = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
const dur = Math.min(full, Number(maxSeconds) || full);
const LIMIT = 1_000_000;
/* the bitrate that fits the whole piece in 1 MB, at most 96 kbps; below 48 kbps, trim it shorter instead */
const kbps = Math.min(96, Math.floor((LIMIT * 8 * 0.97) / dur / 1000));
if (kbps < 48) { console.error(`${dur.toFixed(0)}s is too long for 1 MB. Pass a length, e.g. npm run audio -- ${input} 90`); process.exit(1); }
const fadeOut = Math.min(3, dur / 4);
mkdirSync('public/audio', { recursive: true });
const out = 'public/audio/invite.m4a';
execFileSync(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-t', String(dur),
  '-af', `loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=1.5,afade=t=out:st=${(dur - fadeOut).toFixed(2)}:d=${fadeOut.toFixed(2)}`,
  '-ac', kbps < 72 ? '1' : '2', '-c:a', 'aac', '-b:a', kbps + 'k', '-movflags', '+faststart', out], { stdio: 'inherit' });
const size = statSync(out).size;
console.log(`${out}: ${dur.toFixed(1)}s, ${kbps} kbps, ${(size / 1024).toFixed(0)} KB${size > LIMIT ? ' — over 1 MB, pass a shorter length' : ''}`);
console.log("Now set music.src = '/audio/invite.m4a?v=1' in src/data/wedding.ts.");

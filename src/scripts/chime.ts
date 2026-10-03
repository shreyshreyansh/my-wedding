// A small temple bell, made in the browser (there is no sound file): struck when the seal is tapped, rung twice
// when a reply is sent. Quiet; silent when the guest has muted the music, and on an iPhone set to silent.
type Nav = Navigator & { audioSession?: { type: string } };
type Win = Window & { webkitAudioContext?: typeof AudioContext };
let ctx: AudioContext | null = null;
const muted = () => { try { return localStorage.getItem('sm-muted') === '1'; } catch { return false; } };

/** Call inside a tap the first time (browsers only start sound from a tap); later calls may come from anywhere. */
export function chime(times = 1) {
  if (muted()) return;
  try {
    const nav = navigator as Nav;
    if (nav.audioSession) nav.audioSession.type = 'ambient';
    const AC = window.AudioContext || (window as Win).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    for (let k = 0; k < times; k++) strike(ctx, t0 + k * 0.22, k ? 0.65 : 1);
  } catch { /* no sound is fine */ }
}

/* brass bell partials (ratio to the strike note, level, seconds to fade); the pairs a few hertz apart shimmer */
const PARTIALS: [number, number, number][] = [[1, 1, 2.8], [1.004, 0.5, 2.6], [2.71, 0.45, 1.7], [2.716, 0.25, 1.5], [5.15, 0.18, 0.9], [8.4, 0.08, 0.45]];
function strike(ac: AudioContext, t: number, level: number) {
  const out = ac.createGain();
  out.gain.value = 0.11 * level;
  out.connect(ac.destination);
  for (const [r, a, d] of PARTIALS) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = 932 * r;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(a, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + d + 0.05);
  }
}

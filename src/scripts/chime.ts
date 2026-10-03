// A singing bowl, made in the browser (there is no sound file): struck softly when the seal is tapped, twice when a
// reply is sent, and left to ring out. Quiet; silent when the guest has muted the music, and on an iPhone set to silent.
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
    for (let k = 0; k < times; k++) strike(ctx, t0 + k * 0.85, k ? 0.7 : 1);
  } catch { /* no sound is fine */ }
}

/* a bowl's partials (ratio to its note, level, seconds to fade): long and low, each paired with a twin a hertz or
   two away, so the tone slowly beats, the wavering hum of a bowl left to ring. G4, which a phone speaker can carry. */
const PARTIALS: [number, number, number][] = [[1, 1, 7], [1.0035, 0.75, 6.5], [2.76, 0.42, 4.5], [2.7655, 0.3, 4.2], [5.4, 0.16, 2.2], [8.93, 0.05, 1.1]];
function strike(ac: AudioContext, t: number, level: number) {
  const out = ac.createGain();
  out.gain.value = 0.13 * level;
  out.connect(ac.destination);
  for (const [r, a, d] of PARTIALS) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine';
    o.frequency.value = 392 * r;
    g.gain.setValueAtTime(0, t);
    /* a soft mallet: the sound swells for a moment instead of clicking */
    g.gain.linearRampToValueAtTime(a, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + d + 0.05);
  }
}

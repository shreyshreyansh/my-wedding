// When a reply is sent: marigold and rose petals and grains of rice shower down the screen for a few seconds.
// Drawn on one canvas that is removed afterwards.
type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; sway: number; ph: number; petal: boolean };
type Mem = Navigator & { deviceMemory?: number };
const COLOURS = ['#E27A1B', '#F2B33D', '#E9952B', '#D9466F', '#C2365E', '#F6E7C8'];

export function celebrate() {
  const few = ((navigator as Mem).deviceMemory ?? 8) <= 2;
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '60' });
  c.width = W * dpr; c.height = H * dpr;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  if (!g) { c.remove(); return; }
  g.scale(dpr, dpr);
  const n = few ? 70 : 150;
  const bits: Bit[] = Array.from({ length: n }, (_, i) => {
    const petal = i % 4 !== 3;
    return {
      x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 40, vy: 60 + Math.random() * 90,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 6, w: petal ? 7 + Math.random() * 7 : 2.4, h: petal ? 10 + Math.random() * 8 : 6,
      c: petal ? COLOURS[i % 5] : COLOURS[5], sway: 20 + Math.random() * 40, ph: Math.random() * 6, petal
    };
  });
  let last = performance.now(), age = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; age += dt;
    g.clearRect(0, 0, W, H);
    let alive = 0;
    for (const b of bits) {
      b.vy = Math.min(b.vy + 120 * dt, b.petal ? 170 : 260);
      b.y += b.vy * dt;
      b.x += (b.vx + Math.sin(age * 2 + b.ph) * b.sway) * dt;
      b.r += b.vr * dt;
      if (b.y > H + 30) continue;
      alive++;
      g.save();
      g.translate(b.x, b.y);
      g.rotate(b.r);
      g.globalAlpha = Math.min(1, Math.max(0, 3.6 - age));
      g.fillStyle = b.c;
      g.beginPath();
      g.ellipse(0, 0, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
      g.fill();
      if (b.petal) { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, -b.h / 2); g.lineTo(0, b.h / 2); g.stroke(); }
      g.restore();
    }
    if (alive && age < 4.2) requestAnimationFrame(frame);
    else c.remove();
  };
  requestAnimationFrame(frame);
}

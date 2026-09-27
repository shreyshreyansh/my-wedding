// Akshata: rice grains (and marigold petals) tossed over the page at the moments that matter.
import { gsap } from 'gsap';
import { C, MARIGOLD } from '../../art/palette';

type Mem = Navigator & { deviceMemory?: number };
const few = ((navigator as Mem).deviceMemory ?? 8) <= 2;

export function burst(n: number, petals = false) {
  const layer = document.getElementById('akshata');
  if (!layer) return;
  if (few) n = Math.ceil(n / 2);
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < n; i++) {
    const g = document.createElement('i');
    const petal = petals && i % 3 === 2;
    g.className = petal ? 'grain petal' : 'grain';
    g.style.left = (W * (0.12 + Math.random() * 0.76)) + 'px';
    g.style.top = '-14px';
    g.style.background = petal ? (i % 2 ? MARIGOLD : C.haldi) : [C.zari, C.chuna, C.haldi][i % 3];
    layer.appendChild(g);
    gsap.fromTo(g, { y: 0, rotation: Math.random() * 180 }, {
      y: H * (0.35 + Math.random() * 0.55), x: (Math.random() - 0.5) * 90, rotation: '+=' + (200 + Math.random() * 300),
      duration: 1.5 + Math.random() * 0.8, ease: 'power1.in', onComplete: () => g.remove()
    });
    gsap.to(g, { autoAlpha: 0, duration: 0.5, delay: 1.2 + Math.random() * 0.7 });
  }
}

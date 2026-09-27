// Two ribbons cross, Paithani gold and Madhubani paper; scroll faster and they race.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Run } from './shared';

export function ribbons(run: Run) {
  const z = document.getElementById('trackZ'), m = document.getElementById('trackM');
  if (!z || !m) return;
  const tracks = [{ el: z, dir: -1, p: 0 }, { el: m, dir: 1, p: -25 }];
  let boost = 0, sdir = 1, on = false;
  ScrollTrigger.create({ trigger: '#ribbons', start: 'top bottom', end: 'bottom top', onToggle: (s) => (on = s.isActive), onUpdate: (s) => { boost = Math.min(Math.abs(s.getVelocity()) / 220, 9); sdir = s.direction; } });
  const tick = (_time: number, dt: number) => {
    if (!on) return;
    boost *= 0.93;
    const step = (0.03 + boost * 0.06) * sdir * (dt / 16.67);
    tracks.forEach((t) => { t.p = (((t.p + step * t.dir) % 50) - 50) % 50; t.el.style.transform = 'translateX(' + t.p.toFixed(3) + '%)'; });
  };
  gsap.ticker.add(tick);
  run.cleanup(() => gsap.ticker.remove(tick));
  gsap.fromTo('.rib-z', { rotation: -8 }, { rotation: -3, ease: 'none', scrollTrigger: { trigger: '#ribbons', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.rib-m', { rotation: 8 }, { rotation: 3, ease: 'none', scrollTrigger: { trigger: '#ribbons', start: 'top bottom', end: 'bottom top', scrub: true } });
}

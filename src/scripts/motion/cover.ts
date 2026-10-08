// The cover at dawn: the card rises in and the brass seal keeps a slow heartbeat. On the tap, the seal presses, the
// card dips away, and the two banks of cloud slide off to the sides as the scene behind them settles (scene.ts).
// The opening is built before the tap, so the tap itself only starts it: no measuring, no new elements, no long work.
import { gsap } from 'gsap';
import { app, fine } from '../app';
import { burst } from './burst';
import { shared } from './shared';
import type { Timeline } from './types';

export function coverMotion(intro: boolean) {
  const cover = document.getElementById('cover');
  const found = document.getElementById('openBtn');
  if (!cover || !found || app.opened) return;
  const seal: HTMLElement = found;
  const wrap = seal.parentNode as HTMLElement;
  const card = cover.querySelector<HTMLElement>('.cv-card')!;
  const left = cover.querySelector<HTMLElement>('.cv-cloud.l')!, right = cover.querySelector<HTMLElement>('.cv-cloud.r')!;
  let cvIntro: Timeline | null = null, pulse: Timeline | null = null;

  function heartbeat() {
    const rings = wrap.querySelectorAll('.ring');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
    [0, 0.3].forEach((t, i) => {
      tl.to(seal, { scale: i ? 1.03 : 1.06, duration: 0.12, ease: 'power2.out' }, t)
        .to(seal, { scale: 1, duration: 0.26, ease: 'power2.in' }, t + 0.12)
        .fromTo(rings[i], { scale: 1, opacity: 0.9 }, { scale: 1.5, opacity: 0, duration: 1.3, ease: 'power2.out' }, t);
    });
    return tl;
  }
  const idle = () => { if (!app.opened) pulse = heartbeat(); };

  if (intro) {
    cvIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: idle })
      .from([left, right], { xPercent: (i) => (i ? 14 : -14), duration: 2.2, ease: 'power2.out' }, 0)
      .from(card, { y: 40, opacity: 0, duration: 1.1 }, 0.15)
      .from('#cover .cv-top > *', { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.45)
      .from('#cover .cv-names > *', { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.14 }, 0.7)
      .from('#cover .cv-dn, #cover .cv-date', { y: 8, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 1.05)
      .from(seal, { scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' }, 1.2);
    const fontsOk = document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
    fontsOk.then(() => { if (!app.opened) cvIntro!.play(); });
  } else {
    idle();
  }

  /* the seal leans towards a mouse pointer */
  if (fine) {
    const sx = gsap.quickTo(seal, 'x', { duration: 0.45, ease: 'power3.out' }), sy = gsap.quickTo(seal, 'y', { duration: 0.45, ease: 'power3.out' });
    seal.addEventListener('pointermove', (e) => { const r = seal.getBoundingClientRect(); sx((e.clientX - r.left - r.width / 2) * 0.15); sy((e.clientY - r.top - r.height / 2) * 0.15); });
    seal.addEventListener('pointerleave', () => { sx(0); sy(0); });
  }

  /* the opening, ready before the tap */
  let finish: () => void = () => {};
  const open = gsap.timeline({ paused: true })
    .to(seal, { scale: 0.92, duration: 0.09, ease: 'power2.out' })
    .to(seal, { scale: 1.08, duration: 0.2, ease: 'back.out(3)' })
    .fromTo(wrap.querySelectorAll('.ring'), { scale: 1, opacity: 1 }, { scale: 1.9, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, 0.09)
    .to(card, { y: 36, scale: 0.94, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.14)
    .add(() => { shared.heroIntro?.play(); }, 0.28)
    .to(left, { xPercent: -108, duration: 1.1, ease: 'power3.inOut' }, 0.26)
    .to(right, { xPercent: 108, duration: 1.1, ease: 'power3.inOut' }, 0.26)
    .add(() => burst(18, true), 0.4)
    .add(() => finish(), 1.36);

  app.hooks.open = (done) => {
    if (cvIntro) cvIntro.progress(1, true).kill();
    if (pulse) pulse.kill();
    finish = done;
    open.play(0);
  };
}

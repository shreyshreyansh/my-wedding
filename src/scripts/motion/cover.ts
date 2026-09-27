// The cover: entrance, the seal's dha-dha heartbeat, the antarpat's tug, and the opening.
import { gsap } from 'gsap';
import { app, fine } from '../app';
import { burst } from './burst';
import { shared } from './shared';
import type { Timeline, Tween } from './types';

export function coverMotion(intro: boolean) {
  const cover = document.getElementById('cover');
  const found = document.getElementById('openBtn');
  if (!cover || !found || app.opened) return;
  const seal: HTMLElement = found;
  const wrap = seal.parentNode as HTMLElement;
  let cvIntro: Timeline | null = null, pulse: Timeline | null = null, nudgeCall: Tween | null = null, nudges = 0;

  function sealPulse() {
    const rings = wrap.querySelectorAll('.ring'), halo = wrap.querySelector('.halo'), gap = 28;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.3 });
    [0, 0.3].forEach((t, i) => {
      tl.to(seal, { scale: i ? 1.03 : 1.05, duration: 0.12, ease: 'power2.out' }, t)
        .to(seal, { scale: 1, duration: 0.24, ease: 'power2.in' }, t + 0.12)
        .to(halo, { opacity: i ? 0.75 : 1, scale: i ? 1.04 : 1.08, duration: 0.12, ease: 'power2.out' }, t)
        .to(halo, { opacity: 0.35, scale: 1, duration: 0.6, ease: 'power2.inOut' }, t + 0.12)
        .fromTo(rings[i], { scaleX: 1, scaleY: 1, opacity: 0.95 }, { scaleX: () => 1 + (2 * gap) / wrap.offsetWidth, scaleY: () => 1 + (2 * gap) / wrap.offsetHeight, opacity: 0, duration: 1.2, ease: 'power2.out' }, t);
    });
    return tl.fromTo(seal.querySelector('.glint'), { xPercent: -120 }, { xPercent: 120, duration: 0.9, ease: 'power2.inOut' }, 0.75);
  }
  function tug() {
    if (app.opened) return;
    gsap.timeline()
      .to('#cover .cloth', { y: 14, duration: 0.22, ease: 'power2.in' })
      .to('#cover .cloth', { y: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)' })
      .to('#cvToran .hang', { rotation: (i: number) => (i % 2 ? 7 : -7), duration: 0.2, ease: 'power2.out' }, 0)
      .to('#cvToran .hang', { rotation: 0, duration: 1.5, ease: 'elastic.out(1, 0.3)' }, 0.2);
    burst(6);
    if (++nudges < 3) nudgeCall = gsap.delayedCall(6.5, tug);
  }
  const idle = () => { if (app.opened) return; pulse = sealPulse(); nudgeCall = gsap.delayedCall(3, tug); };

  if (intro) {
    const nameIn = { clipPath: 'inset(-30% 100% -30% -12%)' }, nameOut = { clipPath: 'inset(-30% -12% -30% -12%)', ease: 'power2.inOut', duration: 0.9 };
    cvIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: idle })
      .from('#cvToran .hang', { yPercent: -115, duration: 0.9, ease: 'back.out(1.4)', stagger: { each: 0.04, from: 'center' } }, 0)
      .from('#cover .cv-guest', { y: 12, autoAlpha: 0, duration: 0.6 }, 0.2)
      .fromTo('#cover .cv-door', { '--arch': 0 }, { '--arch': 1, duration: 1.1, ease: 'power2.inOut' }, 0.25)
      .from('#cover .cv-apex', { scale: 0, rotation: -90, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(3)' }, 1.3)
      .from('#cover .cv-inv', { autoAlpha: 0, duration: 0.5 }, 0.35)
      .from('#cover .sw-disc', { scale: 0.4, autoAlpha: 0, svgOrigin: '50 50', duration: 0.6, ease: 'back.out(1.8)' }, 0.4)
      .from('#cover .sw-hatch', { autoAlpha: 0, duration: 0.4 }, 0.8)
      .fromTo('#cover .sw-ring', { strokeDasharray: '1 2', strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 0.7, ease: 'power2.inOut' }, 0.45)
      .from('#cover .cv-rule', { scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, 0.55)
      .fromTo('#cover .sw-line', { strokeDasharray: '1 2', strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, autoRound: false, duration: 0.24, ease: 'power1.inOut', stagger: 0.2 }, 0.75)
      .from('#cover .sw-dot', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)', stagger: 0.08 }, 1.95)
      .fromTo('#cover .cv-nm', { ...nameIn }, { ...nameOut, stagger: 0.3 }, 0.8)
      .from('#cover .cv-amp', { scale: 0, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }, 1.15)
      .fromTo('#cover .cv-dn', { ...nameIn }, { ...nameOut }, 1.4)
      .from('#cover .cv-date', { y: 10, autoAlpha: 0, duration: 0.5 }, 1.7)
      .from('#cover .cv-cta', { y: 26, opacity: 0, duration: 0.7 }, 1.75);
    const fontsOk = document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
    fontsOk.then(() => { if (!app.opened) cvIntro!.play(); });
  } else {
    idle();
  }

  /* the seal leans towards a mouse pointer */
  if (fine) {
    const sx = gsap.quickTo(seal, 'x', { duration: 0.45, ease: 'power3.out' }), sy = gsap.quickTo(seal, 'y', { duration: 0.45, ease: 'power3.out' });
    seal.addEventListener('pointermove', (e) => { const r = seal.getBoundingClientRect(); sx((e.clientX - r.left - r.width / 2) * 0.18); sy((e.clientY - r.top - r.height / 2) * 0.18); });
    seal.addEventListener('pointerleave', () => { sx(0); sy(0); });
  }

  app.hooks.open = (done) => {
    if (cvIntro) cvIntro.progress(1, true).kill();
    if (pulse) pulse.kill();
    if (nudgeCall) nudgeCall.kill();
    gsap.killTweensOf('#cover .cloth, #cvToran .hang');
    gsap.timeline({ onComplete: done })
      .to(seal, { scale: 0.95, duration: 0.09, ease: 'power2.out' })
      .to(seal, { scale: 1.07, duration: 0.22, ease: 'back.out(3)' })
      .fromTo(wrap.querySelectorAll('.ring'), { scaleX: 1, scaleY: 1, opacity: 1 }, { scaleX: 1.3, scaleY: 1.9, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.09)
      .to(wrap.querySelector('.halo'), { opacity: 1, scale: 1.3, duration: 0.3, ease: 'power2.out' }, 0.09)
      .fromTo(seal.querySelector('.glint'), { xPercent: -120 }, { xPercent: 120, duration: 0.5, ease: 'power2.inOut' }, 0.09)
      .to('#cvToran .hang', { rotation: (i: number) => (i % 2 ? 12 : -12), duration: 0.3, ease: 'power2.out' }, 0.1)
      .to('#cover .cv-text', { y: -18, autoAlpha: 0, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, 0.3)
      .to('#cover .cloth', { yPercent: 104, y: 0, duration: 0.95, ease: 'power2.in' }, 0.5)
      .add(() => burst(36, true), 0.85)
      .add(() => { shared.heroIntro?.play(); }, 1.05)
      .to('#cvToran', { yPercent: -130, scale: 1.12, autoAlpha: 0, transformOrigin: '50% 0%', duration: 0.6, ease: 'power2.in' }, 1.0);
  };
}

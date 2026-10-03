// The cover: the painting settles, the words arrive, the seal keeps a dha-dha heartbeat; on the tap a circle of
// light opens from the seal and the page appears through it, as the akshata falls.
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
  const cloth = cover.querySelector<HTMLElement>('.cloth')!;
  const wrap = seal.parentNode as HTMLElement;
  let cvIntro: Timeline | null = null, pulse: Timeline | null = null;

  function heartbeat() {
    const rings = wrap.querySelectorAll('.ring');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
    [0, 0.3].forEach((t, i) => {
      tl.to(seal, { scale: i ? 1.03 : 1.06, duration: 0.12, ease: 'power2.out' }, t)
        .to(seal, { scale: 1, duration: 0.26, ease: 'power2.in' }, t + 0.12)
        .fromTo(rings[i], { scale: 1, opacity: 0.9 }, { scale: 1.45, opacity: 0, duration: 1.3, ease: 'power2.out' }, t);
    });
    return tl;
  }
  const idle = () => { if (!app.opened) pulse = heartbeat(); };

  if (intro) {
    const wipe = { clipPath: 'inset(-20% 100% -20% -10%)' }, wiped = { clipPath: 'inset(-20% -10% -20% -10%)', ease: 'power2.inOut', duration: 0.9 };
    cvIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: idle })
      .fromTo('#cover .cv-art', { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
      .from('#cover .cv-shade', { opacity: 0.4, duration: 1.2, ease: 'power1.inOut' }, 0.1)
      .from('#cover .cv-top > *', { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.4)
      .fromTo('#cover .cv-names .nm', { ...wipe }, { ...wiped, stagger: 0.28 }, 0.7)
      .from('#cover .cv-names .amp', { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, 0.95)
      .from('#cover .cv-dn', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power2.inOut' }, 1.2)
      .from('#cover .cv-date', { y: 8, autoAlpha: 0, duration: 0.6 }, 1.45)
      .from(seal, { scale: 0.8, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' }, 1.5);
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

  app.hooks.open = (done) => {
    if (cvIntro) cvIntro.progress(1, true).kill();
    if (pulse) pulse.kill();
    /* the circle opens from the seal's centre and grows past the farthest corner */
    const r = seal.getBoundingClientRect(), b = cloth.getBoundingClientRect();
    const x = r.left + r.width / 2 - b.left, y = r.top + r.height / 2 - b.top;
    const far = Math.hypot(Math.max(x, b.width - x), Math.max(y, b.height - y)) + 60;
    gsap.set(cloth, { '--sx': x + 'px', '--sy': y + 'px', '--r': '0px' });
    gsap.timeline({ onComplete: done })
      .to(seal, { scale: 0.92, duration: 0.09, ease: 'power2.out' })
      .to(seal, { scale: 1.08, duration: 0.22, ease: 'back.out(3)' })
      .fromTo(wrap.querySelectorAll('.ring'), { scale: 1, opacity: 1 }, { scale: 1.9, opacity: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 }, 0.09)
      .to('#cover .cv-text', { autoAlpha: 0, y: -12, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, 0.2)
      .to('#cover .cv-cta', { autoAlpha: 0, duration: 0.25 }, 0.32)
      .add(() => { cover.classList.add('opening'); burst(36, true); }, 0.4)
      .to(cloth, { '--r': far + 'px', duration: 1.15, ease: 'power2.in' }, 0.4)
      .to('#cover .cv-art', { scale: 1.14, duration: 1.15, ease: 'power1.in' }, 0.4)
      .add(() => { shared.heroIntro?.play(); }, 0.75);
  };
}

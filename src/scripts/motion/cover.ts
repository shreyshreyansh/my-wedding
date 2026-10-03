// The cover: the silk settles, the words arrive, the medallion keeps a dha-dha heartbeat, and on the tap the
// antarpat is lowered: a WebGL drape of the same silk (drape.ts), or a plain drop where WebGL can't run.
import { gsap } from 'gsap';
import { app, fine } from '../app';
import { burst } from './burst';
import { makeDrape, type Drape } from './drape';
import { shared } from './shared';
import type { Timeline } from './types';

type Lite = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
const lite = ((navigator as Lite).deviceMemory ?? 8) <= 2 || !!(navigator as Lite).connection?.saveData;

export function coverMotion(intro: boolean) {
  const cover = document.getElementById('cover');
  const found = document.getElementById('openBtn');
  if (!cover || !found || app.opened) return;
  const seal: HTMLElement = found;
  const cloth = cover.querySelector<HTMLElement>('.cloth')!;
  const img = cover.querySelector<HTMLImageElement>('.cv-silk img')!;
  const wrap = seal.parentNode as HTMLElement;
  let cvIntro: Timeline | null = null, pulse: Timeline | null = null, drape: Drape | null = null;

  function heartbeat() {
    const rings = wrap.querySelectorAll('.ring'), glow = seal.querySelector('.glow');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
    [0, 0.3].forEach((t, i) => {
      tl.to(seal, { scale: i ? 1.025 : 1.045, duration: 0.12, ease: 'power2.out' }, t)
        .to(seal, { scale: 1, duration: 0.26, ease: 'power2.in' }, t + 0.12)
        .fromTo(rings[i], { scale: 1, opacity: 0.9 }, { scale: 1.32, opacity: 0, duration: 1.3, ease: 'power2.out' }, t);
    });
    return tl.fromTo(glow, { opacity: 1 }, { opacity: 0.72, duration: 0.9, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.5);
  }
  /* the mesh is built while the guest reads the cover, so the tap starts the fall at once */
  function prepare() {
    if (drape || lite || app.opened) return;
    const go = () => { if (!drape && !app.opened) drape = makeDrape(img, cloth); };
    if (img.complete && img.naturalWidth) img.decode().then(go, go);
    else img.addEventListener('load', go, { once: true });
  }
  const idle = () => {
    if (app.opened) return;
    pulse = heartbeat();
    ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(prepare, { timeout: 1200 } as never);
  };

  if (intro) {
    const wipe = { clipPath: 'inset(-20% 100% -20% -10%)' }, wiped = { clipPath: 'inset(-20% -10% -20% -10%)', ease: 'power2.inOut', duration: 0.9 };
    cvIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: idle })
      .fromTo('#cover .cv-silk', { scale: 1.08 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .from('#cover .cv-shade', { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 0.15)
      .from('#cover .cv-top > *', { y: 10, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.45)
      .fromTo('#cover .cv-names .nm', { ...wipe }, { ...wiped, stagger: 0.28 }, 0.75)
      .from('#cover .cv-names .amp', { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, 1.0)
      .from('#cover .cv-dn', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power2.inOut' }, 1.25)
      .from('#cover .cv-date, #cover .cv-why', { y: 8, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 1.5)
      .from(seal, { scale: 0.86, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' }, 1.1);
    const fontsOk = document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]) : Promise.resolve();
    fontsOk.then(() => { if (!app.opened) cvIntro!.play(); });
  } else {
    idle();
  }

  /* the seal leans towards a mouse pointer */
  if (fine) {
    const sx = gsap.quickTo(seal, 'x', { duration: 0.45, ease: 'power3.out' }), sy = gsap.quickTo(seal, 'y', { duration: 0.45, ease: 'power3.out' });
    seal.addEventListener('pointermove', (e) => { const r = seal.getBoundingClientRect(); sx((e.clientX - r.left - r.width / 2) * 0.12); sy((e.clientY - r.top - r.height / 2) * 0.12); });
    seal.addEventListener('pointerleave', () => { sx(0); sy(0); });
  }

  app.hooks.open = (done) => {
    if (cvIntro) cvIntro.progress(1, true).kill();
    if (pulse) pulse.kill();
    /* the cloth falls: on the WebGL mesh if it is ready (or can be made now, after the tap has answered), else a plain drop */
    const fall = () => {
      if (!drape && !lite) drape = makeDrape(img, cloth);
      const d = drape;
      if (!d) { gsap.to(cloth, { yPercent: 104, duration: 0.95, ease: 'power2.in', onComplete: done }); return; }
      cloth.appendChild(d.canvas);
      d.draw(0);
      /* the page shows through where the cloth has gone */
      cloth.style.background = 'transparent';
      cover.querySelector<HTMLElement>('.cv-silk')!.style.visibility = 'hidden';
      const state = { p: 0 };
      gsap.to(state, { p: 1, duration: 1.65, ease: 'none', onUpdate: () => d.draw(state.p), onComplete: () => { d.dispose(); done(); } });
    };
    gsap.timeline()
      .to(seal, { scale: 0.94, duration: 0.09, ease: 'power2.out' })
      .to(seal, { scale: 1.06, duration: 0.22, ease: 'back.out(3)' })
      .fromTo(wrap.querySelectorAll('.ring'), { scale: 1, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.09)
      .to('#cover .cv-text, #cover .seal-wrap', { autoAlpha: 0, duration: 0.35, ease: 'power2.in', stagger: 0.04 }, 0.28)
      .to('#cover .cv-shade', { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0.3)
      .add(fall, 0.7)
      .add(() => burst(36, true), 0.95)
      .add(() => { shared.heroIntro?.play(); }, 1.15);
  };
}

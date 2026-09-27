// Haldi, Sangeet, Shaadi: each chapter draws itself, then its loop plays while it is on screen.
// Loops over the chapters that exist: the edge removes the ones a guest isn't invited to.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $$ } from '../app';
import { blessingLoop, haldiLoop, sangeetLoop, shaadiLoop } from './loops';
import { shown, type Run } from './shared';

const LOOPS: Record<string, (svg: SVGElement) => gsap.core.Timeline> = { haldi: haldiLoop, sangeet: sangeetLoop, shaadi: shaadiLoop, blessing: blessingLoop };

export function schedule(run: Run) {
  if (!document.getElementById('schedule')) return;
  gsap.utils.toArray<HTMLElement>('#schedule .sched-head .reveal').forEach((el, i) => gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#schedule', start: 'top 80%', once: true } }));
  gsap.from(shown($$('#toran .strand')), { yPercent: -100, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.05, scrollTrigger: { trigger: '#schedule', start: 'top 85%', once: true } });

  $$('.chapter').forEach((ch) => {
    const svg = ch.querySelector<SVGElement>('.med svg')!, ev = ch.dataset.event!;
    const rings = svg.querySelectorAll('.ring-draw');
    gsap.set(rings, { strokeDasharray: 1 });
    const loop = LOOPS[ev](svg);
    let ready = false, vis = false;
    const tl = gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top 80%', once: true }, defaults: { ease: 'power3.out' }, onComplete: () => { ready = true; if (vis) loop.play(); } });
    tl.fromTo(rings, { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, duration: 1.1, ease: 'power2.inOut', stagger: 0.06 })
      .from(svg.querySelectorAll('.disc, .ring-m'), { autoAlpha: 0, duration: 0.6 }, 0.1)
      .from(svg.querySelector('.art'), { scale: 0.86, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.8 }, 0.35)
      .from(ch.querySelectorAll('h3 .ch'), { yPercent: 70, rotationX: -50, transformPerspective: 400, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)', stagger: 0.05 }, 0.5);
    if (ev === 'haldi') tl.from(svg.querySelectorAll('.leaf-l, .leaf-r'), { y: '-=40', autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 0.6);
    if (ev === 'sangeet') tl.from(svg.querySelectorAll('.bell'), { y: -10, autoAlpha: 0, duration: 0.4, stagger: 0.04 }, 0.7);
    if (ev === 'shaadi') {
      tl.from(svg.querySelector('.drape-l'), { x: -150, duration: 1.1, ease: 'power3.out' }, 0.7)
        .from(svg.querySelector('.drape-r'), { x: 150, duration: 1.1, ease: 'power3.out' }, 0.7)
        .from(svg.querySelector('.knot'), { scale: 0, svgOrigin: '160 114', duration: 0.6, ease: 'back.out(2)' }, 1.55)
        .from(svg.querySelectorAll('.diya'), { opacity: 0.25, duration: 0.3, stagger: 0.18 }, 1.2)
        .from(svg.querySelectorAll('.dflame'), { scale: 0, transformOrigin: '50% 100%', duration: 0.4, stagger: 0.18, ease: 'back.out(2)' }, 1.2);
    }
    tl.from(ch.querySelectorAll('.reveal'), { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.65);
    ScrollTrigger.create({ trigger: ch, start: 'top bottom', end: 'bottom top', onToggle: (s) => { vis = s.isActive; if (ready) (vis ? loop.play() : loop.pause()); } });

    /* tap the Sangeet medallion and the dholak answers */
    const btn = ch.querySelector('.medbtn');
    if (btn && ev === 'sangeet') {
      const drum = svg.querySelector('.dholak'), bells = svg.querySelectorAll('.bell');
      run.on(btn, 'click', () => {
        gsap.timeline()
          .to(drum, { scaleX: 1.09, scaleY: 0.94, svgOrigin: '160 170', duration: 0.07, ease: 'power2.out' })
          .to(drum, { scaleX: 1, scaleY: 1, svgOrigin: '160 170', duration: 0.35, ease: 'power3.out' })
          .to(bells, { rotation: (i: number) => (i % 2 ? 20 : -20), transformOrigin: '50% 0%', duration: 0.07, stagger: 0.01 }, 0)
          .to(bells, { rotation: 0, duration: 0.5, ease: 'power3.out', stagger: 0.01 }, 0.08);
      });
    }

    if (!run.desk) {
      gsap.timeline({ scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } })
        .fromTo(ch, { scale: 0.93, opacity: 0.55 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'none' })
        .to(ch, { scale: 1, opacity: 1, duration: 0.3 })
        .to(ch, { scale: 0.95, opacity: 0.6, duration: 0.35, ease: 'none' });
    } else if (run.fine) {
      const medal = svg.querySelector('.medal');
      run.on(ch, 'pointerenter', () => { gsap.to(medal, { rotation: 4, scale: 1.03, transformOrigin: '50% 50%', duration: 0.6, ease: 'power3.out' }); });
      run.on(ch, 'pointerleave', () => { gsap.to(medal, { rotation: 0, scale: 1, duration: 0.7, ease: 'power3.out' }); });
    }
  });

  gsap.utils.toArray<SVGPathElement>('.threads path').forEach((p) => {
    gsap.fromTo(p, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: 'none', scrollTrigger: { trigger: p.closest('svg'), start: 'top 92%', end: 'center 58%', scrub: true } });
  });
}


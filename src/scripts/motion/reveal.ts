// Everything after the opening scene: words and cards rise into place as they arrive (once), the lotus draws itself,
// the gold thread between the two homes draws as you scroll, the celebrations' cards rise one after another while a
// dot travels down their thread, the couple's note lights word by word, and the photos swing a little on their cords.
// Loops over what exists: the edge removes the celebrations a family isn't invited to.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$ } from '../app';
import type { Run } from './shared';

export function reveal(run: Run) {
  /* words and cards rise into place as they arrive, once; neighbours a beat apart */
  $$<HTMLElement>('main .reveal').forEach((el) => {
    gsap.from(el, { y: 24, autoAlpha: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* the lotus draws itself, petal by petal */
  const lotus = $('#invocation .lotus-mark');
  if (lotus) {
    const paths = lotus.querySelectorAll<SVGGeometryElement>('path');
    paths.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.12, scrollTrigger: { trigger: lotus, start: 'top 85%', once: true } });
  }

  /* the thread between Bihar and Bodh Gaya draws as you scroll past */
  const thread = $<SVGPathElement>('#homes .hm-thread path');
  if (thread) {
    const l = thread.getTotalLength();
    gsap.fromTo(thread, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { id: 'homes-thread', trigger: '#homes .hm-pair', start: 'top 85%', end: 'bottom 45%', scrub: true } });
    gsap.from('#homes .hm-medal.his', { x: -40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#homes .hm-pair', start: 'top 85%', once: true } });
    gsap.from('#homes .hm-medal.hers', { x: 40, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#homes .hm-pair', start: 'top 85%', once: true } });
  }

  /* the celebrations rise one after another; on a phone a dot travels down their thread */
  const cards = $$<HTMLElement>('.chapter');
  if (cards.length) {
    if (run.desk) gsap.from(cards, { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.18, scrollTrigger: { trigger: '.chapters', start: 'top 82%', once: true } });
    else cards.forEach((c) => gsap.from(c, { y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 88%', once: true } }));
    const dot = $('.ch-thread i');
    if (dot && !run.desk) gsap.to(dot, { y: () => (dot.parentElement!.offsetHeight - 12), ease: 'none', scrollTrigger: { id: 'ch-thread', trigger: '.chapters', start: 'top 60%', end: 'bottom 60%', scrub: true, invalidateOnRefresh: true } });
  }

  /* the couple's note lights word by word (opacity only: the words are inline, so the lines wrap as they would) */
  if ($('#note-words')) gsap.fromTo('#note-words .nw', { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { id: 'note-words', trigger: '#note-words', start: 'top 72%', end: 'bottom 42%', scrub: true } });

  /* the photos swing on their cords as the page moves past them */
  const frames = $$<HTMLElement>('.ph-frame');
  if (frames.length) {
    gsap.fromTo(frames, { rotation: (i) => (i % 2 ? -5 : 5) }, { rotation: (i) => (i % 2 ? 4 : -4), ease: 'none', scrollTrigger: { id: 'photos', trigger: '#photos', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    gsap.from(frames, { y: -30, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.08, scrollTrigger: { trigger: '.ph-lines', start: 'top 82%', once: true } });
  }

  /* the things-to-know icons draw themselves */
  const icons = $$<SVGGeometryElement>('#know .kn-ic path, #know .kn-ic circle, #know .kn-ic rect');
  if (icons.length) {
    icons.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.to(icons, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.04, scrollTrigger: { trigger: '#know .kn-list', start: 'top 85%', once: true } });
  }

  /* the night's diyas flicker only while the footer is on screen */
  ScrollTrigger.create({ id: 'night-live', trigger: 'footer', start: 'top bottom', end: 'bottom top', toggleClass: { targets: 'footer', className: 'live' } });
}

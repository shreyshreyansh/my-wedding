// Looking into two paintings: while the section is pinned, the scroll glides the view to each detail in turn (its
// words fade in underneath), then back out to the pair. The details are in Tour.astro's data-tour (the pair one
// above the other) and data-tour-row (side by side), as fractions of the pair: [x, y, width, height].
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$ } from '../app';
import type { Run } from './shared';

type Box = [number, number, number, number];

export function tours(run: Run) {
  $$<HTMLElement>('.tour').forEach((tour) => {
    const col = JSON.parse(tour.dataset.tour || '[]') as Box[], row = JSON.parse(tour.dataset.tourRow || '[]') as Box[];
    const stage = $<HTMLElement>('.tour-stage', tour)!, art = $<HTMLElement>('.tour-art', tour)!;
    const label = $<HTMLElement>('.tour-cap.is-label', tour)!, caps = $$<HTMLElement>('.tour-list .tour-cap', tour);
    /* which way the pair stands is up to the stylesheet (a container query); read it each time the page is measured */
    const box = (i: number) => (row.length && getComputedStyle(art).getPropertyValue('--layout').trim() === 'row' ? row : col)[i];
    /* where the pair must move, and how far it must grow, to fill the stage with one detail */
    const view = (i: number) => {
      const b = box(i);
      const sw = stage.clientWidth, sh = stage.clientHeight, aw = art.offsetWidth, ah = art.offsetHeight;
      const s = Math.min((sw * 0.94) / (b[2] * aw), (sh * 0.94) / (b[3] * ah), 3.2);
      return { x: sw / 2 - art.offsetLeft - s * (b[0] + b[2] / 2) * aw, y: sh / 2 - art.offsetTop - s * (b[1] + b[3] / 2) * ah, scale: s };
    };
    gsap.set(art, { transformOrigin: '0 0' });
    /* the stage opens like a window as the section arrives */
    gsap.fromTo(stage, { clipPath: run.desk ? 'inset(10% 8% 10% 8%)' : 'inset(8% 6% 8% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: { trigger: tour, start: 'top 92%', end: 'top top', scrub: 0.5 } });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: tour, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true } });
    tl.to({}, { duration: 0.5 });
    col.forEach((_, i) => {
      tl.to(art, { x: () => view(i).x, y: () => view(i).y, scale: () => view(i).scale, duration: 1 })
        .to(i ? caps[i - 1] : label, { opacity: 0, y: -10, duration: 0.3 }, '<')
        .fromTo(caps[i], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }, '<0.55')
        .to({}, { duration: 0.7 });
    });
    tl.to(art, { x: 0, y: 0, scale: 1, duration: 1 })
      .to(caps[caps.length - 1], { opacity: 0, y: -10, duration: 0.3 }, '<')
      .to(label, { opacity: 1, y: 0, duration: 0.35 }, '<0.55')
      .to({}, { duration: 0.3 });
    /* the sparks and the fire move only while the painting is on screen */
    ScrollTrigger.create({ trigger: tour, start: 'top bottom', end: 'bottom top', toggleClass: { targets: tour, className: 'live' } });
  });
}

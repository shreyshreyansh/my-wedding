import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const timelineRevealState = (index: number) => ({
  opacity: 0,
  rotation: index % 2 === 0 ? -10 : 10,
  x: index % 2 === 0 ? -60 : 60,
  y: 50
});

export const timelineRevealDelay = (index: number, wideDesktop: boolean) => wideDesktop ? index * .2 : 0;

export const mobileJourneyParallax = { distance: -1000, range: 5000 } as const;
export const storyScrollRange = { start: "top 85%", end: "bottom 30%" } as const;

export const wideHeroRevealState = (index: number) => ({
  rotation: [-14, 7, 13][index] ?? 0,
  scaleX: [1.12, 1.08, 1.08][index] ?? 1,
  scaleY: [1.94, 1.7, 1.58][index] ?? 1,
  y: [782, 685, 590][index] ?? 0
});

const riseSelectors = [
  ".guest__looking",
  ".location-card",
  ".finale__divider--top",
  ".wide-finale__divider--top",
  ".rsvp-card",
  ".finale__divider--bottom",
  ".wide-finale__divider--bottom"
];

const detailSelectors = [
  ".knowledge h2",
  ".knowledge__intro",
  ".knowledge__grid article",
  ".countdown h2",
  ".countdown p",
  ".countdown__units"
];

export function initMotion(root: HTMLElement): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const context = gsap.context(() => {
    const reducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wideDesktop = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1280px)").matches;
    const revealed = [".event-card", ".couple__heading", ".gallery-photo", ".wide-gallery-photo", ...riseSelectors, ...detailSelectors];

    if (reducedMotion) {
      gsap.set(revealed, { clearProps: "transform,opacity" });
      gsap.set(".couple__story span", { color: "#5f250f" });
      return;
    }

    if (wideDesktop) {
      gsap.from(".hero__title > span", {
        delay: .78,
        duration: 2.45,
        ease: "power3.inOut",
        rotation: (index) => wideHeroRevealState(index).rotation,
        scaleX: (index) => wideHeroRevealState(index).scaleX,
        scaleY: (index) => wideHeroRevealState(index).scaleY,
        stagger: .06,
        transformOrigin: "50% 50%",
        y: (index) => wideHeroRevealState(index).y
      });
    } else {
      gsap.from(".hero__title > span", {
        duration: 1.25,
        ease: "power3.out",
        opacity: 0,
        rotation: (index) => index === 1 ? -3 : index === 0 ? -1.5 : 1.5,
        scale: 1.08,
        stagger: .11,
        y: -30
      });
    }

    gsap.to(".hero__title", {
      opacity: 0,
      scrollTrigger: { end: "bottom top", scrub: true, start: "top top" },
      y: -80
    });
    gsap.to(".hero__sun", { scrollTrigger: { end: "+=900", scrub: true, start: "top top" }, y: 90 });
    gsap.to(".hero__glow", { scrollTrigger: { end: "+=900", scrub: true, start: "top top" }, y: 48 });
    gsap.to(".hero__flowers", { scrollTrigger: { end: "+=700", scrub: true, start: "top top" }, y: -36 });
    if (!wideDesktop) {
      gsap.to(".hero__walkway", {
        ease: "none",
        scrollTrigger: { end: `+=${mobileJourneyParallax.range}`, scrub: true, start: "top top", trigger: root },
        y: mobileJourneyParallax.distance
      });
    }
    gsap.to(".hero__birds", { scrollTrigger: { end: "+=900", scrub: 1, start: "top 90%" }, x: 50, y: -18 });
    gsap.to(".wide-hero__clouds", { scrollTrigger: { end: "+=900", scrub: true, start: "top top" }, y: -38 });
    gsap.to(".wide-hero__atmosphere", { scrollTrigger: { end: "+=900", scrub: true, start: "top top" }, y: 44 });
    if (wideDesktop) {
      gsap.to(".wide-hero__journey", { scrollTrigger: { end: "+=10000", scrub: true, start: "top top", trigger: root }, y: -550 });
      gsap.to(".wide-invitation__backdrop", { scrollTrigger: { end: "+=12000", scrub: true, start: "top top", trigger: root }, y: 323 });
      gsap.to(".wide-invitation__scroll, .wide-invitation__ganesh, .wide-invitation__flourish", { scrollTrigger: { end: "+=9200", scrub: true, start: "top top", trigger: root }, y: -512 });
    }

    gsap.from(".invitation__copy, .wide-invitation__copy", {
      duration: .9,
      ease: "power2.out",
      opacity: 0,
      scrollTrigger: { start: "top 82%", trigger: wideDesktop ? ".wide-invitation__copy" : ".invitation__copy" },
      y: wideDesktop ? undefined : 36
    });
    if (wideDesktop) {
      gsap.to(".wide-invitation__copy", { scrollTrigger: { end: "+=9200", scrub: true, start: "top top", trigger: root }, y: -567 });
    }

    gsap.from(".timeline__heading", {
      delay: .45,
      duration: .7,
      ease: "power2.out",
      opacity: 0,
      y: 32
    });

    riseSelectors.forEach((selector) => {
      gsap.from(selector, {
        duration: .8,
        ease: "power2.out",
        opacity: 0,
        scale: .94,
        scrollTrigger: { start: "top 88%", trigger: selector },
        y: 56
      });
    });

    detailSelectors.forEach((selector) => {
      gsap.from(selector, {
        duration: .8,
        ease: "power2.out",
        opacity: 0,
        scale: .94,
        scrollTrigger: { start: "top 88%", trigger: selector },
        y: 56
      });
    });

    gsap.utils.toArray<HTMLElement>(".event-card").forEach((card, index) => {
      gsap.from(card, {
        ...timelineRevealState(index),
        delay: timelineRevealDelay(index, wideDesktop),
        duration: .85,
        ease: "power2.out",
        scrollTrigger: { start: "top 90%", trigger: card }
      });
    });

    gsap.to(".timeline__medallion", {
      rotation: 140,
      scrollTrigger: { end: "+=850", scrub: 1, start: "top bottom", trigger: ".timeline__medallion--1" }
    });
    gsap.from(".couple__heading", {
      duration: .9,
      ease: "power3.out",
      opacity: 0,
      scale: 1.35,
      scrollTrigger: { start: "top 88%", trigger: ".couple__heading" },
      y: 110
    });

    gsap.to(".couple__story span", {
      color: "#5f250f",
      ease: "none",
      stagger: .045,
      scrollTrigger: { end: storyScrollRange.end, scrub: .5, start: storyScrollRange.start, trigger: ".couple__story" }
    });

    gsap.utils.toArray<HTMLElement>(".gallery-photo").forEach((photo, index) => {
      gsap.from(photo, {
        duration: .75,
        ease: "back.out(1.35)",
        opacity: 0,
        scale: .72,
        scrollTrigger: { start: "top 94%", trigger: photo },
        y: 70 + index * 6
      });
    });

    gsap.utils.toArray<HTMLElement>(".wide-gallery-photo").forEach((photo, index) => {
      gsap.from(photo, {
        duration: .75,
        ease: "back.out(1.35)",
        opacity: 0,
        scale: .72,
        scrollTrigger: { start: "top 94%", trigger: photo },
        y: 70 + index * 4
      });
    });
  }, root);

  ScrollTrigger.refresh();
  return () => context.revert();
}

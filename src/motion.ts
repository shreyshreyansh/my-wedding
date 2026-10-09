import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const timelineRevealState = (index: number) => ({
  opacity: 0,
  rotation: index % 2 === 0 ? -10 : 10,
  x: index % 2 === 0 ? -60 : 60,
  y: 50
});

export const timelineRevealDelay = (index: number, wideDesktop: boolean) => wideDesktop ? index * .2 : 0;

export const heroParallaxSpeeds = {
  cloud: 170,
  mountain: 150,
  sky: 100,
  sun: 170,
  temple: 110
} as const;

export const parallaxOffset = (scrollY: number, speed: number) => speed === 100 ? 0 : -((speed - 100) / 100) * scrollY;
export const storyScrollRange = { start: "top 90%", end: "top 10%" } as const;

export const invitationRevealState = { opacity: 0, y: 24 } as const;
export const invitationRevealTransition = { bounce: .12, duration: .65, threshold: .15 } as const;
export const invitationParallaxSpeeds = { narrow: 120, wide: 110 } as const;
export const invitationArrowRevealDistance = { narrow: 32, wide: 24 } as const;
export const invitationRevealSteps = [
  { key: "ganpati-name", delay: 0 },
  { key: "ganpati-icon", delay: .05 },
  { key: "shri-line", delay: .1 },
  { key: "groom-parents", delay: .15 },
  { key: "invitation-line", delay: .2 },
  { key: "groom-name", delay: .25 },
  { key: "and", delay: .3 },
  { key: "bride-name", delay: .35 },
  { key: "daughter-of", delay: .4 },
  { key: "bride-parents", delay: .45 },
  { key: "events-intro", delay: .5 },
  { key: "events-arrow", delay: .55 }
] as const;

const motionSpringDefaults = {
  epsilon: .001,
  mass: 1,
  maxDamping: 1,
  maxDuration: 10,
  minDamping: .05,
  minDuration: .01,
  newtonIterations: 12
} as const;

const clamp = (minimum: number, maximum: number, value: number) => Math.min(maximum, Math.max(minimum, value));

function resolveMotionSpring(duration: number, bounce: number) {
  const durationSeconds = clamp(motionSpringDefaults.minDuration, motionSpringDefaults.maxDuration, duration);
  const dampingRatio = clamp(motionSpringDefaults.minDamping, motionSpringDefaults.maxDamping, 1 - bounce);
  const dampedFrequency = (frequency: number) => frequency * Math.sqrt(1 - dampingRatio * dampingRatio);
  const envelope = (frequency: number) => {
    const damping = frequency * dampingRatio;
    return motionSpringDefaults.epsilon - damping / dampedFrequency(frequency) * Math.exp(-damping * durationSeconds);
  };
  const derivative = (frequency: number) => {
    const dampingDuration = frequency * dampingRatio * durationSeconds;
    const squaredDamping = dampingRatio * dampingRatio * frequency * frequency * durationSeconds;
    const denominator = dampedFrequency(frequency * frequency);
    const direction = -envelope(frequency) + motionSpringDefaults.epsilon > 0 ? -1 : 1;
    return direction * (-squaredDamping * Math.exp(-dampingDuration)) / denominator;
  };

  let angularFrequency = 5 / durationSeconds;
  for (let iteration = 1; iteration < motionSpringDefaults.newtonIterations; iteration += 1) {
    angularFrequency -= envelope(angularFrequency) / derivative(angularFrequency);
  }

  const stiffness = angularFrequency * angularFrequency * motionSpringDefaults.mass;
  const damping = dampingRatio * 2 * Math.sqrt(motionSpringDefaults.mass * stiffness);
  return { damping, dampingRatio, stiffness };
}

/** Matches Motion's duration/bounce spring generator used by the reference Framer site. */
export function motionSpringProgress(
  progress: number,
  duration = invitationRevealTransition.duration,
  bounce = invitationRevealTransition.bounce
): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const { dampingRatio, stiffness } = resolveMotionSpring(duration, bounce);
  const angularFrequency = Math.sqrt(stiffness / motionSpringDefaults.mass);
  const dampedAngularFrequency = angularFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
  const seconds = progress * duration;
  const displacementCoefficient = dampingRatio * angularFrequency / dampedAngularFrequency;
  const decay = Math.exp(-dampingRatio * angularFrequency * seconds);
  return 1 - decay * (
    displacementCoefficient * Math.sin(dampedAngularFrequency * seconds)
    + Math.cos(dampedAngularFrequency * seconds)
  );
}

export const wideHeroRevealState = (index: number) => ({
  opacity: 1,
  rotation: [40, 33, -40][index] ?? 0,
  y: [862, 785, 864][index] ?? 0
});

const heroTitleSpeeds = [20, 30, 40] as const;
const heroTitleRotations = [32, -32, -32] as const;

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

  const invitationInlineStyles = Array.from(root.querySelectorAll<HTMLElement>("[data-invitation-motion]")).map((item) => ({
    item,
    opacity: item.style.opacity,
    parallaxY: item.style.getPropertyValue("--invitation-parallax-y"),
    revealY: item.style.getPropertyValue("--invitation-reveal-y")
  }));
  const restoreInlineProperty = (item: HTMLElement, property: string, value: string) => {
    if (value) item.style.setProperty(property, value);
    else item.style.removeProperty(property);
  };

  const context = gsap.context(() => {
    const reducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wideDesktop = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1280px)").matches;
    const revealed = [".event-card", ".couple__heading", ".gallery-photo", ".wide-gallery-photo", ...riseSelectors, ...detailSelectors];

    if (reducedMotion) {
      gsap.set(revealed, { clearProps: "transform,opacity" });
      gsap.utils.toArray<HTMLElement>("[data-invitation-motion]").forEach((item) => {
        item.style.setProperty("--invitation-parallax-y", "0px");
        item.style.setProperty("--invitation-reveal-y", "0px");
        item.style.opacity = "1";
      });
      gsap.set(".couple__story span", { color: "#5f250f" });
      return;
    }

    const pageScrollDistance = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const addPageParallax = (selector: string, speed: number) => {
      if (speed === 100) return;
      gsap.to(selector, {
        ease: "none",
        scrollTrigger: {
          end: "bottom bottom",
          invalidateOnRefresh: true,
          scrub: true,
          start: "top top",
          trigger: root
        },
        y: () => parallaxOffset(pageScrollDistance(), speed)
      });
    };

    if (wideDesktop) {
      gsap.from(".hero__title-reveal", {
        delay: 1,
        duration: (index) => index === 1 ? 6.7 : 6.5,
        ease: "elastic.out(1, .55)",
        rotation: (index) => wideHeroRevealState(index).rotation,
        transformOrigin: "50% 50%",
        y: (index) => wideHeroRevealState(index).y
      });
    } else {
      gsap.from(".hero__title-reveal", {
        duration: 1.25,
        ease: "power3.out",
        opacity: 0,
        rotation: (index) => index === 1 ? -3 : index === 0 ? -1.5 : 1.5,
        scale: 1.08,
        stagger: .11,
        y: -30
      });
    }

    gsap.utils.toArray<HTMLElement>(".hero__title > span").forEach((title, index) => {
      const scrollDistance = wideDesktop ? 1236 : 852;
      gsap.to(title, {
        ease: "none",
        opacity: .3,
        rotation: heroTitleRotations[index] ?? 0,
        scale: .5,
        scrollTrigger: { end: `+=${scrollDistance}`, scrub: true, start: "top top", trigger: root },
        y: parallaxOffset(scrollDistance, heroTitleSpeeds[index] ?? 100)
      });
    });

    addPageParallax(".hero__glow", heroParallaxSpeeds.cloud);
    addPageParallax(".hero__sun", heroParallaxSpeeds.sun);
    addPageParallax(".hero__mountains", heroParallaxSpeeds.mountain);
    addPageParallax(".hero__walkway", heroParallaxSpeeds.temple);
    addPageParallax(".hero__flag", heroParallaxSpeeds.temple);
    addPageParallax(".hero__waving-flag", heroParallaxSpeeds.temple);
    gsap.to(".hero__birds", { scrollTrigger: { end: "+=900", scrub: 1, start: "top 90%" }, x: 50, y: -18 });

    addPageParallax(".wide-hero__clouds", heroParallaxSpeeds.cloud);
    addPageParallax(".wide-hero__temple", heroParallaxSpeeds.sun);
    addPageParallax(".wide-hero__foreground", heroParallaxSpeeds.mountain);
    addPageParallax(".wide-hero__journey", heroParallaxSpeeds.temple);
    addPageParallax(".wide-hero__flag", heroParallaxSpeeds.temple);
    if (wideDesktop) {
      gsap.to(".wide-invitation__backdrop", { scrollTrigger: { end: "+=12000", scrub: true, start: "top top", trigger: root }, y: 323 });
    }

    const activeInvitationSelector = wideDesktop
      ? ".wide-invitation__scroll[data-invitation-motion], .wide-invitation__ganesh[data-invitation-motion], .wide-invitation__flourish[data-invitation-motion], .wide-invitation__copy [data-invitation-motion], .invitation__arrow[data-invitation-motion]"
      : ".invitation__scroll[data-invitation-motion], .invitation__ganesh[data-invitation-motion], .invitation__birds[data-invitation-motion], .invitation__copy [data-invitation-motion], .invitation__arrow[data-invitation-motion]";
    const invitationSpeed = wideDesktop ? invitationParallaxSpeeds.wide : invitationParallaxSpeeds.narrow;
    const invitationDelays = new Map<string, number>(invitationRevealSteps.map((step) => [step.key, step.delay]));
    gsap.utils.toArray<HTMLElement>(activeInvitationSelector).forEach((item) => {
      const key = item.dataset.invitationMotion ?? "";
      const itemSpeed = Number.parseFloat(item.dataset.invitationSpeed ?? "") || invitationSpeed;
      const revealDistance = key === "events-arrow"
        ? invitationArrowRevealDistance[wideDesktop ? "wide" : "narrow"]
        : invitationRevealState.y;
      const reveal = { progress: invitationRevealState.opacity };
      item.style.setProperty("--invitation-reveal-y", `${revealDistance}px`);
      item.style.opacity = `${invitationRevealState.opacity}`;
      const revealTween = gsap.to(reveal, {
        delay: invitationDelays.get(key) ?? 0,
        duration: invitationRevealTransition.duration,
        ease: motionSpringProgress,
        onUpdate: () => {
          item.style.setProperty("--invitation-reveal-y", `${revealDistance * (1 - reveal.progress)}px`);
          item.style.opacity = `${reveal.progress}`;
        },
        paused: true,
        progress: 1
      });
      ScrollTrigger.create({
        invalidateOnRefresh: true,
        once: true,
        onEnter: () => revealTween.restart(true),
        start: () => {
          const styles = getComputedStyle(item);
          const parallaxY = Number.parseFloat(styles.getPropertyValue("--invitation-parallax-y")) || 0;
          const revealY = Number.parseFloat(styles.getPropertyValue("--invitation-reveal-y")) || 0;
          const currentTop = item.getBoundingClientRect().top + window.scrollY;
          const layoutTop = currentTop - parallaxY - revealY;
          const visibleThreshold = window.innerHeight - item.offsetHeight * invitationRevealTransition.threshold;
          const startScroll = Math.max(0, (layoutTop - visibleThreshold) / (itemSpeed / 100));
          return `top ${currentTop - startScroll}px`;
        },
        trigger: item
      });
      gsap.to(item, {
        "--invitation-parallax-y": () => `${parallaxOffset(pageScrollDistance(), itemSpeed)}px`,
        ease: "none",
        scrollTrigger: {
          end: "bottom bottom",
          invalidateOnRefresh: true,
          scrub: true,
          start: "top top",
          trigger: root
        }
      });
    });

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
      scrollTrigger: { end: storyScrollRange.end, scrub: .3, start: storyScrollRange.start, trigger: ".couple__story" }
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
  return () => {
    context.revert();
    invitationInlineStyles.forEach(({ item, opacity, parallaxY, revealY }) => {
      item.style.opacity = opacity;
      restoreInlineProperty(item, "--invitation-parallax-y", parallaxY);
      restoreInlineProperty(item, "--invitation-reveal-y", revealY);
    });
  };
}

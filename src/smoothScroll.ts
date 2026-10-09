import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function smoothScrollIntensity(width: number): number {
  if (width >= 1280) return 40;
  if (width >= 768) return 30;
  if (width >= 390) return 60;
  if (width >= 375) return 30;
  if (width >= 360) return 60;
  return 30;
}

function shouldStopScrolling(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.style.overflow === "hidden"
    || document.querySelector("[data-frameruni-stop-scroll]") !== null;
}

function markScrollableElements(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>("*"))
    .filter((element) => getComputedStyle(element).overflow === "auto")
    .filter((element) => {
      if (element.hasAttribute("data-lenis-prevent")) return false;
      element.setAttribute("data-lenis-prevent", "true");
      return true;
    });
}

export function initSmoothScroll(): () => void {
  let lenis: Lenis | undefined;
  let removeScrollListener: (() => void) | undefined;
  let tickerAttached = false;
  let disposed = false;
  let intensity = smoothScrollIntensity(window.innerWidth);
  const markedElements = markScrollableElements();
  const reducedMotionQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : undefined;

  const animate = (time: number) => lenis?.raf(time * 1000);

  const destroyLenis = () => {
    removeScrollListener?.();
    removeScrollListener = undefined;
    if (tickerAttached) {
      gsap.ticker.remove(animate);
      tickerAttached = false;
    }
    lenis?.destroy();
    lenis = undefined;
  };

  const createLenis = () => {
    destroyLenis();
    if (reducedMotionQuery?.matches) return;
    lenis = new Lenis({ duration: intensity / 10 });
    removeScrollListener = lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(animate);
    gsap.ticker.lagSmoothing(0);
    tickerAttached = true;
    if (shouldStopScrolling()) lenis.stop();
  };

  const handleResize = () => {
    const nextIntensity = smoothScrollIntensity(window.innerWidth);
    if (nextIntensity === intensity) {
      lenis?.resize();
      return;
    }
    intensity = nextIntensity;
    createLenis();
  };

  const handleMotionPreference = () => createLenis();

  const observer = new MutationObserver(() => {
    if (disposed || typeof document === "undefined") return;
    if (shouldStopScrolling()) lenis?.stop();
    else lenis?.start();
  });

  createLenis();
  window.addEventListener("resize", handleResize);
  reducedMotionQuery?.addEventListener("change", handleMotionPreference);
  observer.observe(document.documentElement, { attributeFilter: ["style"], attributes: true, childList: true, subtree: true });

  return () => {
    disposed = true;
    window.removeEventListener("resize", handleResize);
    reducedMotionQuery?.removeEventListener("change", handleMotionPreference);
    observer.takeRecords();
    observer.disconnect();
    markedElements.forEach((element) => element.removeAttribute("data-lenis-prevent"));
    destroyLenis();
  };
}

import { useEffect, useRef, useState } from "react";

type HangingBellProps = {
  className: string;
  file: string;
  mass?: number;
  volume?: number;
};

export function bellIdleAngle(timeMs: number, amplitude = 2.5, periodSeconds = 5) {
  const periodMs = Math.max(periodSeconds, .5) * 1000;
  return Math.sin((timeMs % periodMs) / periodMs * Math.PI * 2) * amplitude;
}

export function HangingBell({ className, file, mass = 1.5, volume = .6 }: HangingBellProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const body = bodyRef.current;
    if (!host || !body) return undefined;

    const proximityRadius =
      typeof window.matchMedia === "function" && window.matchMedia("(min-width: 600px)").matches
        ? 220
        : 57;
    const maxAngle = 18;
    const stiffness = 40;
    const damping = 6;
    let interactiveAngle = 0;
    let angle = 0;
    let velocity = 0;
    let previous = performance.now();
    let frame = 0;
    let tapTimer = 0;
    let inView = true;
    let wasInRange = false;
    let lastPlayed = 0;
    let unlocked = false;
    const audio = new Audio("/assets/audio/bell.mp3");
    audio.preload = "none";

    const playChime = () => {
      const now = performance.now();
      if (now - lastPlayed < 500) return;
      lastPlayed = now;
      const sound = audio.cloneNode(true) as HTMLAudioElement;
      sound.volume = volume;
      void sound.play().catch(() => undefined);
    };

    const unlock = (event: Event) => {
      if ("pointerType" in event && (event as PointerEvent).pointerType === "touch") return;
      if (unlocked) return;
      audio.muted = true;
      void audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        unlocked = true;
      }).catch(() => {
        audio.muted = false;
      });
    };

    const pointerMove = (event: PointerEvent) => {
      if (!inView || (event.pointerType && event.pointerType !== "mouse")) return;
      const rect = host.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height * .55);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < proximityRadius) {
        const intensity = 1 - distance / proximityRadius;
        interactiveAngle = (dx === 0 ? 0 : Math.sign(dx)) * intensity * maxAngle;
        if (!wasInRange) playChime();
        wasInRange = true;
      } else {
        interactiveAngle = 0;
        wasInRange = false;
      }
    };

    const pointerDown = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      interactiveAngle = (event.clientX < rect.left + rect.width / 2 ? -1 : 1) * maxAngle;
      playChime();
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => {
        interactiveAngle = 0;
      }, 180);
    };

    const render = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .05);
      previous = now;
      const target = bellIdleAngle(now) + interactiveAngle;
      const acceleration = (-stiffness * (angle - target) - damping * velocity) / mass;
      velocity += acceleration * dt;
      angle += velocity * dt;
      body.style.transform = `rotate(${angle}deg)`;
      frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    host.addEventListener("pointerdown", pointerDown);
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
          }, { rootMargin: "200px" })
        : undefined;
    observer?.observe(host);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(tapTimer);
      observer?.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      host.removeEventListener("pointerdown", pointerDown);
    };
  }, [mass, volume]);

  return (
    <div className={className} ref={hostRef} role="img" aria-label="Hanging bell with flowers" data-image-ready={imageReady}>
      <div className="hanging-bell__body" ref={bodyRef}>
        <img
          src={`/assets/images/${file}`}
          alt=""
          decoding="async"
          draggable={false}
          onLoad={() => setImageReady(true)}
        />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

const galleryImages = [
  "/assets/images/168da128a8e901f1.jpg",
  "/assets/images/f040aa1665712b60.jpg",
  "/assets/images/a61357452d171e8a.jpg",
  "/assets/images/9ba687f83a127bc5.jpg",
  "/assets/images/ef3c5df9109128c5.jpg"
] as const;

const stiffness = 60;
const damping = 12;
const mass = 1.5;

export function galleryLayout(viewportWidth: number) {
  if (viewportWidth <= 430) return { arcRadius: 200, imageSize: 80, galleryHeight: 340 };
  if (viewportWidth <= 810) return { arcRadius: 340, imageSize: 120, galleryHeight: 540 };
  return { arcRadius: 500, imageSize: 160, galleryHeight: 760 };
}

export function galleryRotation(scrollY: number, centerY: number, viewportHeight: number) {
  const start = centerY - viewportHeight;
  const end = centerY - 100;
  const progress = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
  return progress * 180;
}

export function RotatingGallery() {
  const hostRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => galleryLayout(typeof window === "undefined" ? 393 : window.innerWidth));
  const rays = useMemo(() => [...galleryImages, ...galleryImages].map((src, index) => ({
    angle: index * 36,
    src
  })), []);

  useEffect(() => {
    const onResize = () => setLayout(galleryLayout(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const rotor = rotorRef.current;
    if (!host || !rotor) return undefined;

    let value = 0;
    let velocity = 0;
    let target = 0;
    let previous = performance.now();
    let frame = 0;
    let running = true;

    const updateTarget = () => {
      const bounds = host.getBoundingClientRect();
      const centerY = bounds.top + window.scrollY + layout.galleryHeight / 2;
      target = galleryRotation(window.scrollY, centerY, window.innerHeight);
    };

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - previous) / 1000, .05);
      previous = now;
      const acceleration = (-stiffness * (value - target) - damping * velocity) / mass;
      velocity += acceleration * dt;
      value += velocity * dt;
      rotor.style.transform = `rotate(${value}deg)`;
      frame = requestAnimationFrame(render);
    };

    updateTarget();
    window.addEventListener("scroll", updateTarget, { passive: true });
    frame = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTarget);
    };
  }, [layout]);

  const { arcRadius, imageSize, galleryHeight } = layout;
  return (
    <div className="rotating-gallery" ref={hostRef} data-animation="rotating-gallery">
      <div
        className="rotating-gallery__mask"
        style={{ height: arcRadius + imageSize }}
      >
        <div
          className="rotating-gallery__rotor"
          ref={rotorRef}
          style={{
            height: arcRadius * 2,
            marginLeft: -arcRadius,
            top: imageSize,
            width: arcRadius * 2
          }}
        >
          {rays.map((ray, index) => {
            const radians = (ray.angle - 90) * Math.PI / 180;
            const x = arcRadius + Math.cos(radians) * arcRadius - imageSize / 2;
            const y = arcRadius + Math.sin(radians) * arcRadius - imageSize / 2;
            return (
              <div
                className="rotating-gallery__ray"
                key={`${ray.src}-${index}`}
                style={{
                  left: x,
                  top: y,
                  transform: `rotate(${ray.angle}deg)`,
                  width: imageSize
                }}
              >
                <img
                  src={ray.src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  style={{ height: imageSize, width: imageSize }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <span className="sr-only">Wedding photo gallery</span>
      <span aria-hidden="true" style={{ display: "block", height: galleryHeight }} />
    </div>
  );
}

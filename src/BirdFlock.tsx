import { useEffect, useRef } from "react";
// The reference animation runs on Three.js r136, whose package predates bundled TypeScript declarations.
// @ts-expect-error The runtime module is pinned to the exact reference revision.
import * as THREE from "three";

const birdVertices = new Float32Array([
  0, 0, -1.5, -3, 0, 0, 0, 0, 1.5,
  0, 0, -1.5, 0, 0, 1.5, 0, .6, 0,
  0, 0, -1.5, 3, 0, 0, 0, 0, 1.5
]);

export function createBirdGeometry() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(birdVertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function BirdFlock() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    if (host.clientWidth === 0 && host.clientHeight === 0) return undefined;

    const wideDesktop = window.matchMedia("(min-width: 1280px)").matches;
    const birdCount = 20;
    const birdSize = wideDesktop ? .8 : 1;
    const cohesion = wideDesktop ? .5 : 1.2;
    const maxSpeed = 3;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, (host.clientWidth || 400) / (host.clientHeight || 400), 1, 3000);
    camera.position.z = 350;

    let renderer: InstanceType<typeof THREE.WebGLRenderer>;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return undefined;
    }

    renderer.setSize(host.clientWidth || 400, host.clientHeight || 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.replaceChildren(renderer.domElement);

    const boids = Array.from({ length: birdCount }, () => ({
      position: new THREE.Vector3((Math.random() - .5) * 350, (Math.random() - .5) * 350, (Math.random() - .5) * 350),
      velocity: new THREE.Vector3((Math.random() - .5) * 2, (Math.random() - .5) * 2, (Math.random() - .5) * 2),
      acceleration: new THREE.Vector3(),
      phase: Math.random() * Math.PI * 2
    }));
    const baseGeometry = createBirdGeometry();
    const flock = new THREE.Group();
    const meshes = boids.map(() => {
      const mesh = new THREE.Mesh(
        baseGeometry.clone(),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("rgb(36, 0, 0)"), side: THREE.DoubleSide })
      );
      flock.add(mesh);
      return mesh;
    });
    scene.add(flock);

    const baseline = (baseGeometry.attributes.position.array as Float32Array).slice();
    const pointer = new THREE.Vector3(0, 0, 0);
    const alignment = new THREE.Vector3();
    const separation = new THREE.Vector3();
    const cohesionVector = new THREE.Vector3();
    const offset = new THREE.Vector3();
    const attraction = new THREE.Vector3();
    const delta = new THREE.Vector3();
    const clock = new THREE.Clock();
    let animationFrame = 0;
    let running = false;

    const handlePointerMove = (event: MouseEvent) => {
      const bounds = host.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
      pointer.set(x * 200, y * 200, 0);
    };
    window.addEventListener("mousemove", handlePointerMove);

    const render = () => {
      if (!running) return;
      const step = Math.min(clock.getDelta(), .1);
      const elapsed = clock.getElapsedTime();

      boids.forEach((boid, index) => {
        boid.acceleration.set(0, 0, 0);
        alignment.set(0, 0, 0);
        separation.set(0, 0, 0);
        cohesionVector.set(0, 0, 0);
        let neighbors = 0;

        boids.forEach((other, otherIndex) => {
          if (index === otherIndex) return;
          const distance = boid.position.distanceToSquared(other.position);
          if (distance >= 6400) return;
          alignment.add(other.position);
          cohesionVector.add(other.velocity);
          neighbors += 1;
          if (distance > 0 && distance < 625) {
            offset.subVectors(boid.position, other.position).normalize().divideScalar(Math.sqrt(distance));
            separation.add(offset);
          }
        });

        if (neighbors > 0) {
          alignment.divideScalar(neighbors).sub(boid.position).normalize().multiplyScalar(cohesion);
          boid.acceleration.add(alignment);
          cohesionVector.divideScalar(neighbors).normalize().multiplyScalar(.5);
          boid.acceleration.add(cohesionVector);
          separation.normalize().multiplyScalar(1.5);
          boid.acceleration.add(separation);
        }

        attraction.subVectors(pointer, boid.position);
        if (attraction.lengthSq() > 0) {
          attraction.normalize().multiplyScalar(cohesion * .8);
          boid.acceleration.add(attraction);
        }
        if (Math.abs(boid.position.x) > 220) boid.acceleration.x -= Math.sign(boid.position.x) * 2;
        if (Math.abs(boid.position.y) > 220) boid.acceleration.y -= Math.sign(boid.position.y) * 2;
        if (Math.abs(boid.position.z) > 220) boid.acceleration.z -= Math.sign(boid.position.z) * 2;

        delta.copy(boid.acceleration).multiplyScalar(step * 5);
        boid.velocity.add(delta);
        const maximumVelocity = maxSpeed * maxSpeed;
        if (boid.velocity.lengthSq() > maximumVelocity) boid.velocity.normalize().multiplyScalar(maxSpeed);
        delta.copy(boid.velocity).multiplyScalar(step * 40);
        boid.position.add(delta);

        const mesh = meshes[index];
        mesh.position.copy(boid.position);
        delta.addVectors(boid.position, boid.velocity);
        mesh.lookAt(delta);
        mesh.scale.setScalar(birdSize);
        const speed = boid.velocity.length();
        const flap = Math.sin(elapsed * speed * 4 + boid.phase) * 1.5;
        const position = mesh.geometry.attributes.position;
        const values = position.array as Float32Array;
        values.set(baseline);
        values[4] = flap;
        values[22] = flap;
        position.needsUpdate = true;
      });

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const start = () => {
      if (running) return;
      running = true;
      clock.start();
      render();
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    }, { threshold: .1 });
    intersectionObserver.observe(host);

    return () => {
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handlePointerMove);
      meshes.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      baseGeometry.dispose();
      renderer.dispose();
      host.replaceChildren();
    };
  }, []);

  return <div className="hero__flock" data-animation="flocking-birds" ref={hostRef} aria-hidden="true" />;
}

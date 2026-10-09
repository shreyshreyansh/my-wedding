import { useEffect, useMemo, useRef } from "react";

type FlagProps = {
  className?: string;
};

type FlagSettings = {
  mode: "Waving" | "Still";
  windStrength: number;
  speed: number;
  weaveIntensity: number;
  sheen: number;
  brightness: number;
  shading: number;
};

export function createFlagPlane(segmentsX: number, segmentsY: number) {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= segmentsY; y += 1) {
    for (let x = 0; x <= segmentsX; x += 1) {
      const u = x / segmentsX;
      const v = y / segmentsY;
      vertices.push(u, v);
      uvs.push(u, v);
    }
  }
  for (let y = 0; y < segmentsY; y += 1) {
    for (let x = 0; x < segmentsX; x += 1) {
      const i = y * (segmentsX + 1) + x;
      const c = i + segmentsX + 1;
      indices.push(i, c, i + 1, i + 1, c, c + 1);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices)
  };
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create flag shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown flag shader compile error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create flag program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown flag program link error";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function uploadFallback(gl: WebGL2RenderingContext, texture: WebGLTexture) {
  const pixel = new Uint8Array([215, 111, 39, 255]);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

const VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 aUV;
uniform float uTime;
uniform float uCanvasAspect;
uniform float uPlaneAspect;
uniform float uAmbientAmp;
uniform float uSpeed;
uniform vec2 uGustCenter;
uniform vec2 uGustVelocity;
uniform float uGustStrength;
out vec2 vUV;
out vec3 vNormal;
out vec3 vPos;
out vec3 vTangent;

void main() {
    float u = aUV.x;
    float v = aUV.y;
    float t = uTime * uSpeed;

    float c1 = cos(10.0*u + 2.3*t + 1.5*v);
    float c2 = cos(16.0*u - 3.1*t + 0.8*v);
    float c3 = cos(22.0*u + 12.0*v + 1.7*t);

    float s1 = sin(10.0*u + 2.3*t + 1.5*v);
    float s2 = sin(16.0*u - 3.1*t + 0.8*v);
    float s3 = sin(22.0*u + 12.0*v + 1.7*t);

    float ambient = uAmbientAmp * (0.55*s1 + 0.30*s2 + 0.15*s3);
    float dhdu = uAmbientAmp * (0.55*10.0*c1 + 0.30*16.0*c2 + 0.15*22.0*c3);
    float dhdv = uAmbientAmp * (0.55*1.5*c1 + 0.30*0.8*c2 + 0.15*12.0*c3);

    vec2 d = vec2(u, v) - uGustCenter;
    float sigma = 20.0;
    float G = exp(-dot(d, d) * sigma);

    float vMag = length(uGustVelocity);
    float vBlend = smoothstep(0.01, 0.22, vMag);
    vec2 vDir = vMag > 0.0001 ? normalize(uGustVelocity) : vec2(0.86, 0.34);
    vec2 dir = normalize(mix(vec2(0.86, 0.34), vDir, vBlend));
    vec2 perp = vec2(-dir.y, dir.x);

    float p1 = dot(d, dir) * 13.0 - 2.4 * t;
    float p2 = dot(d, perp) * 10.5 - 1.7 * t + 1.4;
    float p3 = dot(d, normalize(dir + perp * 0.45)) * 15.0 + 1.1 * t + 0.8;

    float n1 = sin(7.0*u + 5.0*v + 1.3*t);
    float n2 = sin(13.0*u - 9.0*v - 0.7*t);
    float n3 = sin(19.0*u + 17.0*v + 0.31*t);
    float noiseM = 0.50 + 0.28*n1 + 0.14*n2 + 0.08*n3;
    float dNoiseDu = 0.28*cos(7.0*u + 5.0*v + 1.3*t)*7.0 + 0.14*cos(13.0*u - 9.0*v - 0.7*t)*13.0 + 0.08*cos(19.0*u + 17.0*v + 0.31*t)*19.0;
    float dNoiseDv = 0.28*cos(7.0*u + 5.0*v + 1.3*t)*5.0 + 0.14*cos(13.0*u - 9.0*v - 0.7*t)*-9.0 + 0.08*cos(19.0*u + 17.0*v + 0.31*t)*17.0;

    float w = 0.50*sin(p1) + 0.30*sin(p2) + 0.20*sin(p3);
    float dWdu = 0.50*cos(p1)*(13.0*dir.x) + 0.30*cos(p2)*(10.5*perp.x) + 0.20*cos(p3)*(15.0*normalize(dir + perp * 0.45).x);
    float dWdv = 0.50*cos(p1)*(13.0*dir.y) + 0.30*cos(p2)*(10.5*perp.y) + 0.20*cos(p3)*(15.0*normalize(dir + perp * 0.45).y);

    float r = length(d);
    float pr = r * 19.0 - 1.35 * t;
    float radialBlend = 1.0 - vBlend;
    float radial = sin(pr) * radialBlend;
    float invR = 1.0 / max(r, 0.0008);
    float dRdu = d.x * invR;
    float dRdv = d.y * invR;
    float dRadialDu = cos(pr) * 19.0 * dRdu * radialBlend;
    float dRadialDv = cos(pr) * 19.0 * dRdv * radialBlend;

    float gustPattern = w * (0.78 + 0.22 * noiseM) + 0.18 * radial;
    float dPatternDu = dWdu * (0.78 + 0.22 * noiseM) + w * 0.22 * dNoiseDu + 0.18 * dRadialDu;
    float dPatternDv = dWdv * (0.78 + 0.22 * noiseM) + w * 0.22 * dNoiseDv + 0.18 * dRadialDv;

    float gustAmp = uGustStrength * 0.085;
    float gust = gustAmp * G * gustPattern;
    float dGdu = -2.0 * sigma * d.x * G;
    float dGdv = -2.0 * sigma * d.y * G;
    dhdu += gustAmp * (dGdu * gustPattern + G * dPatternDu);
    dhdv += gustAmp * (dGdv * gustPattern + G * dPatternDv);

    float z = ambient + gust;
    float s = 2.0 * v - 1.0;
    float absS = abs(s);
    float uPow = pow(u, 1.2);
    float edgeTerm = pow(absS, 1.7);
    float edgeMix = 0.2 + 0.8 * edgeTerm;
    float envelope = uPow * edgeMix;
    float dUPowDu = 1.2 * pow(max(u, 0.0001), 0.2);
    float signS = s < 0.0 ? -1.0 : 1.0;
    float dEdgeTermDv = 1.7 * pow(max(absS, 0.0001), 0.7) * signS * 2.0;
    float dEnvelopeDu = dUPowDu * edgeMix;
    float dEnvelopeDv = uPow * 0.8 * dEdgeTermDv;

    float latWaveX = 0.65 * s1 + 0.25 * s2 + 0.10 * s3 + 0.35 * gustPattern;
    float latWaveY = 0.45 * c1 - 0.35 * c2 + 0.20 * s3 + 0.28 * gustPattern;
    float dLatWaveXDu = 0.65 * 10.0 * c1 + 0.25 * 16.0 * c2 + 0.10 * 22.0 * c3 + 0.35 * dPatternDu;
    float dLatWaveXDv = 0.65 * 1.5 * c1 + 0.25 * 0.8 * c2 + 0.10 * 12.0 * c3 + 0.35 * dPatternDv;
    float dLatWaveYDu = 0.45 * (-10.0 * s1) - 0.35 * (-16.0 * s2) + 0.20 * 22.0 * c3 + 0.28 * dPatternDu;
    float dLatWaveYDv = 0.45 * (-1.5 * s1) - 0.35 * (-0.8 * s2) + 0.20 * 12.0 * c3 + 0.28 * dPatternDv;

    float motionGain = clamp(0.30 + uAmbientAmp * 4.2 + uGustStrength * 0.22, 0.2, 1.2);
    float latScaleX = 0.06 * uPlaneAspect;
    float latScaleY = 0.05;
    float xOff = latScaleX * envelope * motionGain * latWaveX;
    float yOff = latScaleY * envelope * motionGain * latWaveY;
    float dxdu = latScaleX * motionGain * (dEnvelopeDu * latWaveX + envelope * dLatWaveXDu);
    float dxdv = latScaleX * motionGain * (dEnvelopeDv * latWaveX + envelope * dLatWaveXDv);
    float dydu = latScaleY * motionGain * (dEnvelopeDu * latWaveY + envelope * dLatWaveYDu);
    float dydv = latScaleY * motionGain * (dEnvelopeDv * latWaveY + envelope * dLatWaveYDv);

    vec3 p = vec3((u - 0.5) * uPlaneAspect + xOff, (v - 0.5) + yOff, z);
    vec3 dpdu = vec3(uPlaneAspect + dxdu, dydu, dhdu);
    vec3 dpdv = vec3(dxdv, 1.0 + dydv, dhdv);
    vec3 n = normalize(cross(dpdu, dpdv));
    vec3 tng = normalize(dpdu);

    float margin = 0.88;
    float k = (uCanvasAspect > uPlaneAspect ? 2.0 : (2.0 * uCanvasAspect / uPlaneAspect)) * margin;
    vec2 clip = vec2(p.x * k / uCanvasAspect, p.y * k);

    gl_Position = vec4(clip, z * 0.26, 1.0);
    vUV = aUV;
    vNormal = n;
    vPos = p;
    vTangent = tng;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vUV;
in vec3 vNormal;
in vec3 vPos;
in vec3 vTangent;
uniform sampler2D uTex;
uniform vec2 uUvScale;
uniform vec2 uUvOffset;
uniform float uWeave;
uniform float uSheen;
uniform float uBrightness;
uniform float uShading;
out vec4 outColor;

void main() {
    vec2 uv = (vUV - 0.5) * uUvScale + 0.5 + uUvOffset;
    vec4 tex = texture(uTex, uv);
    float tx = sin(vUV.x * 1200.0);
    float ty = sin(vUV.y * 900.0);
    float weave = 0.5 + 0.5 * tx * ty;
    float fiber = mix(1.0, 0.90 + 0.10 * weave, uWeave);
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(-0.45, 0.55, 0.72));
    vec3 V = normalize(vec3(0.0, 0.0, 1.6) - vPos);
    vec3 H = normalize(L + V);
    float ndl = max(dot(N, L), 0.0);
    float ao = 1.0 - clamp((1.0 - N.z) * 0.32, 0.0, 0.32);
    float nh = max(dot(N, H), 0.0);
    float th = max(abs(dot(normalize(vTangent), H)), 0.0);
    float anis = mix(1.0, pow(th, 0.5), uSheen);
    float spec = pow(nh, mix(24.0, 70.0, uSheen)) * anis * uSheen;
    vec3 base = tex.rgb * fiber;
    float shade = mix(1.0, (0.20 + 0.80 * ndl) * ao, uShading);
    vec3 lit = (base * shade + vec3(spec)) * uBrightness;
    outColor = vec4(lit * tex.a, tex.a);
}
`;

export function WavingFlag({ className }: FlagProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useMemo<FlagSettings>(() => ({
    mode: "Waving",
    windStrength: 2,
    speed: 3,
    weaveIntensity: 1,
    sheen: 1,
    brightness: 1.21,
    shading: .51
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.clientWidth === 0 || canvas.clientHeight === 0) return undefined;
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true
    });
    if (!gl) return undefined;

    let program: WebGLProgram;
    try {
      program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    } catch {
      return undefined;
    }

    const plane = createFlagPlane(96, 64);
    const vao = gl.createVertexArray();
    const vertexBuffer = gl.createBuffer();
    const uvBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!vao || !vertexBuffer || !uvBuffer || !indexBuffer || !texture) {
      gl.deleteProgram(program);
      return undefined;
    }

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, plane.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, plane.uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    uploadFallback(gl, texture);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const locations = {
      time: uniform("uTime"),
      canvasAspect: uniform("uCanvasAspect"),
      planeAspect: uniform("uPlaneAspect"),
      ambient: uniform("uAmbientAmp"),
      speed: uniform("uSpeed"),
      gustCenter: uniform("uGustCenter"),
      gustVelocity: uniform("uGustVelocity"),
      gustStrength: uniform("uGustStrength"),
      uvScale: uniform("uUvScale"),
      uvOffset: uniform("uUvOffset"),
      weave: uniform("uWeave"),
      sheen: uniform("uSheen"),
      brightness: uniform("uBrightness"),
      shading: uniform("uShading"),
      texture: uniform("uTex")
    };

    let imageAspect = 1;
    const planeAspect = 1.5;
    let uvScale: [number, number] = [1, 1];
    const updateCover = () => {
      uvScale = imageAspect > planeAspect
        ? [planeAspect / imageAspect, 1]
        : [1, imageAspect / planeAspect];
    };

    const image = new Image();
    image.onload = () => {
      imageAspect = image.naturalWidth > 0 && image.naturalHeight > 0
        ? image.naturalWidth / image.naturalHeight
        : 1;
      updateCover();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.bindTexture(gl.TEXTURE_2D, null);
    };
    image.src = "/assets/images/wide-flag-cloth.png";

    const gustTarget = { strength: 0, center: [.5, .5] as [number, number], velocity: [0, 0] as [number, number] };
    const gust = { strength: 0, center: [.5, .5] as [number, number], velocity: [0, 0] as [number, number] };
    let lastPointer: { u: number; v: number; time: number } | null = null;
    let ambient = settings.mode === "Still" ? .015 : .06;
    let frame = 0;
    let visible = true;
    let destroyed = false;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const canvasAspect = rect.width / Math.max(1, rect.height);
      let drawWidth = rect.width;
      let drawHeight = rect.height;
      if (canvasAspect > planeAspect) drawWidth = rect.height * planeAspect;
      else drawHeight = rect.width / planeAspect;
      const offsetX = (rect.width - drawWidth) * .5;
      const offsetY = (rect.height - drawHeight) * .5;
      const u = Math.min(1, Math.max(0, (x - offsetX) / Math.max(1, drawWidth)));
      const v = Math.min(1, Math.max(0, 1 - (y - offsetY) / Math.max(1, drawHeight)));
      gustTarget.center = [u, v];
      const now = performance.now();
      if (lastPointer) {
        const dt = Math.max(.001, (now - lastPointer.time) * .001);
        gustTarget.velocity = [
          gustTarget.velocity[0] * .7 + ((u - lastPointer.u) / dt) * .3,
          gustTarget.velocity[1] * .7 + ((v - lastPointer.v) / dt) * .3
        ];
      }
      lastPointer = { u, v, time: now };
    };

    const pointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") gustTarget.strength = 1;
    };
    const pointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        gustTarget.strength = 0;
        lastPointer = null;
      }
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        gustTarget.strength = 1;
        updatePointer(event.clientX, event.clientY);
      }
    };
    const pointerMove = (event: PointerEvent) => updatePointer(event.clientX, event.clientY);
    const pointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        gustTarget.strength = 0;
        lastPointer = null;
      }
    };

    canvas.addEventListener("pointerenter", pointerEnter);
    canvas.addEventListener("pointerleave", pointerLeave);
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const started = performance.now();
    const render = () => {
      if (destroyed) return;
      resize();
      const time = (performance.now() - started) * .001;
      gust.strength += (gustTarget.strength - gust.strength) * .045;
      gust.center[0] += (gustTarget.center[0] - gust.center[0]) * .1;
      gust.center[1] += (gustTarget.center[1] - gust.center[1]) * .1;
      gust.velocity[0] += (gustTarget.velocity[0] - gust.velocity[0]) * .12;
      gust.velocity[1] += (gustTarget.velocity[1] - gust.velocity[1]) * .12;
      gustTarget.velocity[0] *= .94;
      gustTarget.velocity[1] *= .94;
      const ambientTarget = (settings.mode === "Still" ? .015 : .06) * settings.windStrength;
      ambient += (ambientTarget - ambient) * .08;

      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(locations.texture, 0);
      gl.uniform1f(locations.time, time);
      gl.uniform1f(locations.canvasAspect, canvas.width / Math.max(1, canvas.height));
      gl.uniform1f(locations.planeAspect, planeAspect);
      gl.uniform1f(locations.ambient, ambient);
      gl.uniform1f(locations.speed, settings.speed);
      gl.uniform2f(locations.gustCenter, gust.center[0], gust.center[1]);
      gl.uniform2f(locations.gustVelocity, gust.velocity[0], gust.velocity[1]);
      gl.uniform1f(locations.gustStrength, gust.strength * settings.windStrength);
      gl.uniform2f(locations.uvScale, uvScale[0], uvScale[1]);
      gl.uniform2f(locations.uvOffset, 0, 0);
      gl.uniform1f(locations.weave, settings.weaveIntensity);
      gl.uniform1f(locations.sheen, settings.sheen);
      gl.uniform1f(locations.brightness, settings.brightness);
      gl.uniform1f(locations.shading, settings.shading);
      gl.drawElements(gl.TRIANGLES, plane.indices.length, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
      frame = visible ? requestAnimationFrame(render) : 0;
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible && !frame) frame = requestAnimationFrame(render);
    }, { rootMargin: "200px" });
    intersectionObserver.observe(canvas);
    frame = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerenter", pointerEnter);
      canvas.removeEventListener("pointerleave", pointerLeave);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      gl.deleteTexture(texture);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, [settings]);

  return (
    <canvas
      className={className}
      data-animation="waving-flag"
      ref={canvasRef}
      aria-hidden="true"
    />
  );
}

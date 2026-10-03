// The antarpat falls: the cover's own silk photo on a cloth mesh, bent in a vertex shader (no physics).
// The middle sags first, as when two relatives lower the cloth together; then gravity takes it, folds gather and
// travel down, light runs along the creases, and the zari catches it. Raw WebGL1, one program, one draw call.
// Returns null when WebGL is missing, so the cover falls back to the plain CSS drop.

const VS = `
attribute vec2 a;
uniform float p; uniform vec2 r; uniform vec4 m;
varying vec2 t; varying vec3 n;
void main(){
  float u=a.x, v=a.y, W=r.x, H=r.y;
  float s=sin(3.14159265*u);
  float hold=.18*(1.-s);
  float k=max(p-hold,0.)/(1.-hold);
  float fall=k*k*1.45*H;
  float e=smoothstep(0.,.32,p);
  float sag=s*.11*H*e*(1.-.55*v);
  float amp=smoothstep(.02,.55,p)*(10.+34.*v);
  float ph=v*17.-p*10.+u*2.4;
  float pl=9.*s*e;
  float ph2=u*26.+p*7.;
  float z=amp*sin(ph)+pl*sin(ph2);
  float g=.07*smoothstep(.1,.95,p)*(1.-.4*v);
  float x=(u-.5)*(1.-g)*W*(1.+z/1300.);
  float y=v*H+fall+sag-amp*.45*(1.-cos(ph));
  n=normalize(vec3(-pl*cos(ph2)*26./W,-amp*cos(ph)*17./H,1.));
  t=a*m.xy+m.zw;
  gl_Position=vec4(x/W*2.,1.-y/H*2.,0.,1.);
}`;

const FS = `
precision mediump float;
uniform sampler2D s; uniform float f;
varying vec2 t; varying vec3 n;
void main(){
  vec4 c=texture2D(s,t);
  vec3 L=normalize(vec3(-.35,-.55,.75));
  float diff=1.+.75*(dot(n,L)-L.z);
  float lum=dot(c.rgb,vec3(.299,.587,.114));
  float gold=smoothstep(.33,.58,lum)*smoothstep(.03,.14,c.r-c.b)*smoothstep(-.06,.06,c.g-c.b*1.05);
  vec3 h=normalize(L+vec3(0.,0.,1.));
  float sp=max(pow(max(dot(n,h),0.),36.)-pow(h.z,36.),0.);
  float on=smoothstep(0.,.12,f);
  vec3 col=c.rgb*diff+on*gold*sp*vec3(1.,.85,.5)*2.2;
  col=mix(col,col*vec3(.72,.55,1.12),clamp((1.-n.z)*3.,0.,.55)*on);
  gl_FragColor=vec4(col,1.);
}`;

export interface Drape { canvas: HTMLCanvasElement; draw(p: number): void; dispose(): void }

/** Builds the mesh over `box`, drawing `img` exactly as object-fit: cover draws it, so the swap is invisible. */
export function makeDrape(img: HTMLImageElement, box: HTMLElement): Drape | null {
  const canvas = document.createElement('canvas');
  canvas.id = 'drape';
  canvas.setAttribute('aria-hidden', 'true');
  const W = box.clientWidth, H = box.clientHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  let gl: WebGLRenderingContext | null = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch { gl = null; }
  if (!gl || !img.naturalWidth) return null;
  const g = gl;
  try {
    const shader = (type: number, src: string) => {
      const o = g.createShader(type)!;
      g.shaderSource(o, src);
      g.compileShader(o);
      if (!g.getShaderParameter(o, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(o) || 'shader');
      return o;
    };
    const pr = g.createProgram()!;
    g.attachShader(pr, shader(g.VERTEX_SHADER, VS));
    g.attachShader(pr, shader(g.FRAGMENT_SHADER, FS));
    g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) throw new Error('link');
    g.useProgram(pr);

    /* a 40 × 72 grid as one triangle strip, rows joined by degenerate triangles */
    const NX = 40, NY = 72, pts: number[] = [], idx: number[] = [];
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) pts.push(i / NX, j / NY);
    for (let j = 0; j < NY; j++) {
      if (j) idx.push(j * (NX + 1));
      for (let i = 0; i <= NX; i++) idx.push(j * (NX + 1) + i, (j + 1) * (NX + 1) + i);
      if (j < NY - 1) idx.push((j + 1) * (NX + 1) + NX);
    }
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(pts), g.STATIC_DRAW);
    g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, 'a');
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);

    g.bindTexture(g.TEXTURE_2D, g.createTexture());
    for (const [k, v] of [[g.TEXTURE_MIN_FILTER, g.LINEAR], [g.TEXTURE_MAG_FILTER, g.LINEAR], [g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE], [g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE]]) g.texParameteri(g.TEXTURE_2D, k, v);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img);

    /* object-fit: cover, centred */
    const iw = img.naturalWidth, ih = img.naturalHeight, sc = Math.max(W / iw, H / ih);
    const sx = W / (iw * sc), sy = H / (ih * sc);
    const U = (k: string) => g.getUniformLocation(pr, k);
    g.uniform2f(U('r'), W, H);
    g.uniform4f(U('m'), sx, sy, (1 - sx) / 2, (1 - sy) / 2);
    g.uniform1i(U('s'), 0);
    g.viewport(0, 0, canvas.width, canvas.height);
    g.clearColor(0, 0, 0, 0);
    const uP = U('p'), uF = U('f');
    return {
      canvas,
      draw(p: number) {
        g.clear(g.COLOR_BUFFER_BIT);
        g.uniform1f(uP, p);
        g.uniform1f(uF, p);
        g.drawElements(g.TRIANGLE_STRIP, idx.length, g.UNSIGNED_SHORT, 0);
      },
      dispose() {
        g.getExtension('WEBGL_lose_context')?.loseContext();
        canvas.remove();
      }
    };
  } catch {
    g.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
}

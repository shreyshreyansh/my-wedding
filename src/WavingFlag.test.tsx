import { StrictMode } from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFlagPlane, WavingFlag } from "./WavingFlag";

type ImageHandler = ((this: GlobalEventHandlers, event: Event) => unknown) | null;

class ControlledImage {
  static instances: ControlledImage[] = [];

  naturalHeight = 200;
  naturalWidth = 300;
  loadHandlers: Exclude<ImageHandler, null>[] = [];
  private loadHandler: ImageHandler = null;
  onerror: ImageHandler = null;
  src = "";

  constructor() {
    ControlledImage.instances.push(this);
  }

  get onload() {
    return this.loadHandler;
  }

  set onload(handler: ImageHandler) {
    this.loadHandler = handler;
    if (handler) this.loadHandlers.push(handler);
  }

  load() {
    this.loadHandler?.call(this as unknown as GlobalEventHandlers, new Event("load"));
  }

  fail() {
    this.onerror?.call(this as unknown as GlobalEventHandlers, new Event("error"));
  }
}

function createWebGlHarness() {
  ControlledImage.instances = [];
  let objectId = 0;
  const object = () => ({ id: objectId += 1 });
  const gl = {
    ARRAY_BUFFER: 0x8892,
    CLAMP_TO_EDGE: 0x812f,
    COLOR_BUFFER_BIT: 0x4000,
    COMPILE_STATUS: 0x8b81,
    DEPTH_BUFFER_BIT: 0x0100,
    DEPTH_TEST: 0x0b71,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    FLOAT: 0x1406,
    FRAGMENT_SHADER: 0x8b30,
    LINEAR: 0x2601,
    LINK_STATUS: 0x8b82,
    RGBA: 0x1908,
    STATIC_DRAW: 0x88e4,
    TEXTURE0: 0x84c0,
    TEXTURE_2D: 0x0de1,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    TRIANGLES: 0x0004,
    UNPACK_FLIP_Y_WEBGL: 0x9240,
    UNSIGNED_BYTE: 0x1401,
    UNSIGNED_INT: 0x1405,
    VERTEX_SHADER: 0x8b31,
    activeTexture: vi.fn(),
    attachShader: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bindVertexArray: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn(),
    compileShader: vi.fn(),
    createBuffer: vi.fn(object),
    createProgram: vi.fn(object),
    createShader: vi.fn(object),
    createTexture: vi.fn(object),
    createVertexArray: vi.fn(object),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    deleteTexture: vi.fn(),
    deleteVertexArray: vi.fn(),
    drawElements: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getProgramInfoLog: vi.fn(() => ""),
    getProgramParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ""),
    getShaderParameter: vi.fn(() => true),
    getUniformLocation: vi.fn(object),
    linkProgram: vi.fn(),
    pixelStorei: vi.fn(),
    shaderSource: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
    viewport: vi.fn()
  };

  let frameId = 0;
  const frames = new Map<number, FrameRequestCallback>();
  vi.stubGlobal("Image", ControlledImage);
  vi.stubGlobal("ResizeObserver", class {
    disconnect = vi.fn();
    observe = vi.fn();
  });
  vi.stubGlobal("IntersectionObserver", class {
    disconnect = vi.fn();
    observe = vi.fn();
  });
  vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
    frameId += 1;
    frames.set(frameId, callback);
    return frameId;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));

  vi.spyOn(HTMLCanvasElement.prototype, "clientWidth", "get").mockReturnValue(120);
  vi.spyOn(HTMLCanvasElement.prototype, "clientHeight", "get").mockReturnValue(80);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 80,
    height: 80,
    left: 0,
    right: 120,
    top: 0,
    width: 120,
    x: 0,
    y: 0,
    toJSON: () => ({})
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((contextId) => (
    contextId === "webgl2" ? gl as unknown as WebGL2RenderingContext : null
  ) as never);

  const runReadyFrames = () => {
    for (let pass = 0; pass < 2; pass += 1) {
      const pending = [...frames.entries()]
        .filter(([id]) => id > 1)
        .sort(([left], [right]) => left - right);
      for (const [id, callback] of pending) {
        frames.delete(id);
        callback(performance.now());
      }
    }
  };

  return { gl, runReadyFrames };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("WavingFlag", () => {
  it("creates the same segmented mesh topology as the reference shader", () => {
    const plane = createFlagPlane(2, 1);
    expect(Array.from(plane.vertices)).toEqual([0, 0, .5, 0, 1, 0, 0, 1, .5, 1, 1, 1]);
    expect(Array.from(plane.indices)).toEqual([0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5]);
  });

  it("renders the static fallback until the WebGL texture is ready", () => {
    createWebGlHarness();
    const { container } = render(<WavingFlag className="hero__waving-flag" />);
    const canvas = container.querySelector('canvas[data-animation="waving-flag"]');

    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute("data-texture-ready", "false");
    expect(ControlledImage.instances).toHaveLength(1);
  });

  it("hands off to WebGL only after the flag texture upload is painted", () => {
    const { gl, runReadyFrames } = createWebGlHarness();
    const { container } = render(<WavingFlag className="hero__waving-flag" />);
    const canvas = container.querySelector<HTMLCanvasElement>(".hero__waving-flag")!;

    ControlledImage.instances[0].load();
    expect(canvas.dataset.textureReady).toBe("false");
    expect(gl.texImage2D).toHaveBeenCalledTimes(2);

    runReadyFrames();
    expect(canvas.dataset.textureReady).toBe("true");
  });

  it("keeps the static fallback when the WebGL texture fails to load", () => {
    const { gl } = createWebGlHarness();
    const { container } = render(<WavingFlag className="hero__waving-flag" />);
    const canvas = container.querySelector<HTMLCanvasElement>(".hero__waving-flag")!;

    ControlledImage.instances[0].fail();

    expect(canvas.dataset.textureReady).toBe("false");
    expect(gl.texImage2D).toHaveBeenCalledTimes(1);
  });

  it("ignores a queued texture load after StrictMode disposes its WebGL resources", () => {
    const { gl } = createWebGlHarness();
    const { unmount } = render(
      <StrictMode>
        <WavingFlag className="hero__waving-flag" />
      </StrictMode>
    );
    const staleLoad = ControlledImage.instances[0].loadHandlers[0];
    const callsBeforeStaleLoad = gl.texImage2D.mock.calls.length;

    expect(ControlledImage.instances).toHaveLength(2);
    expect(ControlledImage.instances[0].onload).toBeNull();
    staleLoad.call(ControlledImage.instances[0] as unknown as GlobalEventHandlers, new Event("load"));

    expect(gl.texImage2D).toHaveBeenCalledTimes(callsBeforeStaleLoad);
    expect(gl.deleteTexture).toHaveBeenCalledTimes(1);

    unmount();
    expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
  });
});

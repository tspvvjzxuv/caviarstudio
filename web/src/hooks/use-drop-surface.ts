import { useEffect, type RefObject } from "react";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const COARSE = "(hover: none), (pointer: coarse)";

function pausedHost(host: HTMLElement) {
  return Boolean(host.closest(".service-sec.is-paused"));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const VERT = `attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `precision mediump float;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHover;
uniform float uTime;
uniform vec4 uRipple0;
uniform vec4 uRipple1;
uniform vec4 uRipple2;
uniform vec4 uRipple3;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float n = 0.0;
  n += 0.5 * vnoise(p);
  n += 0.25 * vnoise(p * 2.03);
  n += 0.125 * vnoise(p * 4.07);
  return n;
}
float ripple(vec2 uv, vec4 r) {
  if (r.z <= 0.001) return 0.0;
  float d = length(uv - r.xy);
  float wave = sin(d * 42.0 - r.z * 11.0);
  return wave * exp(-d * 3.4) * exp(-r.z * 1.15) * r.w;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv * 2.0 - 1.0) * vec2(uRes.x / uRes.y, 1.0);
  vec2 m = uMouse * vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  float t = uTime;
  float n = fbm(p * 1.9 + vec2(t * 0.11, -t * 0.08));
  float h = (n - 0.5) * 0.16;
  h += ripple(p, uRipple0) + ripple(p, uRipple1) + ripple(p, uRipple2) + ripple(p, uRipple3);
  float md = length(p - m);
  h += uHover * 0.2 * exp(-md * 2.8);

  float e = 1.4 / max(uRes.y, 1.0);
  float hx = (n - fbm((p + vec2(e, 0.0)) * 1.9 + vec2(t * 0.11, -t * 0.08))) * 0.16;
  float hy = (n - fbm((p + vec2(0.0, e)) * 1.9 + vec2(t * 0.11, -t * 0.08))) * 0.16;
  vec3 N = normalize(vec3(hx * 6.0, hy * 6.0, 1.0));

  vec2 ru = uv + vec2(hx, hy) * 0.22;
  vec3 base = vec3(0.055, 0.055, 0.07);
  vec3 azure = vec3(0.24, 0.54, 1.0);
  vec3 lemon = vec3(1.0, 0.89, 0.3);
  float top = smoothstep(0.78, 0.08, ru.y);
  float corner = smoothstep(1.15, 0.12, length((ru - vec2(0.08, 0.12)) * vec2(1.1, 1.3)));
  float warm = smoothstep(1.2, 0.18, length((ru - vec2(0.92, 0.88)) * vec2(1.0, 1.2)));
  vec3 col = base;
  col = mix(col, azure * 0.38, corner * 0.85);
  col = mix(col, lemon * 0.22, warm * 0.7);
  col += vec3(0.16, 0.18, 0.2) * top * 0.35;

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(-0.45 + uMouse.x * 0.35, 0.62 - uMouse.y * 0.2, 0.7));
  vec3 L2 = normalize(vec3(0.55, -0.2, 0.55));
  vec3 H1 = normalize(L1 + V);
  float spec = pow(max(dot(N, H1), 0.0), 42.0) * (0.28 + 0.55 * uHover);
  float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 18.0) * 0.12;
  col += vec3(0.92, 0.94, 0.98) * spec;
  col += azure * spec2;

  float lines = abs(fract(n * 6.4 + t * 0.04) - 0.5);
  col += vec3(0.82, 0.86, 0.92) * smoothstep(0.07, 0.02, lines) * 0.1;

  float rim = pow(1.0 - max(N.z, 0.0), 2.4);
  col += mix(azure, lemon, uv.x) * rim * 0.16;

  gl_FragColor = vec4(col, 0.92);
}`;

type Ripple = { x: number; y: number; age: number; amp: number };

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function startWebgl(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const loc = {
    res: gl.getUniformLocation(prog, "uRes"),
    mouse: gl.getUniformLocation(prog, "uMouse"),
    hover: gl.getUniformLocation(prog, "uHover"),
    time: gl.getUniformLocation(prog, "uTime"),
    r0: gl.getUniformLocation(prog, "uRipple0"),
    r1: gl.getUniformLocation(prog, "uRipple1"),
    r2: gl.getUniformLocation(prog, "uRipple2"),
    r3: gl.getUniformLocation(prog, "uRipple3"),
  };
  return { gl, prog, buf, loc };
}

export function useDropSurface(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest(".service-chrome") as HTMLElement | null;
    if (!canvas || !host) return;

    const fine = window.matchMedia(FINE);
    const reduce = window.matchMedia(REDUCE);
    const coarse = window.matchMedia(COARSE);
    const gpu = reduce.matches ? null : startWebgl(canvas);
    const ctx2 = gpu ? null : canvas.getContext("2d", { alpha: true });

    const mouse = { x: 0, y: 0, tx: 0, ty: 0, hover: 0, thover: 0 };
    const ripples: Ripple[] = [
      { x: 0, y: 0, age: 99, amp: 0 },
      { x: 0, y: 0, age: 99, amp: 0 },
      { x: 0, y: 0, age: 99, amp: 0 },
      { x: 0, y: 0, age: 99, amp: 0 },
    ];
    let nextRipple = 0;
    let lastSpawn = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let cssW = 1;
    let cssH = 1;
    let pxW = 1;
    let pxH = 1;

    const size = () => {
      const box = host.getBoundingClientRect();
      cssW = Math.max(1, Math.round(box.width));
      cssH = Math.max(1, Math.round(box.height));
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      pxW = Math.max(1, Math.round(cssW * dpr));
      pxH = Math.max(1, Math.round(cssH * dpr));
      canvas.width = pxW;
      canvas.height = pxH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      if (gpu) gpu.gl.viewport(0, 0, pxW, pxH);
    };

    const local = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      return {
        nx: ((event.clientX - box.left) / Math.max(1, box.width)) * 2 - 1,
        ny: 1 - ((event.clientY - box.top) / Math.max(1, box.height)) * 2,
      };
    };

    const spawn = (nx: number, ny: number, amp: number) => {
      if (reduce.matches || pausedHost(host)) return;
      const slot = ripples[nextRipple++ % 4];
      slot.x = nx * (cssW / Math.max(cssH, 1));
      slot.y = ny;
      slot.age = 0;
      slot.amp = amp;
    };

    const draw2d = (hover: number) => {
      if (!ctx2) return;
      ctx2.setTransform(pxW / cssW, 0, 0, pxH / cssH, 0, 0);
      ctx2.clearRect(0, 0, cssW, cssH);
      const x = (mouse.x * 0.5 + 0.5) * cssW;
      const y = (1 - (mouse.y * 0.5 + 0.5)) * cssH;
      const g = ctx2.createRadialGradient(x - 18, y - 22, 4, x, y, Math.max(cssW, cssH) * 0.55);
      g.addColorStop(0, `rgba(244,245,247,${0.28 * hover})`);
      g.addColorStop(0.18, `rgba(61,138,255,${0.12 * hover})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx2.globalCompositeOperation = "screen";
      ctx2.fillStyle = g;
      ctx2.fillRect(0, 0, cssW, cssH);
      for (const r of ripples) {
        if (r.age > 2.4 || r.amp <= 0) continue;
        const life = Math.exp(-r.age * 1.15);
        const cx = (r.x / (cssW / Math.max(cssH, 1)) * 0.5 + 0.5) * cssW;
        const cy = (1 - (r.y * 0.5 + 0.5)) * cssH;
        ctx2.beginPath();
        ctx2.arc(cx, cy, 12 + r.age * 70, 0, Math.PI * 2);
        ctx2.strokeStyle = `rgba(232,234,238,${0.32 * life * r.amp})`;
        ctx2.lineWidth = 1.2;
        ctx2.stroke();
      }
      ctx2.globalCompositeOperation = "source-over";
    };

    const drawGpu = (time: number, hover: number) => {
      if (!gpu) return;
      const { gl, prog, buf, loc } = gpu;
      gl.viewport(0, 0, pxW, pxH);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(loc.res, pxW, pxH);
      gl.uniform2f(loc.mouse, mouse.x * (cssW / Math.max(cssH, 1)), mouse.y);
      gl.uniform1f(loc.hover, hover);
      gl.uniform1f(loc.time, time);
      const pack = (r: Ripple) => [r.x, r.y, r.age, r.amp] as const;
      gl.uniform4f(loc.r0, ...pack(ripples[0]));
      gl.uniform4f(loc.r1, ...pack(ripples[1]));
      gl.uniform4f(loc.r2, ...pack(ripples[2]));
      gl.uniform4f(loc.r3, ...pack(ripples[3]));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      running = true;
      const dt = Math.min((now - last) / 1000, 0.2);
      last = now;
      if (pausedHost(host) || reduce.matches) {
        running = false;
        return;
      }
      const k = 1 - Math.exp(-4.2 * dt);
      mouse.x = mix(mouse.x, mouse.tx, k);
      mouse.y = mix(mouse.y, mouse.ty, k);
      mouse.hover = mix(mouse.hover, mouse.thover, k);
      host.style.setProperty("--drop-x", mouse.x.toFixed(3));
      host.style.setProperty("--drop-y", (-mouse.y).toFixed(3));
      for (const r of ripples) r.age += dt;
      const time = now * 0.001;
      if (gpu) drawGpu(time, mouse.hover);
      else draw2d(mouse.hover);

      const live =
        mouse.thover > 0.01 ||
        mouse.hover > 0.01 ||
        Math.abs(mouse.x) + Math.abs(mouse.y) > 0.01 ||
        ripples.some((r) => r.age < 2.6 && r.amp > 0) ||
        Boolean(gpu && !coarse.matches);
      if (live) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const kick = () => {
      if (running || reduce.matches) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduce.matches) return;
      const p = local(event);
      mouse.tx = Math.max(-1, Math.min(1, p.nx));
      mouse.ty = Math.max(-1, Math.min(1, p.ny));
      mouse.thover = 1;
      const now = performance.now();
      if (now - lastSpawn > 70) {
        lastSpawn = now;
        spawn(mouse.tx, mouse.ty, 0.85);
      }
      kick();
    };

    const onDown = (event: PointerEvent) => {
      if (reduce.matches) return;
      const p = local(event);
      mouse.tx = Math.max(-1, Math.min(1, p.nx));
      mouse.ty = Math.max(-1, Math.min(1, p.ny));
      mouse.thover = 1;
      spawn(mouse.tx, mouse.ty, 1);
      kick();
    };

    const onLeave = () => {
      mouse.thover = 0;
      mouse.tx = 0;
      mouse.ty = 0;
      kick();
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const sec = host.closest(".service-sec");
    const mo = new MutationObserver(() => {
      if (!pausedHost(host)) kick();
    });
    if (sec) mo.observe(sec, { attributes: true, attributeFilter: ["class"] });
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);
    if (gpu && !coarse.matches && !reduce.matches) kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      host.style.removeProperty("--drop-x");
      host.style.removeProperty("--drop-y");
      if (gpu) {
        gpu.gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, [canvasRef]);
}

import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";

const MAX_CARDS = 5;

const VERT = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

// Liquid-metal stripe / refraction model adapted from
// eamonliu/liquid-metal-playground (MIT). No SDF morph, melt, or drip —
// the field is masked to the existing rounded card rects.
const FRAG = `
precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uSweep;
uniform float uRadius;
uniform vec4 uRect[5];
uniform vec2 uCenter[5];
uniform float uOpen[5];

#define PI 3.141592653589793

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x * 34.) + 1.) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float getChannel(float c1, float c2, float stripe, vec3 w, float blur, float bulge) {
  float ch = mix(c2, c1, smoothstep(0.0, blur, stripe));
  float border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe));
  float b = smoothstep(0.2, 0.8, bulge);
  border = w[0] + 0.4 * (1.0 - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe));
  border = w[0] + 0.5 * (1.0 - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe));
  float gradientT = (stripe - w[0] - w[1]) / max(w[2], 0.001);
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradientT));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe));
  return ch;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float sdf = 1.0e6;
  float live = 0.0;
  float hover = 0.0;

  for (int i = 0; i < 5; i++) {
    vec4 rc = uRect[i];
    float on = (1.0 - uOpen[i]) * step(2.0, rc.z);
    vec2 halfSize = rc.zw * 0.5;
    vec2 center = rc.xy + halfSize;
    float d = mix(1.0e6, sdRoundBox(frag - center, halfSize, uRadius), on);
    sdf = min(sdf, d);
    live = max(live, on);
    vec2 m = uMouse - rc.xy;
    float insidePointer = step(0.0, m.x) * step(0.0, m.y) * step(m.x, rc.z) * step(m.y, rc.w);
    hover = max(hover, insidePointer * on);
  }

  if (live < 0.5 || sdf > 3.0) discard;

  float inside = 1.0 - smoothstep(0.0, 1.4, sdf);
  float rim = 1.0 - smoothstep(0.0, 2.6, abs(sdf));
  float cover = max(inside * 0.82, rim);
  if (cover < 0.012) discard;

  float sigma = max(72.0, length(uRect[0].zw) * 0.48);
  float path = fract(uSweep) * 5.0;
  float slot = floor(path);
  float ft = smoothstep(0.0, 1.0, fract(path));
  vec2 a = uCenter[0];
  vec2 b = uCenter[1];
  if (slot < 0.5) { a = uCenter[0]; b = uCenter[1]; }
  else if (slot < 1.5) { a = uCenter[1]; b = uCenter[2]; }
  else if (slot < 2.5) { a = uCenter[2]; b = uCenter[3]; }
  else if (slot < 3.5) { a = uCenter[3]; b = uCenter[4]; }
  else { a = uCenter[4]; b = uCenter[0]; }
  vec2 sweepPt = mix(a, b, ft);
  float band = exp(-dot(frag - sweepPt, frag - sweepPt) / (2.0 * sigma * sigma));
  float mouseBand = exp(-dot(frag - uMouse, frag - uMouse) / (2.0 * 90.0 * 90.0));
  band = max(band, mouseBand * hover * 0.9);
  band = clamp(band * (0.82 + 0.18 * hover), 0.0, 1.0);

  vec2 uv = frag / max(uRes, vec2(1.0));
  float ratio = uRes.x / max(uRes.y, 1.0);
  uv.x *= ratio;
  vec2 center = vec2(0.5 * ratio, 0.5);
  uv = rotate(uv - center, 0.42) + center;

  float diagonal = uv.x - uv.y;
  float t = uTime * 0.14;
  vec3 color1 = vec3(0.08, 0.09, 0.11);
  vec3 color2 = vec3(0.97, 0.98, 1.0);

  vec2 gradUv = uv - 0.5;
  float dist = length(gradUv + vec2(0.0, 0.2 * diagonal));
  gradUv = rotate(gradUv, (0.25 - 0.2 * diagonal) * PI);
  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1.0 - bulge;
  bulge *= pow(clamp(uv.y, 0.0, 1.0), 0.3);

  float cycle = 2.05;
  float thin1 = 0.12 / cycle * (1.0 - 0.4 * bulge);
  float thin2 = 0.07 / cycle * (1.0 + 0.4 * bulge);
  float wide = 1.0 - thin1 - thin2;
  vec3 w = vec3(cycle * thin1, cycle * thin2, wide);

  float edge = smoothstep(-28.0, 6.0, sdf);
  float noise = snoise(uv - t);
  edge += (1.0 - edge) * 0.22 * noise;

  float dir = gradUv.x + diagonal;
  dir -= 2.0 * noise * diagonal * (smoothstep(0.0, 1.0, edge) * smoothstep(1.0, 0.0, edge));
  bulge *= clamp(pow(clamp(uv.y, 0.0, 1.0), 0.1), 0.3, 1.0);
  dir *= (0.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1.0, 0.7, edge);
  dir *= cycle;
  dir -= t;
  dir += 0.018 * (uMouse.x / max(uRes.x, 1.0) - 0.5) * hover;

  float refr = clamp(1.0 - bulge, 0.0, 1.0) * 0.32;
  float stripeR = mod(dir + refr, 1.0);
  float stripeG = mod(dir, 1.0);
  float stripeB = mod(dir - 1.25 * refr, 1.0);
  float blur = 0.24;
  vec3 metal = vec3(
    getChannel(color1.r, color2.r, stripeR, w, blur + 0.02, bulge),
    getChannel(color1.g, color2.g, stripeG, w, blur, bulge),
    getChannel(color1.b, color2.b, stripeB, w, blur, bulge)
  );

  float centerFade = mix(0.52, 1.0, rim);
  float rest = 0.07;
  float alpha = cover * centerFade * (rest + (1.0 - rest) * band);
  vec3 pearl = vec3(0.956, 0.961, 0.969);
  vec3 col = mix(metal, pearl, 0.22 + rim * 0.4);
  gl_FragColor = vec4(col, alpha);
}
`;

function saveDataOn() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

function fallback(sec: HTMLElement | null) {
  sec?.classList.add("is-metal-fallback");
}

export function mountServiceMetal(canvas: HTMLCanvasElement): () => void {
  const sec = canvas.closest(".service-sec") as HTMLElement | null;
  if (saveDataOn() || !sec) {
    fallback(sec);
    return () => {};
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    fallback(sec);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.4));

  const rects = Array.from({ length: MAX_CARDS }, () => new Vector4(-4000, -4000, 0, 0));
  const centers = Array.from({ length: MAX_CARDS }, () => new Vector2(-4000, -4000));
  const open = [0, 0, 0, 0, 0];

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uMouse: { value: new Vector2(-4000, -4000) },
      uSweep: { value: 0 },
      uRadius: { value: 24 },
      uRect: { value: rects },
      uCenter: { value: centers },
      uOpen: { value: open },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
  scene.add(new Mesh(geometry, material));

  const startedAt = performance.now();
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  let raf = 0;
  let running = false;
  let skip = 0;
  const mouseCss = new Vector2(-4000, -4000);

  const resize = () => {
    const w = Math.max(1, sec.clientWidth);
    const h = Math.max(1, sec.clientHeight);
    renderer.setSize(w, h, false);
    material.uniforms.uRes.value.set(w, h);
    const sample = sec.querySelector("button.service-chrome");
    const cssRadius = sample ? Number.parseFloat(getComputedStyle(sample).borderRadius) || 24 : 24;
    material.uniforms.uRadius.value = cssRadius * renderer.getPixelRatio();
    syncCards();
  };

  const syncCards = () => {
    const root = sec.getBoundingClientRect();
    const dpr = renderer.getPixelRatio();
    const buttons = sec.querySelectorAll<HTMLButtonElement>("button.service-chrome");
    const cssH = Math.max(1, sec.clientHeight);
    for (let i = 0; i < MAX_CARDS; i++) {
      const btn = buttons[i];
      if (!btn) {
        rects[i].set(-4000, -4000, 0, 0);
        centers[i].set(-4000, -4000);
        open[i] = 1;
        continue;
      }
      const box = btn.getBoundingClientRect();
      const x = box.left - root.left;
      const yCss = box.top - root.top;
      const y = cssH - yCss - box.height;
      rects[i].set(x * dpr, y * dpr, box.width * dpr, box.height * dpr);
      centers[i].set((x + box.width * 0.5) * dpr, (y + box.height * 0.5) * dpr);
      open[i] = btn.getAttribute("aria-expanded") === "true" || btn.classList.contains("is-open") ? 1 : 0;
    }
  };

  const stop = () => {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const tick = () => {
    if (!running) return;
    if (mobile) {
      skip = 1 - skip;
      if (skip === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
    }
    const t = (performance.now() - startedAt) / 1000;
    material.uniforms.uTime.value = t;
    material.uniforms.uSweep.value = t * 0.085;
    const dpr = renderer.getPixelRatio();
    const h = Math.max(1, sec.clientHeight);
    material.uniforms.uMouse.value.set(mouseCss.x * dpr, (h - mouseCss.y) * dpr);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };

  const onVis = () => {
    if (document.hidden || sec.classList.contains("is-paused")) stop();
    else start();
  };

  const onPointer = (event: PointerEvent) => {
    if (!fine.matches) {
      mouseCss.set(-4000, -4000);
      return;
    }
    const root = sec.getBoundingClientRect();
    mouseCss.set(event.clientX - root.left, event.clientY - root.top);
  };

  const onPointerLeave = () => mouseCss.set(-4000, -4000);

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden && !sec.classList.contains("is-paused")) start();
    else stop();
  });

  const ro = new ResizeObserver(() => resize());
  const mo = new MutationObserver(() => {
    syncCards();
    onVis();
  });

  let shaderOk = true;
  renderer.debug.onShaderError = () => {
    shaderOk = false;
  };
  resize();
  renderer.compile(scene, camera);
  if (!shaderOk) {
    fallback(sec);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    return () => {};
  }
  io.observe(sec);
  ro.observe(sec);
  mo.observe(sec, { attributes: true, attributeFilter: ["class", "aria-expanded"], subtree: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  sec.addEventListener("pointermove", onPointer, { passive: true });
  sec.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVis);
    sec.removeEventListener("pointermove", onPointer);
    sec.removeEventListener("pointerleave", onPointerLeave);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

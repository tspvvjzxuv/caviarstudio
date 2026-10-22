/**
 * Liquid-metal fragment shader, default params, and Poisson edge-mask
 * from eamonliu/liquid-metal-playground (MIT, per the project README).
 * Shape morphing between logos is omitted so Caviar cards keep their
 * exact rounded-rect outline — the metal is the fill, not a drip.
 */

export const PLAYGROUND_PARAMS = {
  refraction: 0.022,
  edge: 0.22,
  patternBlur: 0.016,
  liquid: 0.08,
  speed: 0.035,
  patternScale: 1.05,
  angleDeg: 35,
} as const;

/** Forward, hold, back, then a long angle ease. Seconds. ~39s round. */
export const METAL_CYCLE = {
  legSec: 14,
  pauseSec: 2.5,
  angleSec: 8.5,
  travel: 0.7,
} as const;

export function metalCycleRoundSec() {
  return METAL_CYCLE.legSec * 2 + METAL_CYCLE.pauseSec + METAL_CYCLE.angleSec;
}

function fract(n: number) {
  return n - Math.floor(n);
}

function hash11(n: number) {
  return fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
}

function smootherstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function angleForCycle(i: number) {
  const mag = ((20 + hash11(i + 0.17) * 40) * Math.PI) / 180;
  return hash11(i + 0.91) > 0.5 ? -mag : mag;
}

export function focusForCycle(i: number): [number, number] {
  const hx = hash11(i + 3.17);
  const hy = hash11(i + 8.41);
  const x = hx < 0.5 ? 0.14 + hx * 0.44 : 0.62 + (hx - 0.5) * 0.48;
  const y = hy < 0.5 ? 0.16 + hy * 0.48 : 0.58 + (hy - 0.5) * 0.52;
  return [x, y];
}

function awayFromCenter(x: number, y: number, minR = 0.2): [number, number] {
  const dx = x - 0.5;
  const dy = y - 0.5;
  const d = Math.hypot(dx, dy);
  if (d >= minR) return [x, y];
  const s = minR / Math.max(d, 1e-4);
  return [0.5 + dx * s, 0.5 + dy * s];
}

function focusAlong(f0: [number, number], f1: [number, number], t: number): [number, number] {
  const mx = (f0[0] + f1[0]) * 0.5;
  const my = (f0[1] + f1[1]) * 0.5;
  const dx = f1[0] - f0[0];
  const dy = f1[1] - f0[1];
  let px = -dy;
  let py = dx;
  const plen = Math.hypot(px, py) || 1;
  px /= plen;
  py /= plen;
  const c1 = awayFromCenter(mx + px * 0.24, my + py * 0.24, 0.22);
  const c2 = awayFromCenter(mx - px * 0.24, my - py * 0.24, 0.22);
  const ctrl =
    Math.hypot(c1[0] - 0.5, c1[1] - 0.5) >= Math.hypot(c2[0] - 0.5, c2[1] - 0.5) ? c1 : c2;
  const u = 1 - t;
  return awayFromCenter(
    u * u * f0[0] + 2 * u * t * ctrl[0] + t * t * f1[0],
    u * u * f0[1] + 2 * u * t * ctrl[1] + t * t * f1[1],
    0.18,
  );
}

export function metalCycleAt(timeSec: number) {
  const { legSec, pauseSec, angleSec, travel } = METAL_CYCLE;
  const round = metalCycleRoundSec();
  const t = Math.max(0, timeSec);
  const i = Math.floor(t / round);
  const local = t - i * round;
  const a0 = angleForCycle(i);
  const a1 = angleForCycle(i + 1);
  const focusSpan = round * 2;
  const fs = t / focusSpan;
  const fi = Math.floor(fs);
  const [focusX, focusY] = focusAlong(focusForCycle(fi), focusForCycle(fi + 1), smootherstep(fs - fi));

  let flow = 0;
  let angle = a0;
  if (local < legSec) {
    flow = smootherstep(local / legSec) * travel;
  } else if (local < legSec + pauseSec) {
    flow = travel;
  } else if (local < legSec * 2 + pauseSec) {
    flow = (1 - smootherstep((local - legSec - pauseSec) / legSec)) * travel;
  } else {
    angle = a0 + (a1 - a0) * smootherstep((local - legSec * 2 - pauseSec) / Math.max(angleSec, 0.001));
  }

  return { flow, angle, focusX, focusY, cycle: i, local, round };
}

const POISSON_C = 0.01;
const POISSON_ITERATIONS = 300;
const ALPHA = 2.0;

export function generateRoundedRectPoissonMask(
  width: number,
  height: number,
  radius: number,
): { width: number; height: number; data: Uint8Array } {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { width, height, data: new Uint8Array(width * height * 4) };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  const r = Math.max(1, Math.min(radius, width / 2, height / 2));
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  const pixels = ctx.getImageData(0, 0, width, height).data;
  const len = width * height;
  let u = new Float32Array(len);
  const isInside = new Uint8Array(len);
  const isBoundary = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    const r8 = pixels[i * 4];
    const g8 = pixels[i * 4 + 1];
    const b8 = pixels[i * 4 + 2];
    if (r8 < 250 || g8 < 250 || b8 < 250) isInside[i] = 1;
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (
        isInside[idx] &&
        (!isInside[idx - 1] || !isInside[idx + 1] || !isInside[idx - width] || !isInside[idx + width])
      ) {
        isBoundary[idx] = 1;
      }
    }
  }

  let nextU = new Float32Array(len);
  for (let iter = 0; iter < POISSON_ITERATIONS; iter++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (isInside[idx] && !isBoundary[idx]) {
          nextU[idx] = (POISSON_C + u[idx + 1] + u[idx - 1] + u[idx + width] + u[idx - width]) / 4;
        } else {
          nextU[idx] = 0;
        }
      }
    }
    const temp = u;
    u = nextU;
    nextU = temp;
  }

  let maxU = 0;
  for (let i = 0; i < len; i++) if (u[i] > maxU) maxU = u[i];

  const outData = new Uint8Array(len * 4);
  for (let i = 0; i < len; i++) {
    let gray = 255;
    if (isInside[i]) {
      const val = maxU > 0 ? u[i] / maxU : 0;
      gray = 255 * (1.0 - Math.pow(val, ALPHA));
    }
    outData[i * 4] = gray;
    outData[i * 4 + 1] = gray;
    outData[i * 4 + 2] = gray;
    outData[i * 4 + 3] = 255;
  }
  return { width, height, data: outData };
}

export const playgroundVertex = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

export const playgroundFragment = `
precision highp float;

uniform sampler2D u_mask;
uniform sampler2D u_mask_next;
uniform float u_transition;
uniform float u_time;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;
uniform float u_speed;
uniform float u_patternScale;
uniform vec2 u_resolution;
uniform float u_angle;
uniform vec2 u_mouse;
uniform float uMouseAmt;
uniform vec4 uRect[5];
uniform float uOpen[5];
uniform float uRadius;
uniform vec4 uField;
uniform vec2 uFocus;
uniform float u_flow;
uniform float uTileH;
uniform sampler2D u_ink;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m;
  m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;

  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));

  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

  b = smoothstep(.2, .8, b);
  border = w[0] + .4 * (1. - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

  border = w[0] + .5 * (1. - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));

  return ch;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float sdf = 1.0e6;
  float found = 0.0;
  float tileH = uTileH;
  vec4 tileBox = uRect[0];

  for (int i = 0; i < 5; i++) {
    vec4 box = uRect[i];
    float on = (1.0 - uOpen[i]) * step(1.0, box.z) * step(1.0, box.w);
    vec2 halfSize = box.zw * 0.5 + vec2(2.0);
    float r = uRadius + 2.0;
    float d = sdRoundBox(frag - (box.xy + box.zw * 0.5), halfSize, r);
    float take = on * step(d, sdf);
    sdf = mix(sdf, d, take);
    tileH = mix(tileH, box.w, take);
    tileBox = mix(tileBox, box, take);
    found = max(found, on * step(d, 2.0));
  }

  if (found < 0.5) discard;

  vec2 fieldUv = vec2(
    (frag.x - uField.x) / max(uField.z, 1.0),
    1.0 - (frag.y - uField.y) / max(uField.w, 1.0)
  );
  vec2 mouse_uv = vec2(
    (u_mouse.x - uField.x) / max(uField.z, 1.0),
    1.0 - (u_mouse.y - uField.y) / max(uField.w, 1.0)
  );

  vec2 aspect = vec2(uField.z / max(uField.w, 1.0), 1.0);
  vec2 iso = (fieldUv - uFocus) * aspect;
  iso *= max(uField.w, 1.0) / max(tileH, 1.0) * 0.42;
  vec2 toMouse = (fieldUv - mouse_uv) * aspect;
  float mouseFalloff = uMouseAmt * exp(-dot(toMouse, toMouse) * 2.2);

  float t = u_time * u_speed;
  if (mouseFalloff > 0.002) {
    iso += vec2(
      snoise(iso * 0.9 + vec2(t * 0.18, t * 0.14)),
      snoise(iso * 0.9 - vec2(t * 0.12, -t * 0.16))
    ) * 0.02 * mouseFalloff;
    iso -= toMouse * 0.04 * mouseFalloff;
  }
  iso = rotate(iso, u_angle);

  float flow = iso.x;
  float edge = smoothstep(-18.0, -1.0, sdf);

  vec3 color2 = vec3(0.97, 0.975, 0.99);
  vec3 color1 = vec3(0.026, 0.027, 0.03);
  vec3 azure = vec3(0.24, 0.54, 1.0);
  vec3 gunmetal = vec3(0.035, 0.045, 0.07);
  vec3 silver = vec3(0.76, 0.79, 0.84);

  float dist = length(iso);
  float bulge = pow(1.55 * dist, 1.12);
  // Clamp: past dist ~0.65 bulge went negative and folded the stripes into hard corner wedges / rings.
  bulge = max(1. - bulge, 0.);
  bulge *= pow(max(0.5 + iso.y, 0.0), .34);

  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .11 / cycle_width * (1. - .38 * bulge);
  float thin_strip_2_ratio = .065 / cycle_width * (1. + .38 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

  float opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);

  float noise = snoise(vec2(flow, iso.y) * 0.28 - t * 0.22);
  edge += (1. - edge) * u_liquid * noise;

  float dir = flow;
  dir -= 0.48 * noise * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
  bulge *= clamp(pow(max(0.5 + iso.y, 0.0), .12), .35, 1.);
  dir *= (.15 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .72, edge);
  dir *= cycle_width;
  dir -= u_flow;
  dir += (mouse_uv.x - 0.5) * 0.06 * mouseFalloff;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .018 * smoothstep(.0, 1., edge + bulge);

  float stripe = mod(dir, 1.);
  float extraBlur = .022 * u_refraction * bulge;
  float ch = get_color_channel(color1.r, color2.r, stripe, w, extraBlur, bulge);
  // Dark cool chrome: only the edge of the light ramp flares to silver, the flat light plateau falls back to dark steel,
  // so tiles stay dark and difference-blended titles stay readable.
  float flare = smoothstep(0.7, 0.76, ch) * (1.0 - smoothstep(0.82, 0.9, ch));
  // Dense stripes (rings, chevrons) read as glitches: fade them into the sheen by stripe frequency per tile height.
  flare *= 1.0 - 0.9 * max(smoothstep(1.5, 5.0, fwidth(dir) * tileH), smoothstep(2.0, 10.0, fwidth(ch) * tileH));
  // Fade reflections out before the flat rim instead of cutting them on a straight line.
  flare *= 1.0 - smoothstep(-0.08 * tileH, -0.015 * tileH, sdf);
  // Brushed-steel sheen: a soft diagonal band per tile so no tile is ever flat black, and highlights stay a band.
  vec2 lp = (frag - tileBox.xy) / max(tileBox.zw, vec2(1.0));
  float band = 0.5 + 0.5 * cos((lp.x * 1.3 - lp.y * 0.4 - u_flow * 1.2 - t * 0.5) * PI);
  float tone = 0.1 + 0.12 * band + 0.06 * smoothstep(0.3, 0.7, ch) + 0.6 * flare * (0.1 + 0.9 * smoothstep(0.3, 0.95, band));
  vec3 color = mix(gunmetal, silver, tone);

  // Blue glints ride the dark-to-silver transition only, never the flat plateau under titles.
  float hi = smoothstep(0.6, 0.68, ch) * (1.0 - smoothstep(0.7, 0.75, ch));
  float spec = pow(tone, 6.0);
  color += vec3(spec * 0.12);

  float hueWave = 0.5 + 0.5 * sin(flow * TWO_PI * 0.46 + u_flow * 2.4);
  float azureAmt = (1.0 - smoothstep(0.18, 0.44, hueWave)) * hi;
  color = mix(color, azure * 0.42, azureAmt * 0.6);

  if (sdf > 2.0) discard;
  // Title/icon ink: hard contrast against the metal (not a soft 1-c invert — mid tones stay muddy on tablets).
  float ink = texture2D(u_ink, frag / u_resolution).a;
  float luma = dot(clamp(color, 0.0, 1.0), vec3(0.299, 0.587, 0.114));
  vec3 inkColor = mix(vec3(1.0), vec3(0.02), smoothstep(0.22, 0.48, luma));
  color = mix(color, inkColor, ink);
  color *= opacity;

  gl_FragColor = vec4(color, opacity);
}
`;

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
  liquid: 0.1,
  speed: 0.08,
  patternScale: 1.05,
  angleDeg: 35,
} as const;

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
uniform float uPad;
uniform vec4 uField;
uniform sampler2D uGlyph0;
uniform sampler2D uGlyph1;
uniform sampler2D uGlyph2;
uniform sampler2D uGlyph3;
uniform sampler2D uGlyph4;

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

float glyphCover(float id, vec2 uv) {
  vec2 u = clamp(uv, 0.0, 1.0);
  if (id < 0.5) return texture2D(uGlyph0, u).a;
  if (id < 1.5) return texture2D(uGlyph1, u).a;
  if (id < 2.5) return texture2D(uGlyph2, u).a;
  if (id < 3.5) return texture2D(uGlyph3, u).a;
  return texture2D(uGlyph4, u).a;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec4 rc = vec4(0.0);
  float sdf = 1.0e6;
  float found = 0.0;
  float cardId = 0.0;

  for (int i = 0; i < 5; i++) {
    vec4 box = uRect[i];
    float on = (1.0 - uOpen[i]) * step(2.0, box.z);
    vec2 halfSize = box.zw * 0.5;
    float pad = max(uPad, 0.75);
    vec2 innerHalf = max(halfSize - vec2(pad), vec2(0.0));
    float innerR = max(uRadius - pad, 0.0);
    float d = sdRoundBox(frag - (box.xy + halfSize), innerHalf, innerR);
    float take = on * step(d, 0.0) * step(d, sdf);
    rc = mix(rc, box, take);
    sdf = mix(sdf, d, take);
    cardId = mix(cardId, float(i), take);
    found = max(found, take);
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
  vec2 iso = (fieldUv - 0.5) * aspect;
  vec2 toMouse = (fieldUv - mouse_uv) * aspect;
  float mouseFalloff = uMouseAmt * exp(-dot(toMouse, toMouse) * 2.2);

  float t = u_time * u_speed;
  iso += vec2(
    snoise(iso * 0.9 + vec2(t * 0.42, t * 0.31)),
    snoise(iso * 0.9 - vec2(t * 0.27, -t * 0.38))
  ) * 0.02 * mouseFalloff;
  iso -= toMouse * 0.04 * mouseFalloff;
  iso = rotate(iso, u_angle);

  float flow = iso.x;
  float edge = smoothstep(-18.0, -1.0, sdf);

  vec3 color2 = vec3(0.97, 0.975, 0.99);
  vec3 color1 = vec3(0.026, 0.027, 0.03);
  vec3 azure = vec3(0.239, 0.541, 1.0);
  vec3 lemon = vec3(1.0, 0.894, 0.302);

  float dist = length(iso);
  float bulge = pow(1.55 * dist, 1.12);
  bulge = 1. - bulge;
  bulge *= pow(max(0.5 + iso.y, 0.0), .34);

  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .11 / cycle_width * (1. - .38 * bulge);
  float thin_strip_2_ratio = .065 / cycle_width * (1. + .38 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

  float opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);

  float noise = snoise(vec2(flow, iso.y) * 0.34 - t * 0.82) * 0.62
    + snoise(vec2(flow, iso.y) * 0.13 - t * 0.3) * 0.38;
  edge += (1. - edge) * u_liquid * noise;

  float dir = flow;
  dir -= 0.48 * noise * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
  bulge *= clamp(pow(max(0.5 + iso.y, 0.0), .12), .35, 1.);
  dir *= (.15 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .72, edge);
  dir *= cycle_width;
  dir -= t;
  dir += (mouse_uv.x - 0.5) * 0.06 * mouseFalloff;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .018 * smoothstep(.0, 1., edge + bulge);

  float stripe = mod(dir, 1.);
  float extraBlur = .022 * u_refraction * bulge;
  float chA = get_color_channel(color1.r, color2.r, stripe, w, extraBlur, bulge);
  float chB = get_color_channel(color1.r, color2.r, mod(stripe + 0.009, 1.), w, extraBlur * 1.2, bulge);
  float ch = mix(chA, max(chA, chB), 0.3);
  vec3 color = vec3(ch);

  float hi = smoothstep(0.44, 0.9, ch);
  float spec = pow(clamp((ch - 0.58) / 0.42, 0.0, 1.0), 7.0);
  color += vec3(spec * 0.2);

  float hueWave = 0.5 + 0.5 * sin(flow * TWO_PI * 0.46 + t * 0.26);
  float azureAmt = (1.0 - smoothstep(0.28, 0.48, hueWave)) * hi;
  float lemonAmt = smoothstep(0.52, 0.72, hueWave) * hi;
  color = mix(color, mix(color, azure, 0.46), azureAmt * 0.52);
  color = mix(color, mix(color, lemon, 0.42), lemonAmt * 0.48);

  vec2 gUv = vec2(
    (frag.x - rc.x) / max(rc.z, 1.0),
    (frag.y - rc.y) / max(rc.w, 1.0)
  );
  float cover = glyphCover(cardId, gUv);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  vec3 ink = mix(vec3(0.97, 0.972, 0.98), vec3(0.045, 0.046, 0.05), smoothstep(0.26, 0.5, luma));
  color = mix(color, ink, cover);

  if (sdf >= 0.0) discard;
  float clip = 1.0 - smoothstep(-1.0, -0.35, sdf);
  opacity *= clip;
  color *= opacity;

  gl_FragColor = vec4(color, opacity);
}
`;

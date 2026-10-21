/**
 * Liquid-metal fragment shader, default params, and Poisson edge-mask
 * from eamonliu/liquid-metal-playground (MIT, per the project README).
 * Shape morphing between logos is omitted so Caviar cards keep their
 * exact rounded-rect outline — the metal is the fill, not a drip.
 */

export const PLAYGROUND_PARAMS = {
  refraction: 0.02,
  edge: 0.3,
  patternBlur: 0.015,
  liquid: 0.15,
  speed: 0.4,
  patternScale: 1.5,
  angleDeg: 50,
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
uniform vec4 uRect[5];
uniform float uOpen[5];
uniform float uRadius;
uniform float uPad;

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
  vec4 rc = vec4(0.0);
  float sdf = 1.0e6;
  float found = 0.0;

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
    found = max(found, take);
  }

  if (found < 0.5) discard;

  vec2 v_uv = vec2((frag.x - rc.x) / rc.z, 1.0 - (frag.y - rc.y) / rc.w);
  vec2 mouse_uv = vec2((u_mouse.x - rc.x) / rc.z, 1.0 - (u_mouse.y - rc.y) / rc.w);

  vec2 uv = v_uv;
  float ratio = 1.0;
  uv.x *= ratio;

  vec2 center = vec2(0.5 * ratio, 0.5);
  uv = rotate(uv - center, u_angle) + center;

  float diagonal = uv.x - uv.y;
  float t = u_time * u_speed;

  vec2 img_uv = v_uv;

  vec2 toMouse = img_uv - mouse_uv;
  float mouseGate = step(0.0, mouse_uv.x) * step(0.0, mouse_uv.y) * step(mouse_uv.x, 1.0) * step(mouse_uv.y, 1.0);
  float mouseFalloff = mouseGate * exp(-dot(toMouse, toMouse) * 9.0);
  img_uv += vec2(
    snoise(img_uv * 5.0 + vec2(t, t)),
    snoise(img_uv * 5.0 - vec2(t, -t))
  ) * 0.045 * mouseFalloff;
  img_uv -= toMouse * 0.12 * mouseFalloff;
  img_uv = clamp(img_uv, 0.0, 1.0);

  float edgeMaskPrev = texture2D(u_mask, img_uv).r;
  float edgeMaskNext = texture2D(u_mask_next, img_uv).r;
  float edge = mix(edgeMaskPrev, edgeMaskNext, u_transition);

  vec3 color2 = vec3(.99, 0.99, 1.);
  vec3 color1 = vec3(.08, .08, .08 + .08 * smoothstep(.7, 1.3, uv.x + uv.y));

  vec2 grad_uv = uv;
  grad_uv -= .5;

  float dist = length(grad_uv + vec2(0., .2 * diagonal));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);

  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(max(uv.y, 0.0), .3);

  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
  float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

  float opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);

  float noise = snoise(uv - t);
  edge += (1. - edge) * u_liquid * noise;

  float refr = 0.;
  refr += (1. - bulge);
  refr = clamp(refr, 0., 1.);

  float dir = grad_uv.x;
  dir += diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));

  bulge *= clamp(pow(max(uv.y, 0.0), .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
  dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
  dir *= (.5 + .5 * pow(max(uv.y, 0.0), 2.));
  dir *= cycle_width;
  dir -= t;
  dir += (mouse_uv.x - 0.5) * 0.22 * mouseFalloff;

  float refr_r = refr;
  refr_r += .03 * bulge * noise;
  float refr_b = 1.3 * refr;

  refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
  refr_r -= diagonal;

  refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
  refr_b -= .2 * edge;

  refr_r *= u_refraction;
  refr_b *= u_refraction;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bulge);

  float stripe_r = mod(dir + refr_r, 1.);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);

  float stripe_g = mod(dir, 1.);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);

  float stripe_b = mod(dir - refr_b, 1.);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);

  vec3 color = vec3(r, g, b);

  if (sdf >= 0.0) discard;
  float clip = 1.0 - smoothstep(-1.0, -0.35, sdf);
  opacity *= clip;
  color *= opacity;

  gl_FragColor = vec4(color, opacity);
}
`;

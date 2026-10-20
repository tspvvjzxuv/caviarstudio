/**
 * Liquid-metal card surface.
 *
 * Chrome stripe / refraction shading adapted from:
 *   eamonliu/liquid-metal-playground
 *   https://github.com/eamonliu/liquid-metal-playground
 * Licensed under the MIT License as stated in that project's README.
 *
 * The original repo did not ship a LICENSE file; the README grants MIT use.
 * Card silhouette, pointer, and connector logic are our own.
 */

export const VERT = `attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = `precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uHover;
uniform float uOpen;
uniform float uSeed;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform vec2 uOrigin;
uniform vec4 uRipple0;
uniform vec4 uRipple1;
uniform vec4 uSplat0;
uniform vec4 uSplat1;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x * 34.) + 1.) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m * m;
  m = m * m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float border = 0.;
  float blur = 0.015 + extra_blur;
  ch = mix(ch, c1, smoothstep(0.0, blur, stripe_p));
  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  b = smoothstep(0.2, 0.8, b);
  border = w[0] + 0.4 * (1.0 - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + 0.5 * (1.0 - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0.0, 1.0, gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
  return ch;
}

float ripple(vec2 p, vec4 r) {
  if (r.w <= 0.001) return 0.0;
  float d = length(p - r.xy);
  return sin(d * 28.0 - r.z * 9.0) * exp(-d * 3.0) * exp(-r.z * 1.15) * r.w;
}

float splatWarp(vec2 p, vec4 s) {
  float a = length(s.zw);
  if (a <= 0.001) return 0.0;
  return exp(-dot(p - s.xy, p - s.xy) * 3.2) * a;
}

float cardEdge(vec2 p, vec2 mouse, float t) {
  vec2 c = uOrigin;
  vec2 r = vec2(0.72 + 0.03 * sin(uSeed * 6.2), 0.54 + 0.03 * cos(uSeed * 4.1));
  r += 0.03 * vec2(snoise(vec2(t * 0.21 + uSeed, 0.2)), snoise(vec2(1.4, t * 0.17 - uSeed)));
  float body = length((p - c) / r);
  vec2 dripC = c + vec2(0.0, -0.68);
  float drip = length((p - dripC) / vec2(0.22, 0.34));
  float d = mix(body, smin(body, drip, 0.28), uOpen);
  d -= uHover * 0.16 * exp(-length(p - mouse) * 2.6);
  d += ripple(p, uRipple0) * 0.12 + ripple(p, uRipple1) * 0.12;
  d -= splatWarp(p, uSplat0) * 0.08 + splatWarp(p, uSplat1) * 0.08;
  return clamp(d, 0.0, 1.8);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float ratio = uRes.x / max(uRes.y, 1.0);
  vec2 p = (uv * 2.0 - 1.0) * vec2(ratio, 1.0);
  vec2 mouse = uMouse;
  float t = uTime * 0.4;

  vec2 warp = vec2(
    snoise(uv * 4.0 + vec2(t, t + uSeed)),
    snoise(uv * 4.0 - vec2(t, -t))
  ) * 0.025;
  warp += vec2(-uVel.y, uVel.x) * uHover * 0.04 * exp(-length(p - mouse) * 2.4);
  vec2 q = p + warp;

  vec2 suv = uv;
  suv.x *= ratio;
  float angle = radians(50.0 + uSeed * 12.0);
  vec2 center = vec2(0.5 * ratio, 0.5);
  suv = rotate(suv - center, angle) + center;

  float diagonal = suv.x - suv.y;
  float edge = cardEdge(q, mouse, t);

  vec3 color2 = vec3(0.99, 0.99, 1.0);
  vec3 color1 = vec3(0.08, 0.08, 0.08 + 0.08 * smoothstep(0.7, 1.3, suv.x + suv.y));
  color1 += vec3(0.04, 0.08, 0.16) * 0.12 * smoothstep(1.1, 0.2, length(suv - vec2(0.15 * ratio, 0.2)));
  color1 += vec3(0.16, 0.12, 0.02) * 0.10 * smoothstep(1.1, 0.2, length(suv - vec2(0.85 * ratio, 0.85)));

  vec2 grad_uv = suv - 0.5;
  float dist = length(grad_uv + vec2(0.0, 0.2 * diagonal));
  grad_uv = rotate(grad_uv, (0.25 - 0.2 * diagonal) * PI);
  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1.0 - bulge;
  bulge *= pow(clamp(suv.y, 0.0, 1.0), 0.3);
  bulge += uHover * 0.12 * exp(-length(q - mouse) * 2.2);

  float cycle_width = 1.5;
  float thin_strip_1_ratio = 0.12 / cycle_width * (1.0 - 0.4 * bulge);
  float thin_strip_2_ratio = 0.07 / cycle_width * (1.0 + 0.4 * bulge);
  float wide_strip_ratio = (1.0 - thin_strip_1_ratio - thin_strip_2_ratio);
  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

  float u_edge = 0.3;
  float opacity = 1.0 - smoothstep(0.9 - 0.5 * u_edge, 1.0 - 0.5 * u_edge, edge);

  float noise = snoise(suv - t);
  edge += (1.0 - edge) * 0.15 * noise;

  float refr = clamp(1.0 - bulge, 0.0, 1.0);
  float dir = grad_uv.x;
  dir += diagonal;
  dir -= 2.0 * noise * diagonal * (smoothstep(0.0, 1.0, edge) * smoothstep(1.0, 0.0, edge));
  bulge *= clamp(pow(clamp(suv.y, 0.0, 1.0), 0.1), 0.3, 1.0);
  dir *= (0.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1.0, 0.7, edge);
  dir += 0.18 * (smoothstep(0.1, 0.2, suv.y) * smoothstep(0.4, 0.2, suv.y));
  dir += 0.03 * (smoothstep(0.1, 0.2, 1.0 - suv.y) * smoothstep(0.4, 0.2, 1.0 - suv.y));
  dir *= (0.5 + 0.5 * pow(clamp(suv.y, 0.0, 1.0), 2.0));
  dir *= cycle_width;
  dir -= t;
  dir += splatWarp(q, uSplat0) * 0.08 + splatWarp(q, uSplat1) * 0.08;

  float refr_r = refr;
  refr_r += 0.03 * bulge * noise;
  float refr_b = 1.3 * refr;
  refr_r += 5.0 * (smoothstep(-0.1, 0.2, suv.y) * smoothstep(0.5, 0.1, suv.y)) * (smoothstep(0.4, 0.6, bulge) * smoothstep(1.0, 0.4, bulge));
  refr_r -= diagonal;
  refr_b += (smoothstep(0.0, 0.4, suv.y) * smoothstep(0.8, 0.1, suv.y)) * (smoothstep(0.4, 0.6, bulge) * smoothstep(0.8, 0.4, bulge));
  refr_b -= 0.2 * edge;
  float u_refraction = 0.02;
  refr_r *= u_refraction;
  refr_b *= u_refraction;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= 0.02 * smoothstep(0.0, 1.0, edge + bulge);

  float stripe_r = mod(dir + refr_r, 1.0);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + 0.03 * u_refraction * bulge, bulge);
  float stripe_g = mod(dir, 1.0);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / max(1.0 - diagonal, 0.08), bulge);
  float stripe_b = mod(dir - refr_b, 1.0);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, 0.01, bulge);

  vec3 color = vec3(r, g, b) * opacity;
  gl_FragColor = vec4(color, opacity);
}`;

export function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function startMetal(canvas: HTMLCanvasElement) {
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
    time: gl.getUniformLocation(prog, "uTime"),
    hover: gl.getUniformLocation(prog, "uHover"),
    open: gl.getUniformLocation(prog, "uOpen"),
    seed: gl.getUniformLocation(prog, "uSeed"),
    mouse: gl.getUniformLocation(prog, "uMouse"),
    vel: gl.getUniformLocation(prog, "uVel"),
    origin: gl.getUniformLocation(prog, "uOrigin"),
    r0: gl.getUniformLocation(prog, "uRipple0"),
    r1: gl.getUniformLocation(prog, "uRipple1"),
    s0: gl.getUniformLocation(prog, "uSplat0"),
    s1: gl.getUniformLocation(prog, "uSplat1"),
  };
  return { gl, prog, buf, loc };
}

export function serviceSeed(id: string) {
  if (id === "foto") return 0.11;
  if (id === "video") return 0.37;
  if (id === "web") return 0.58;
  if (id === "dron") return 0.79;
  if (id === "brand") return 0.93;
  return 0.2;
}

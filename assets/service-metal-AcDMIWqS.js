import{a as e,c as t,i as n,l as r,o as i,r as a,s as o,t as s}from"./three.module-1-d1QQdZ.js";var c=5,l=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,u=`
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
`;function d(){return!!navigator.connection?.saveData}function f(e){e?.classList.add(`is-metal-fallback`)}function p(p){let m=p.closest(`.service-sec`);if(d()||!m)return f(m),()=>{};let h;try{h=new s({canvas:p,alpha:!0,antialias:!1,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!1})}catch{return f(m),()=>{}}h.setClearColor(0,0);let g=window.matchMedia(`(max-width: 767px)`).matches;h.setPixelRatio(Math.min(window.devicePixelRatio||1,g?1.15:1.4));let _=Array.from({length:c},()=>new r(-4e3,-4e3,0,0)),v=Array.from({length:c},()=>new t(-4e3,-4e3)),y=[0,0,0,0,0],b=new i,x=new n(-1,1,1,-1,0,1),S=new e(2,2),C=new o({transparent:!0,depthTest:!1,uniforms:{uTime:{value:0},uRes:{value:new t(1,1)},uMouse:{value:new t(-4e3,-4e3)},uSweep:{value:0},uRadius:{value:24},uRect:{value:_},uCenter:{value:v},uOpen:{value:y}},vertexShader:l,fragmentShader:u});b.add(new a(S,C));let w=performance.now(),T=window.matchMedia(`(hover: hover) and (pointer: fine)`),E=0,D=!1,O=0,k=new t(-4e3,-4e3),A=()=>{let e=Math.max(1,m.clientWidth),t=Math.max(1,m.clientHeight);h.setSize(e,t,!1),C.uniforms.uRes.value.set(e,t);let n=m.querySelector(`button.service-chrome`),r=n&&Number.parseFloat(getComputedStyle(n).borderRadius)||24;C.uniforms.uRadius.value=r*h.getPixelRatio(),j()},j=()=>{let e=m.getBoundingClientRect(),t=h.getPixelRatio(),n=m.querySelectorAll(`button.service-chrome`),r=Math.max(1,m.clientHeight);for(let i=0;i<c;i++){let a=n[i];if(!a){_[i].set(-4e3,-4e3,0,0),v[i].set(-4e3,-4e3),y[i]=1;continue}let o=a.getBoundingClientRect(),s=o.left-e.left,c=r-(o.top-e.top)-o.height;_[i].set(s*t,c*t,o.width*t,o.height*t),v[i].set((s+o.width*.5)*t,(c+o.height*.5)*t),y[i]=a.getAttribute(`aria-expanded`)===`true`||a.classList.contains(`is-open`)?1:0}},M=()=>{D=!1,E&&=(cancelAnimationFrame(E),0)},N=()=>{if(!D)return;if(g&&(O=1-O,O===0)){E=requestAnimationFrame(N);return}let e=(performance.now()-w)/1e3;C.uniforms.uTime.value=e,C.uniforms.uSweep.value=e*.085;let t=h.getPixelRatio(),n=Math.max(1,m.clientHeight);C.uniforms.uMouse.value.set(k.x*t,(n-k.y)*t),h.render(b,x),E=requestAnimationFrame(N)},P=()=>{D||(D=!0,E=requestAnimationFrame(N))},F=()=>{document.hidden||m.classList.contains(`is-paused`)?M():P()},I=e=>{if(!T.matches){k.set(-4e3,-4e3);return}let t=m.getBoundingClientRect();k.set(e.clientX-t.left,e.clientY-t.top)},L=()=>k.set(-4e3,-4e3),R=new IntersectionObserver(([e])=>{e.isIntersecting&&!document.hidden&&!m.classList.contains(`is-paused`)?P():M()}),z=new ResizeObserver(()=>A()),B=new MutationObserver(()=>{j(),F()}),V=!0;return h.debug.onShaderError=()=>{V=!1},A(),h.compile(b,x),V?(R.observe(m),z.observe(m),B.observe(m,{attributes:!0,attributeFilter:[`class`,`aria-expanded`],subtree:!0}),window.addEventListener(`resize`,A,{passive:!0}),document.addEventListener(`visibilitychange`,F),m.addEventListener(`pointermove`,I,{passive:!0}),m.addEventListener(`pointerleave`,L,{passive:!0}),()=>{M(),R.disconnect(),z.disconnect(),B.disconnect(),window.removeEventListener(`resize`,A),document.removeEventListener(`visibilitychange`,F),m.removeEventListener(`pointermove`,I),m.removeEventListener(`pointerleave`,L),S.dispose(),C.dispose(),h.dispose()}):(f(m),S.dispose(),C.dispose(),h.dispose(),()=>{})}export{p as mountServiceMetal};
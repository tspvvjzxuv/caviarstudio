import{a as e,c as t,d as n,f as r,i,l as a,m as o,n as s,o as c,p as l,s as u,t as d,u as f}from"./three.module-Cm0x16XL.js";var p={refraction:.018,edge:.3,patternBlur:.028,liquid:.12,speed:.09,patternScale:.78,angleDeg:50},m=.01,h=300,g=2;function _(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!i)return{width:e,height:t,data:new Uint8Array(e*t*4)};i.fillStyle=`#ffffff`,i.fillRect(0,0,e,t),i.fillStyle=`#000000`,i.beginPath();let a=Math.max(1,Math.min(n,e/2,t/2));i.moveTo(a,0),i.lineTo(e-a,0),i.quadraticCurveTo(e,0,e,a),i.lineTo(e,t-a),i.quadraticCurveTo(e,t,e-a,t),i.lineTo(a,t),i.quadraticCurveTo(0,t,0,t-a),i.lineTo(0,a),i.quadraticCurveTo(0,0,a,0),i.closePath(),i.fill();let o=i.getImageData(0,0,e,t).data,s=e*t,c=new Float32Array(s),l=new Uint8Array(s),u=new Uint8Array(s);for(let e=0;e<s;e++){let t=o[e*4],n=o[e*4+1],r=o[e*4+2];(t<250||n<250||r<250)&&(l[e]=1)}for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&(!l[r-1]||!l[r+1]||!l[r-e]||!l[r+e])&&(u[r]=1)}let d=new Float32Array(s);for(let n=0;n<h;n++){for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&!u[r]?d[r]=(m+c[r+1]+c[r-1]+c[r+e]+c[r-e])/4:d[r]=0}let n=c;c=d,d=n}let f=0;for(let e=0;e<s;e++)c[e]>f&&(f=c[e]);let p=new Uint8Array(s*4);for(let e=0;e<s;e++){let t=255;l[e]&&(t=255*(1-(f>0?c[e]/f:0)**+g)),p[e*4]=t,p[e*4+1]=t,p[e*4+2]=t,p[e*4+3]=255}return{width:e,height:t,data:p}}var v=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,ee=`
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

  vec2 fieldUv = vec2(
    (frag.x - uField.x) / max(uField.z, 1.0),
    1.0 - (frag.y - uField.y) / max(uField.w, 1.0)
  );
  vec2 mouse_uv = vec2(
    (u_mouse.x - uField.x) / max(uField.z, 1.0),
    1.0 - (u_mouse.y - uField.y) / max(uField.w, 1.0)
  );

  float ratio = uField.z / max(uField.w, 1.0);
  vec2 uv = fieldUv;
  uv.x *= ratio;

  vec2 aspect = vec2(ratio, 1.0);
  vec2 toMouse = (fieldUv - mouse_uv) * aspect;
  float mouseFalloff = uMouseAmt * exp(-dot(toMouse, toMouse) * 2.2);

  float t = u_time * u_speed;
  uv += vec2(
    snoise(uv * 1.15 + vec2(t * 0.55, t * 0.4)),
    snoise(uv * 1.15 - vec2(t * 0.35, -t * 0.5))
  ) * 0.028 * mouseFalloff;
  uv -= toMouse * 0.045 * mouseFalloff;

  vec2 center = vec2(0.5 * ratio, 0.5);
  uv = rotate(uv - center, u_angle) + center;

  float diagonal = uv.x - uv.y;

  float edge = smoothstep(-18.0, -1.0, sdf);

  vec3 color2 = vec3(0.90, 0.91, 0.94);
  vec3 color1 = vec3(0.055, 0.056, 0.062);

  vec2 grad_uv = uv - center;
  grad_uv.x /= max(ratio, 1.0);

  float dist = length(grad_uv + vec2(0., .12 * diagonal));
  grad_uv = rotate(grad_uv, (.18 - .12 * diagonal) * PI);

  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(max(fieldUv.y, 0.0), .3);

  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
  float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
  float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

  float opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);

  float noise = snoise(uv * 0.42 - t) * 0.72 + snoise(uv * 0.16 - t * 0.38) * 0.28;
  edge += (1. - edge) * u_liquid * noise;

  float refr = 0.;
  refr += (1. - bulge);
  refr = clamp(refr, 0., 1.);

  float dir = grad_uv.x;
  dir += diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));

  bulge *= clamp(pow(max(fieldUv.y, 0.0), .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1, .2, fieldUv.y) * smoothstep(.4, .2, fieldUv.y));
  dir += .03 * (smoothstep(.1, .2, 1. - fieldUv.y) * smoothstep(.4, .2, 1. - fieldUv.y));
  dir *= (.5 + .5 * pow(max(fieldUv.y, 0.0), 2.));
  dir *= cycle_width;
  dir -= t;
  dir += (mouse_uv.x - 0.5) * 0.07 * mouseFalloff;

  float refr_r = refr;
  refr_r += .03 * bulge * noise;
  float refr_b = 1.3 * refr;

  refr_r += 5. * (smoothstep(-.1, .2, fieldUv.y) * smoothstep(.5, .1, fieldUv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
  refr_r -= diagonal;

  refr_b += (smoothstep(0., .4, fieldUv.y) * smoothstep(.8, .1, fieldUv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
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
`,y=5,b=1.25;function x(){return!!navigator.connection?.saveData}function S(e){e?.classList.remove(`has-metal`),e?.classList.add(`is-metal-fallback`)}function C(e,t,n,r,i){let a=Math.max(0,Math.min(i,n/2,r/2)),o=e+n,s=t+r;return[`M${e+a} ${t}`,`H${o-a}`,`A${a} ${a} 0 0 1 ${o} ${t+a}`,`V${s-a}`,`A${a} ${a} 0 0 1 ${o-a} ${s}`,`H${e+a}`,`A${a} ${a} 0 0 1 ${e} ${s-a}`,`V${t+a}`,`A${a} ${a} 0 0 1 ${e+a} ${t}`,`Z`].join(` `)}function te(e,t,n,r,i,a){let o=t.filter(e=>!e.open&&e.w>2&&e.h>2),s=Math.max(0,n-a),c=o.map(e=>C(e.x+a,e.y+a,Math.max(0,e.w-a*2),Math.max(0,e.h-a*2),s)).join(` `)||`M0 0`;e.style.clipPath=`path('${c}')`,e.style.setProperty(`-webkit-clip-path`,`path('${c}')`);let l=`<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${i}" viewBox="0 0 ${r} ${i}">${o.map(e=>{let t=(e.x+a).toFixed(2),n=(e.y+a).toFixed(2),r=Math.max(0,e.w-a*2).toFixed(2),i=Math.max(0,e.h-a*2).toFixed(2),o=Math.max(0,Math.min(s,(e.w-a*2)/2,(e.h-a*2)/2)).toFixed(2);return`<rect x="${t}" y="${n}" width="${r}" height="${i}" rx="${o}" ry="${o}" fill="#fff"/>`}).join(``)}</svg>`,u=`url("data:image/svg+xml,${encodeURIComponent(l)}")`;e.style.webkitMaskImage=u,e.style.maskImage=u}function w(m){let h=m.closest(`.service-sec`);if(x()||!h)return S(h),()=>{};let g;try{g=new d({canvas:m,alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!1})}catch{return S(h),()=>{}}g.setClearColor(0,0);let C=window.matchMedia(`(max-width: 767px)`).matches;g.setPixelRatio(Math.min(window.devicePixelRatio||1,C?1.15:1.5));let w=Array.from({length:y},()=>new o(-4e3,-4e3,0,0)),T=[0,0,0,0,0],E=new o(0,0,1,1),D=_(64,32,8),O=new i(D.data,D.width,D.height,a,r);O.wrapS=s,O.wrapT=s,O.minFilter=e,O.magFilter=e,O.flipY=!1,O.needsUpdate=!0;let k=new f,A=new u(-1,1,1,-1,0,1),j=new t(2,2),M=new n({transparent:!0,depthTest:!1,premultipliedAlpha:!0,uniforms:{u_mask:{value:O},u_mask_next:{value:O},u_transition:{value:1},u_time:{value:0},u_refraction:{value:p.refraction},u_edge:{value:p.edge},u_patternBlur:{value:p.patternBlur},u_liquid:{value:p.liquid},u_speed:{value:p.speed},u_patternScale:{value:p.patternScale},u_resolution:{value:new l(1,1)},u_angle:{value:p.angleDeg*Math.PI/180},u_mouse:{value:new l(-4e3,-4e3)},uMouseAmt:{value:0},uRect:{value:w},uOpen:{value:T},uRadius:{value:24},uPad:{value:b},uField:{value:E}},vertexShader:v,fragmentShader:ee});k.add(new c(j,M));let ne=performance.now(),N=0,P=!1,F=0,I=new l(-4e3,-4e3),L=new l(-4e3,-4e3),R=0,z=0,B=C?.03:.045,V=``,H=()=>{let e=Math.max(1,m.clientWidth||h.clientWidth),t=Math.max(1,m.clientHeight||h.clientHeight);g.setSize(e,t,!1),M.uniforms.u_resolution.value.set(e,t),U()},U=()=>{let e=m.getBoundingClientRect(),t=g.getPixelRatio(),n=h.querySelectorAll(`button.service-chrome`),r=Math.max(1,e.width),i=Math.max(1,e.height),a=n[0],o=a?getComputedStyle(a):null,s=o&&Number.parseFloat(o.borderRadius)||24,c=o&&Number.parseFloat(o.borderTopWidth)||1,l=Math.max(b,c);M.uniforms.uRadius.value=s*t,M.uniforms.uPad.value=l*t;let u=[],d=1/0,f=1/0,p=-1/0,_=-1/0;for(let r=0;r<y;r++){let a=n[r];if(!a){w[r].set(-4e3,-4e3,0,0),T[r]=1;continue}let o=a.getBoundingClientRect(),s=o.left-e.left,c=o.top-e.top,l=a.getAttribute(`aria-expanded`)===`true`||a.classList.contains(`is-open`);w[r].set(s*t,(i-c-o.height)*t,o.width*t,o.height*t),T[r]=+!!l,u.push({x:s,y:c,w:o.width,h:o.height,open:l}),!l&&o.width>2&&o.height>2&&(d=Math.min(d,s),f=Math.min(f,c),p=Math.max(p,s+o.width),_=Math.max(_,c+o.height))}Number.isFinite(d)&&p>d&&_>f&&E.set(d*t,(i-_)*t,(p-d)*t,(_-f)*t);let v=`${r.toFixed(2)}x${i.toFixed(2)}:${s}:${l}:${u.map(e=>`${e.x.toFixed(1)},${e.y.toFixed(1)},${e.w.toFixed(1)},${e.h.toFixed(1)},${+!!e.open}`).join(`|`)}`;v!==V&&(V=v,te(m,u,s,r,i,l))},W=()=>{P=!1,N&&=(cancelAnimationFrame(N),0)},G=()=>{if(!P)return;if(C&&(F=1-F,F===0)){N=requestAnimationFrame(G);return}M.uniforms.u_time.value=(performance.now()-ne)/1e3;let e=g.getPixelRatio(),t=Math.max(1,m.getBoundingClientRect().height);L.lerp(I,B),R+=(z-R)*(z>R?B:.028),M.uniforms.u_mouse.value.set(L.x*e,(t-L.y)*e),M.uniforms.uMouseAmt.value=R,U(),g.render(k,A),N=requestAnimationFrame(G)},K=()=>{P||(P=!0,N=requestAnimationFrame(G))},q=()=>{document.hidden||h.classList.contains(`is-paused`)?W():K()},J=e=>{let t=m.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;R<.02&&L.set(n,r),I.set(n,r),z=1},Y=()=>{z=0},X=new IntersectionObserver(([e])=>{e.isIntersecting&&!document.hidden&&!h.classList.contains(`is-paused`)?K():W()}),Z=new ResizeObserver(()=>H()),Q=new MutationObserver(()=>{U(),q()}),$=!0;return g.debug.onShaderError=()=>{$=!1},H(),g.compile(k,A),$?(h.classList.add(`has-metal`),X.observe(h),Z.observe(h),Q.observe(h,{attributes:!0,attributeFilter:[`class`,`aria-expanded`],subtree:!0}),window.addEventListener(`resize`,H,{passive:!0}),document.addEventListener(`visibilitychange`,q),h.addEventListener(`pointermove`,J,{passive:!0}),h.addEventListener(`pointerdown`,J,{passive:!0}),h.addEventListener(`pointerleave`,Y,{passive:!0}),()=>{W(),h.classList.remove(`has-metal`),X.disconnect(),Z.disconnect(),Q.disconnect(),window.removeEventListener(`resize`,H),document.removeEventListener(`visibilitychange`,q),h.removeEventListener(`pointermove`,J),h.removeEventListener(`pointerdown`,J),h.removeEventListener(`pointerleave`,Y),j.dispose(),M.dispose(),O.dispose(),g.dispose()}):(S(h),j.dispose(),M.dispose(),O.dispose(),g.dispose(),()=>{})}export{w as mountServiceMetal};
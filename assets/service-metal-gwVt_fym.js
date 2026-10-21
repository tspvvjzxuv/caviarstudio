import{a as e,c as t,d as n,f as r,i,l as a,m as o,n as s,o as c,p as l,s as u,t as d,u as f}from"./three.module-Cm0x16XL.js";var p={refraction:.022,edge:.22,patternBlur:.016,liquid:.08,speed:.025,patternScale:1.05,angleDeg:35},m={legSec:20,pauseSec:3.5,angleSec:12,travel:.7};function h(){return m.legSec*2+m.pauseSec+m.angleSec}function g(e){return e-Math.floor(e)}function _(e){return g(Math.sin(e*127.1+311.7)*43758.5453123)}function v(e){let t=Math.min(1,Math.max(0,e));return t*t*t*(t*(t*6-15)+10)}function y(e){let t=(20+_(e+.17)*40)*Math.PI/180;return _(e+.91)>.5?-t:t}function b(e){let t=_(e+3.17),n=_(e+8.41);return[t<.5?.14+t*.44:.62+(t-.5)*.48,n<.5?.16+n*.48:.58+(n-.5)*.52]}function x(e,t,n=.2){let r=e-.5,i=t-.5,a=Math.hypot(r,i);if(a>=n)return[e,t];let o=n/Math.max(a,1e-4);return[.5+r*o,.5+i*o]}function S(e,t,n){let r=(e[0]+t[0])*.5,i=(e[1]+t[1])*.5,a=t[0]-e[0],o=-(t[1]-e[1]),s=a,c=Math.hypot(o,s)||1;o/=c,s/=c;let l=x(r+o*.24,i+s*.24,.22),u=x(r-o*.24,i-s*.24,.22),d=Math.hypot(l[0]-.5,l[1]-.5)>=Math.hypot(u[0]-.5,u[1]-.5)?l:u,f=1-n;return x(f*f*e[0]+2*f*n*d[0]+n*n*t[0],f*f*e[1]+2*f*n*d[1]+n*n*t[1],.18)}function C(e){let{legSec:t,pauseSec:n,angleSec:r,travel:i}=m,a=h(),o=Math.max(0,e),s=Math.floor(o/a),c=o-s*a,l=y(s),u=y(s+1),d=o/(a*2),f=Math.floor(d),[p,g]=S(b(f),b(f+1),v(d-f)),_=0,x=l;return c<t?_=v(c/t)*i:c<t+n?_=i:c<t*2+n?_=(1-v((c-t-n)/t))*i:x=l+(u-l)*v((c-t*2-n)/Math.max(r,.001)),{flow:_,angle:x,focusX:p,focusY:g,cycle:s,local:c,round:a}}var w=.01,T=300,E=2;function ee(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!i)return{width:e,height:t,data:new Uint8Array(e*t*4)};i.fillStyle=`#ffffff`,i.fillRect(0,0,e,t),i.fillStyle=`#000000`,i.beginPath();let a=Math.max(1,Math.min(n,e/2,t/2));i.moveTo(a,0),i.lineTo(e-a,0),i.quadraticCurveTo(e,0,e,a),i.lineTo(e,t-a),i.quadraticCurveTo(e,t,e-a,t),i.lineTo(a,t),i.quadraticCurveTo(0,t,0,t-a),i.lineTo(0,a),i.quadraticCurveTo(0,0,a,0),i.closePath(),i.fill();let o=i.getImageData(0,0,e,t).data,s=e*t,c=new Float32Array(s),l=new Uint8Array(s),u=new Uint8Array(s);for(let e=0;e<s;e++){let t=o[e*4],n=o[e*4+1],r=o[e*4+2];(t<250||n<250||r<250)&&(l[e]=1)}for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&(!l[r-1]||!l[r+1]||!l[r-e]||!l[r+e])&&(u[r]=1)}let d=new Float32Array(s);for(let n=0;n<T;n++){for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&!u[r]?d[r]=(w+c[r+1]+c[r-1]+c[r+e]+c[r-e])/4:d[r]=0}let n=c;c=d,d=n}let f=0;for(let e=0;e<s;e++)c[e]>f&&(f=c[e]);let p=new Uint8Array(s*4);for(let e=0;e<s;e++){let t=255;l[e]&&(t=255*(1-(f>0?c[e]/f:0)**+E)),p[e*4]=t,p[e*4+1]=t,p[e*4+2]=t,p[e*4+3]=255}return{width:e,height:t,data:p}}var te=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,ne=`
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
uniform vec2 uFocus;
uniform float u_flow;
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
  vec2 iso = (fieldUv - uFocus) * aspect;
  vec2 toMouse = (fieldUv - mouse_uv) * aspect;
  float mouseFalloff = uMouseAmt * exp(-dot(toMouse, toMouse) * 2.2);

  float t = u_time * u_speed;
  iso += vec2(
    snoise(iso * 0.9 + vec2(t * 0.18, t * 0.14)),
    snoise(iso * 0.9 - vec2(t * 0.12, -t * 0.16))
  ) * 0.02 * mouseFalloff;
  iso -= toMouse * 0.04 * mouseFalloff;
  iso = rotate(iso, u_angle);

  float flow = iso.x;
  float edge = smoothstep(-18.0, -1.0, sdf);

  vec3 color2 = vec3(0.97, 0.975, 0.99);
  vec3 color1 = vec3(0.026, 0.027, 0.03);
  vec3 azure = vec3(0.16, 0.46, 1.0);
  vec3 lemon = vec3(1.0, 0.84, 0.14);

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

  float noise = snoise(vec2(flow, iso.y) * 0.34 - t * 0.28) * 0.62
    + snoise(vec2(flow, iso.y) * 0.13 - t * 0.11) * 0.38;
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
  float chA = get_color_channel(color1.r, color2.r, stripe, w, extraBlur, bulge);
  float chB = get_color_channel(color1.r, color2.r, mod(stripe + 0.009, 1.), w, extraBlur * 1.2, bulge);
  float ch = mix(chA, max(chA, chB), 0.3);
  vec3 color = vec3(ch);

  float hi = smoothstep(0.44, 0.9, ch);
  float spec = pow(clamp((ch - 0.58) / 0.42, 0.0, 1.0), 7.0);
  color += vec3(spec * 0.2);

  float hueWave = 0.5 + 0.5 * sin(flow * TWO_PI * 0.46 + u_flow * 2.4);
  float azureAmt = (1.0 - smoothstep(0.18, 0.44, hueWave)) * hi;
  float lemonAmt = smoothstep(0.56, 0.82, hueWave) * hi;
  color = mix(color, mix(color, azure, 0.62), azureAmt * 0.7);
  color = mix(color, mix(color, lemon, 0.58), lemonAmt * 0.68);

  vec2 gUv = vec2(
    (frag.x - rc.x) / max(rc.z, 1.0),
    (frag.y - rc.y) / max(rc.w, 1.0)
  );
  float cover = glyphCover(cardId, gUv);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  vec3 ink = mix(vec3(0.99, 0.99, 1.0), vec3(0.02, 0.02, 0.025), smoothstep(0.30, 0.40, luma));
  color = mix(color, ink, cover);

  if (sdf >= 0.0) discard;
  float clip = 1.0 - smoothstep(-1.0, -0.35, sdf);
  opacity *= clip;
  color *= opacity;

  gl_FragColor = vec4(color, opacity);
}
`,D=5,O=1.25;function re(){return!!navigator.connection?.saveData}function k(e){e?.classList.remove(`has-metal`,`has-metal-ink`),e?.classList.add(`is-metal-fallback`)}function ie(){let e=document.createElement(`canvas`);return e.width=4,e.height=4,{canvas:e,texture:A(e)}}function A(t){let n=t.getContext(`2d`),o=Math.max(1,t.width),c=Math.max(1,t.height),l=n?n.getImageData(0,0,o,c).data:new Uint8ClampedArray(o*c*4),u=new i(l,o,c,a,r);return u.flipY=!0,u.generateMipmaps=!1,u.wrapS=s,u.wrapT=s,u.minFilter=e,u.magFilter=e,u.needsUpdate=!0,u}function j(e){let t=e.cloneNode(!0);t.setAttribute(`xmlns`,`http://www.w3.org/2000/svg`),t.setAttribute(`stroke`,`#ffffff`),t.setAttribute(`fill`,`none`),t.querySelectorAll(`[stroke]`).forEach(e=>{let t=e.getAttribute(`stroke`);t&&t!==`none`&&e.setAttribute(`stroke`,`#ffffff`)}),t.querySelectorAll(`[fill]`).forEach(e=>{let t=e.getAttribute(`fill`);t&&t!==`none`&&t!==`transparent`&&e.setAttribute(`fill`,`#ffffff`)});let n=e.getBoundingClientRect();return t.setAttribute(`width`,String(Math.max(1,n.width))),t.setAttribute(`height`,String(Math.max(1,n.height))),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(t))}`}var M=new Map;async function N(e){let t=M.get(e);if(t)return t;let n=new Image;return n.decoding=`async`,n.src=e,await n.decode(),M.set(e,n),n}function P(e,t,n){let r=t.split(/\s+/).filter(Boolean),i=[],a=``;for(let t of r){let r=a?`${a} ${t}`:t;a&&e.measureText(r).width>n?(i.push(a),a=t):a=r}return a&&i.push(a),i.length?i:[t]}async function ae(e,t,n,r){let i=t.getBoundingClientRect(),a=Math.max(1,i.width),o=Math.max(1,i.height),s=Math.max(1,Math.round(a*n)),c=Math.max(1,Math.round(o*n));(e.width!==s||e.height!==c)&&(e.width=s,e.height=c);let l=e.getContext(`2d`);if(!l)return;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,s,c),l.setTransform(n,0,0,n,0,0),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality=`high`;let u=t.querySelectorAll(`.icon-disc`),d=t.querySelector(`.font-serif`),f=[];if(u.forEach(e=>{let t=e.getBoundingClientRect(),n=t.left-i.left,a=t.top-i.top,o=Math.min(t.width,t.height)/2;l.strokeStyle=`#ffffff`,l.lineWidth=Math.max(1.1,t.width*.028),l.beginPath(),l.arc(n+t.width/2,a+t.height/2,Math.max(1,o-l.lineWidth),0,Math.PI*2),l.stroke();let s=e.querySelector(`svg`);if(!(s instanceof SVGSVGElement))return;let c=s.getBoundingClientRect();f.push(N(j(s)).then(e=>{r()&&l.drawImage(e,c.left-i.left,c.top-i.top,c.width,c.height)}))}),d){let e=d.getBoundingClientRect(),t=getComputedStyle(d),n=(d.textContent??``).replace(/\s+/g,` `).trim();l.fillStyle=`#ffffff`,l.font=`${t.fontStyle} ${t.fontWeight} ${t.fontSize} ${t.fontFamily}`,`letterSpacing`in l&&(l.letterSpacing=t.letterSpacing),l.textAlign=`left`,l.textBaseline=`middle`;let r=Math.max(8,e.width),a=P(l,n,r),o=Number.parseFloat(t.lineHeight)||e.height/Math.max(1,a.length),s=e.top-i.top+(e.height-o*(a.length-1))/2;a.forEach((t,n)=>{l.fillText(t,e.left-i.left,s+n*o,r)})}await Promise.all(f)}function F(e,t,n,r,i){let a=Math.max(0,Math.min(i,n/2,r/2)),o=e+n,s=t+r;return[`M${e+a} ${t}`,`H${o-a}`,`A${a} ${a} 0 0 1 ${o} ${t+a}`,`V${s-a}`,`A${a} ${a} 0 0 1 ${o-a} ${s}`,`H${e+a}`,`A${a} ${a} 0 0 1 ${e} ${s-a}`,`V${t+a}`,`A${a} ${a} 0 0 1 ${e+a} ${t}`,`Z`].join(` `)}function oe(e,t,n,r,i,a){let o=t.filter(e=>!e.open&&e.w>2&&e.h>2),s=Math.max(0,n-a),c=o.map(e=>F(e.x+a,e.y+a,Math.max(0,e.w-a*2),Math.max(0,e.h-a*2),s)).join(` `)||`M0 0`;e.style.clipPath=`path('${c}')`,e.style.setProperty(`-webkit-clip-path`,`path('${c}')`);let l=`<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${i}" viewBox="0 0 ${r} ${i}">${o.map(e=>{let t=(e.x+a).toFixed(2),n=(e.y+a).toFixed(2),r=Math.max(0,e.w-a*2).toFixed(2),i=Math.max(0,e.h-a*2).toFixed(2),o=Math.max(0,Math.min(s,(e.w-a*2)/2,(e.h-a*2)/2)).toFixed(2);return`<rect x="${t}" y="${n}" width="${r}" height="${i}" rx="${o}" ry="${o}" fill="#fff"/>`}).join(``)}</svg>`,u=`url("data:image/svg+xml,${encodeURIComponent(l)}")`;e.style.webkitMaskImage=u,e.style.maskImage=u}function I(m){let h=m.closest(`.service-sec`);if(re()||!h)return k(h),()=>{};let g;try{g=new d({canvas:m,alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!1})}catch{return k(h),()=>{}}g.setClearColor(0,0);let _=window.matchMedia(`(max-width: 767px)`).matches;g.setPixelRatio(Math.min(window.devicePixelRatio||1,_?1.15:1.5));let v=Array.from({length:D},()=>new o(-4e3,-4e3,0,0)),y=[0,0,0,0,0],b=new o(0,0,1,1),x=ee(64,32,8),S=new i(x.data,x.width,x.height,a,r);S.wrapS=s,S.wrapT=s,S.minFilter=e,S.magFilter=e,S.flipY=!1,S.needsUpdate=!0;let w=Array.from({length:D},()=>ie()),T=C(0),E=new f,j=new u(-1,1,1,-1,0,1),M=new t(2,2),N=new n({transparent:!0,depthTest:!1,premultipliedAlpha:!0,uniforms:{u_mask:{value:S},u_mask_next:{value:S},u_transition:{value:1},u_time:{value:0},u_refraction:{value:p.refraction},u_edge:{value:p.edge},u_patternBlur:{value:p.patternBlur},u_liquid:{value:p.liquid},u_speed:{value:p.speed},u_patternScale:{value:p.patternScale},u_resolution:{value:new l(1,1)},u_angle:{value:T.angle},u_mouse:{value:new l(-4e3,-4e3)},uMouseAmt:{value:0},uRect:{value:v},uOpen:{value:y},uRadius:{value:24},uPad:{value:O},uField:{value:b},uFocus:{value:new l(T.focusX,T.focusY)},u_flow:{value:T.flow},uGlyph0:{value:w[0].texture},uGlyph1:{value:w[1].texture},uGlyph2:{value:w[2].texture},uGlyph3:{value:w[3].texture},uGlyph4:{value:w[4].texture}},vertexShader:te,fragmentShader:ne});E.add(new c(M,N));let P=performance.now(),F=0,I=!1,L=0,se=new l(-4e3,-4e3),R=new l(-4e3,-4e3),z=0,B=0,V=_?.03:.045,H=``,U=``,W=0,G=0,ce=async()=>{let e=++G,t=h.querySelectorAll(`button.service-chrome`),n=g.getPixelRatio();try{await document.fonts.ready,await document.fonts.load(`400 2.1rem "Bodoni Moda"`)}catch{}if(e!==G)return;let r=0;await Promise.all(Array.from({length:D},async(i,a)=>{let o=t[a];if(o)await ae(w[a].canvas,o,n,()=>e===G),e===G&&(w[a].texture.dispose(),w[a].texture=A(w[a].canvas),N.uniforms[`uGlyph${a}`].value=w[a].texture,r+=1);else{let e=w[a].canvas;e.width=4,e.height=4,w[a].texture.dispose(),w[a].texture=A(e),N.uniforms[`uGlyph${a}`].value=w[a].texture}})),e===G&&r>0&&h.classList.add(`has-metal-ink`)},K=()=>{window.clearTimeout(W),W=window.setTimeout(()=>{ce()},40)},q=()=>{let e=Math.max(1,m.clientWidth||h.clientWidth),t=Math.max(1,m.clientHeight||h.clientHeight);g.setSize(e,t,!1),N.uniforms.u_resolution.value.set(e,t),J()},J=()=>{let e=m.getBoundingClientRect(),t=g.getPixelRatio(),n=h.querySelectorAll(`button.service-chrome`),r=Math.max(1,e.width),i=Math.max(1,e.height),a=n[0],o=a?getComputedStyle(a):null,s=o&&Number.parseFloat(o.borderRadius)||24,c=o&&Number.parseFloat(o.borderTopWidth)||1,l=Math.max(O,c);N.uniforms.uRadius.value=s*t,N.uniforms.uPad.value=l*t;let u=[],d=1/0,f=1/0,p=-1/0,_=-1/0;for(let r=0;r<D;r++){let a=n[r];if(!a){v[r].set(-4e3,-4e3,0,0),y[r]=1;continue}let o=a.getBoundingClientRect(),s=o.left-e.left,c=o.top-e.top,l=a.getAttribute(`aria-expanded`)===`true`||a.classList.contains(`is-open`);v[r].set(s*t,(i-c-o.height)*t,o.width*t,o.height*t),y[r]=+!!l,u.push({x:s,y:c,w:o.width,h:o.height,open:l}),!l&&o.width>2&&o.height>2&&(d=Math.min(d,s),f=Math.min(f,c),p=Math.max(p,s+o.width),_=Math.max(_,c+o.height))}Number.isFinite(d)&&p>d&&_>f&&b.set(d*t,(i-_)*t,(p-d)*t,(_-f)*t);let x=`${r.toFixed(2)}x${i.toFixed(2)}:${s}:${l}:${u.map(e=>`${e.x.toFixed(1)},${e.y.toFixed(1)},${e.w.toFixed(1)},${e.h.toFixed(1)},${+!!e.open}`).join(`|`)}`;x!==H&&(H=x,oe(m,u,s,r,i,l));let S=`${t}:${r.toFixed(1)}x${i.toFixed(1)}:${Array.from(n).map(e=>{let t=e.querySelector(`.font-serif`)?.textContent?.trim()??``,n=e.getBoundingClientRect();return`${t}:${n.width.toFixed(1)}x${n.height.toFixed(1)}`}).join(`|`)}`;S!==U&&(U=S,K())},Y=()=>{I=!1,F&&=(cancelAnimationFrame(F),0)},X=()=>{if(!I)return;if(_&&(L=1-L,L===0)){F=requestAnimationFrame(X);return}let e=(performance.now()-P)/1e3,t=C(e);N.uniforms.u_time.value=e,N.uniforms.u_flow.value=t.flow,N.uniforms.u_angle.value=t.angle,N.uniforms.uFocus.value.set(t.focusX,t.focusY);let n=g.getPixelRatio(),r=Math.max(1,m.getBoundingClientRect().height);R.lerp(se,V),z+=(B-z)*(B>z?V:.028),N.uniforms.u_mouse.value.set(R.x*n,(r-R.y)*n),N.uniforms.uMouseAmt.value=z,J(),g.render(E,j),F=requestAnimationFrame(X)},le=()=>{I||(I=!0,F=requestAnimationFrame(X))},Z=()=>{document.hidden||h.classList.contains(`is-paused`)?Y():le()},Q=e=>{let t=m.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;z<.02&&R.set(n,r),se.set(n,r),B=1},$=()=>{B=0},ue=new IntersectionObserver(([e])=>{e.isIntersecting&&!document.hidden&&!h.classList.contains(`is-paused`)?le():Y()}),de=new ResizeObserver(()=>q()),fe=new MutationObserver(()=>{J(),Z()}),pe=!0;if(g.debug.onShaderError=()=>{pe=!1},q(),g.compile(E,j),!pe)return k(h),M.dispose(),N.dispose(),S.dispose(),w.forEach(({texture:e})=>e.dispose()),g.dispose(),()=>{};h.classList.add(`has-metal`),ue.observe(h),de.observe(h),fe.observe(h,{attributes:!0,attributeFilter:[`class`,`aria-expanded`,`lang`],subtree:!0,childList:!0,characterData:!0});let me=()=>K();return document.fonts.addEventListener(`loadingdone`,me),window.addEventListener(`resize`,q,{passive:!0}),document.addEventListener(`visibilitychange`,Z),h.addEventListener(`pointermove`,Q,{passive:!0}),h.addEventListener(`pointerdown`,Q,{passive:!0}),h.addEventListener(`pointerleave`,$,{passive:!0}),()=>{Y(),h.classList.remove(`has-metal`,`has-metal-ink`),ue.disconnect(),de.disconnect(),fe.disconnect(),document.fonts.removeEventListener(`loadingdone`,me),window.removeEventListener(`resize`,q),document.removeEventListener(`visibilitychange`,Z),h.removeEventListener(`pointermove`,Q),h.removeEventListener(`pointerdown`,Q),h.removeEventListener(`pointerleave`,$),window.clearTimeout(W),M.dispose(),N.dispose(),S.dispose(),w.forEach(({texture:e})=>e.dispose()),g.dispose()}}export{I as mountServiceMetal};
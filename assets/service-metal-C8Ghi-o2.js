import{a as e,c as t,d as n,f as r,h as i,l as a,m as o,n as s,o as c,p as l,r as u,s as d,t as f,u as p}from"./three.module-CsdGEG1w.js";var m={refraction:.022,edge:.22,patternBlur:.016,liquid:.1,speed:.08,patternScale:1.05,angleDeg:35},h=.01,g=300,_=2;function v(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t;let i=r.getContext(`2d`,{willReadFrequently:!0});if(!i)return{width:e,height:t,data:new Uint8Array(e*t*4)};i.fillStyle=`#ffffff`,i.fillRect(0,0,e,t),i.fillStyle=`#000000`,i.beginPath();let a=Math.max(1,Math.min(n,e/2,t/2));i.moveTo(a,0),i.lineTo(e-a,0),i.quadraticCurveTo(e,0,e,a),i.lineTo(e,t-a),i.quadraticCurveTo(e,t,e-a,t),i.lineTo(a,t),i.quadraticCurveTo(0,t,0,t-a),i.lineTo(0,a),i.quadraticCurveTo(0,0,a,0),i.closePath(),i.fill();let o=i.getImageData(0,0,e,t).data,s=e*t,c=new Float32Array(s),l=new Uint8Array(s),u=new Uint8Array(s);for(let e=0;e<s;e++){let t=o[e*4],n=o[e*4+1],r=o[e*4+2];(t<250||n<250||r<250)&&(l[e]=1)}for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&(!l[r-1]||!l[r+1]||!l[r-e]||!l[r+e])&&(u[r]=1)}let d=new Float32Array(s);for(let n=0;n<g;n++){for(let n=1;n<t-1;n++)for(let t=1;t<e-1;t++){let r=n*e+t;l[r]&&!u[r]?d[r]=(h+c[r+1]+c[r-1]+c[r+e]+c[r-e])/4:d[r]=0}let n=c;c=d,d=n}let f=0;for(let e=0;e<s;e++)c[e]>f&&(f=c[e]);let p=new Uint8Array(s*4);for(let e=0;e<s;e++){let t=255;l[e]&&(t=255*(1-(f>0?c[e]/f:0)**+_)),p[e*4]=t,p[e*4+1]=t,p[e*4+2]=t,p[e*4+3]=255}return{width:e,height:t,data:p}}var y=`
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
`,b=5,x=1.25;function te(){return!!navigator.connection?.saveData}function S(e){e?.classList.remove(`has-metal`,`has-metal-ink`),e?.classList.add(`is-metal-fallback`)}function ne(){let e=document.createElement(`canvas`);e.width=1,e.height=1;let t=new s(e);return t.flipY=!0,t.generateMipmaps=!1,t.wrapS=u,t.wrapT=u,t.minFilter=c,t.magFilter=c,t.needsUpdate=!0,{canvas:e,texture:t}}function C(e){let t=e.cloneNode(!0);t.setAttribute(`xmlns`,`http://www.w3.org/2000/svg`),t.setAttribute(`stroke`,`#ffffff`),t.setAttribute(`fill`,`none`),t.querySelectorAll(`[stroke]`).forEach(e=>{let t=e.getAttribute(`stroke`);t&&t!==`none`&&e.setAttribute(`stroke`,`#ffffff`)}),t.querySelectorAll(`[fill]`).forEach(e=>{let t=e.getAttribute(`fill`);t&&t!==`none`&&t!==`transparent`&&e.setAttribute(`fill`,`#ffffff`)});let n=e.getBoundingClientRect();return t.setAttribute(`width`,String(Math.max(1,n.width))),t.setAttribute(`height`,String(Math.max(1,n.height))),`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(t))}`}var w=new Map;async function T(e){let t=w.get(e);if(t)return t;let n=new Image;return n.decoding=`async`,n.src=e,await n.decode(),w.set(e,n),n}function E(e,t,n){let r=t.split(/\s+/).filter(Boolean),i=[],a=``;for(let t of r){let r=a?`${a} ${t}`:t;a&&e.measureText(r).width>n?(i.push(a),a=t):a=r}return a&&i.push(a),i.length?i:[t]}async function re(e,t,n,r){let i=t.getBoundingClientRect(),a=Math.max(1,i.width),o=Math.max(1,i.height),s=Math.max(1,Math.round(a*n)),c=Math.max(1,Math.round(o*n));(e.width!==s||e.height!==c)&&(e.width=s,e.height=c);let l=e.getContext(`2d`);if(!l)return;l.setTransform(1,0,0,1,0,0),l.clearRect(0,0,s,c),l.setTransform(n,0,0,n,0,0),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality=`high`;let u=t.querySelectorAll(`.icon-disc`),d=t.querySelector(`.font-serif`),f=[];if(u.forEach(e=>{let t=e.getBoundingClientRect(),n=t.left-i.left,a=t.top-i.top,o=Math.min(t.width,t.height)/2;l.strokeStyle=`#ffffff`,l.lineWidth=Math.max(1.1,t.width*.028),l.beginPath(),l.arc(n+t.width/2,a+t.height/2,Math.max(1,o-l.lineWidth),0,Math.PI*2),l.stroke();let s=e.querySelector(`svg`);if(!(s instanceof SVGSVGElement))return;let c=s.getBoundingClientRect();f.push(T(C(s)).then(e=>{r()&&l.drawImage(e,c.left-i.left,c.top-i.top,c.width,c.height)}))}),d){let e=d.getBoundingClientRect(),t=getComputedStyle(d),n=(d.textContent??``).replace(/\s+/g,` `).trim();l.fillStyle=`#ffffff`,l.font=`${t.fontStyle} ${t.fontWeight} ${t.fontSize} ${t.fontFamily}`,`letterSpacing`in l&&(l.letterSpacing=t.letterSpacing),l.textAlign=`left`,l.textBaseline=`middle`;let r=Math.max(8,e.width),a=E(l,n,r),o=Number.parseFloat(t.lineHeight)||e.height/Math.max(1,a.length),s=e.top-i.top+(e.height-o*(a.length-1))/2;a.forEach((t,n)=>{l.fillText(t,e.left-i.left,s+n*o,r)})}await Promise.all(f)}function D(e,t,n,r,i){let a=Math.max(0,Math.min(i,n/2,r/2)),o=e+n,s=t+r;return[`M${e+a} ${t}`,`H${o-a}`,`A${a} ${a} 0 0 1 ${o} ${t+a}`,`V${s-a}`,`A${a} ${a} 0 0 1 ${o-a} ${s}`,`H${e+a}`,`A${a} ${a} 0 0 1 ${e} ${s-a}`,`V${t+a}`,`A${a} ${a} 0 0 1 ${e+a} ${t}`,`Z`].join(` `)}function ie(e,t,n,r,i,a){let o=t.filter(e=>!e.open&&e.w>2&&e.h>2),s=Math.max(0,n-a),c=o.map(e=>D(e.x+a,e.y+a,Math.max(0,e.w-a*2),Math.max(0,e.h-a*2),s)).join(` `)||`M0 0`;e.style.clipPath=`path('${c}')`,e.style.setProperty(`-webkit-clip-path`,`path('${c}')`);let l=`<svg xmlns="http://www.w3.org/2000/svg" width="${r}" height="${i}" viewBox="0 0 ${r} ${i}">${o.map(e=>{let t=(e.x+a).toFixed(2),n=(e.y+a).toFixed(2),r=Math.max(0,e.w-a*2).toFixed(2),i=Math.max(0,e.h-a*2).toFixed(2),o=Math.max(0,Math.min(s,(e.w-a*2)/2,(e.h-a*2)/2)).toFixed(2);return`<rect x="${t}" y="${n}" width="${r}" height="${i}" rx="${o}" ry="${o}" fill="#fff"/>`}).join(``)}</svg>`,u=`url("data:image/svg+xml,${encodeURIComponent(l)}")`;e.style.webkitMaskImage=u,e.style.maskImage=u}function O(s){let h=s.closest(`.service-sec`);if(te()||!h)return S(h),()=>{};let g;try{g=new f({canvas:s,alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:`low-power`,failIfMajorPerformanceCaveat:!1})}catch{return S(h),()=>{}}g.setClearColor(0,0);let _=window.matchMedia(`(max-width: 767px)`).matches;g.setPixelRatio(Math.min(window.devicePixelRatio||1,_?1.15:1.5));let C=Array.from({length:b},()=>new i(-4e3,-4e3,0,0)),w=[0,0,0,0,0],T=new i(0,0,1,1),E=v(64,32,8),D=new e(E.data,E.width,E.height,p,l);D.wrapS=u,D.wrapT=u,D.minFilter=c,D.magFilter=c,D.flipY=!1,D.needsUpdate=!0;let O=Array.from({length:b},()=>ne()),k=new n,A=new t(-1,1,1,-1,0,1),j=new a(2,2),M=new r({transparent:!0,depthTest:!1,premultipliedAlpha:!0,uniforms:{u_mask:{value:D},u_mask_next:{value:D},u_transition:{value:1},u_time:{value:0},u_refraction:{value:m.refraction},u_edge:{value:m.edge},u_patternBlur:{value:m.patternBlur},u_liquid:{value:m.liquid},u_speed:{value:m.speed},u_patternScale:{value:m.patternScale},u_resolution:{value:new o(1,1)},u_angle:{value:m.angleDeg*Math.PI/180},u_mouse:{value:new o(-4e3,-4e3)},uMouseAmt:{value:0},uRect:{value:C},uOpen:{value:w},uRadius:{value:24},uPad:{value:x},uField:{value:T},uGlyph0:{value:O[0].texture},uGlyph1:{value:O[1].texture},uGlyph2:{value:O[2].texture},uGlyph3:{value:O[3].texture},uGlyph4:{value:O[4].texture}},vertexShader:y,fragmentShader:ee});k.add(new d(j,M));let ae=performance.now(),N=0,P=!1,F=0,I=new o(-4e3,-4e3),L=new o(-4e3,-4e3),R=0,z=0,B=_?.03:.045,V=``,H=``,U=0,W=0,oe=async()=>{let e=++W,t=h.querySelectorAll(`button.service-chrome`),n=g.getPixelRatio();try{await document.fonts.ready,await document.fonts.load(`400 2.1rem "Bodoni Moda"`)}catch{}e===W&&(await Promise.all(Array.from({length:b},async(r,i)=>{let a=t[i];if(a)await re(O[i].canvas,a,n,()=>e===W),e===W&&(O[i].texture.needsUpdate=!0);else{let e=O[i].canvas;e.width=1,e.height=1,O[i].texture.needsUpdate=!0}})),e===W&&h.classList.add(`has-metal-ink`))},G=()=>{window.clearTimeout(U),U=window.setTimeout(()=>{oe()},40)},K=()=>{let e=Math.max(1,s.clientWidth||h.clientWidth),t=Math.max(1,s.clientHeight||h.clientHeight);g.setSize(e,t,!1),M.uniforms.u_resolution.value.set(e,t),q()},q=()=>{let e=s.getBoundingClientRect(),t=g.getPixelRatio(),n=h.querySelectorAll(`button.service-chrome`),r=Math.max(1,e.width),i=Math.max(1,e.height),a=n[0],o=a?getComputedStyle(a):null,c=o&&Number.parseFloat(o.borderRadius)||24,l=o&&Number.parseFloat(o.borderTopWidth)||1,u=Math.max(x,l);M.uniforms.uRadius.value=c*t,M.uniforms.uPad.value=u*t;let d=[],f=1/0,p=1/0,m=-1/0,_=-1/0;for(let r=0;r<b;r++){let a=n[r];if(!a){C[r].set(-4e3,-4e3,0,0),w[r]=1;continue}let o=a.getBoundingClientRect(),s=o.left-e.left,c=o.top-e.top,l=a.getAttribute(`aria-expanded`)===`true`||a.classList.contains(`is-open`);C[r].set(s*t,(i-c-o.height)*t,o.width*t,o.height*t),w[r]=+!!l,d.push({x:s,y:c,w:o.width,h:o.height,open:l}),!l&&o.width>2&&o.height>2&&(f=Math.min(f,s),p=Math.min(p,c),m=Math.max(m,s+o.width),_=Math.max(_,c+o.height))}Number.isFinite(f)&&m>f&&_>p&&T.set(f*t,(i-_)*t,(m-f)*t,(_-p)*t);let v=`${r.toFixed(2)}x${i.toFixed(2)}:${c}:${u}:${d.map(e=>`${e.x.toFixed(1)},${e.y.toFixed(1)},${e.w.toFixed(1)},${e.h.toFixed(1)},${+!!e.open}`).join(`|`)}`;v!==V&&(V=v,ie(s,d,c,r,i,u));let y=`${t}:${r.toFixed(1)}x${i.toFixed(1)}:${Array.from(n).map(e=>{let t=e.querySelector(`.font-serif`)?.textContent?.trim()??``,n=e.getBoundingClientRect();return`${t}:${n.width.toFixed(1)}x${n.height.toFixed(1)}`}).join(`|`)}`;y!==H&&(H=y,G())},J=()=>{P=!1,N&&=(cancelAnimationFrame(N),0)},Y=()=>{if(!P)return;if(_&&(F=1-F,F===0)){N=requestAnimationFrame(Y);return}M.uniforms.u_time.value=(performance.now()-ae)/1e3;let e=g.getPixelRatio(),t=Math.max(1,s.getBoundingClientRect().height);L.lerp(I,B),R+=(z-R)*(z>R?B:.028),M.uniforms.u_mouse.value.set(L.x*e,(t-L.y)*e),M.uniforms.uMouseAmt.value=R,q(),g.render(k,A),N=requestAnimationFrame(Y)},X=()=>{P||(P=!0,N=requestAnimationFrame(Y))},Z=()=>{document.hidden||h.classList.contains(`is-paused`)?J():X()},Q=e=>{let t=s.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;R<.02&&L.set(n,r),I.set(n,r),z=1},$=()=>{z=0},se=new IntersectionObserver(([e])=>{e.isIntersecting&&!document.hidden&&!h.classList.contains(`is-paused`)?X():J()}),ce=new ResizeObserver(()=>K()),le=new MutationObserver(()=>{q(),Z()}),ue=!0;if(g.debug.onShaderError=()=>{ue=!1},K(),g.compile(k,A),!ue)return S(h),j.dispose(),M.dispose(),D.dispose(),O.forEach(({texture:e})=>e.dispose()),g.dispose(),()=>{};h.classList.add(`has-metal`),se.observe(h),ce.observe(h),le.observe(h,{attributes:!0,attributeFilter:[`class`,`aria-expanded`,`lang`],subtree:!0,childList:!0,characterData:!0});let de=()=>G();return document.fonts.addEventListener(`loadingdone`,de),window.addEventListener(`resize`,K,{passive:!0}),document.addEventListener(`visibilitychange`,Z),h.addEventListener(`pointermove`,Q,{passive:!0}),h.addEventListener(`pointerdown`,Q,{passive:!0}),h.addEventListener(`pointerleave`,$,{passive:!0}),()=>{J(),h.classList.remove(`has-metal`,`has-metal-ink`),se.disconnect(),ce.disconnect(),le.disconnect(),document.fonts.removeEventListener(`loadingdone`,de),window.removeEventListener(`resize`,K),document.removeEventListener(`visibilitychange`,Z),h.removeEventListener(`pointermove`,Q),h.removeEventListener(`pointerdown`,Q),h.removeEventListener(`pointerleave`,$),window.clearTimeout(U),j.dispose(),M.dispose(),D.dispose(),O.forEach(({texture:e})=>e.dispose()),g.dispose()}}export{O as mountServiceMetal};
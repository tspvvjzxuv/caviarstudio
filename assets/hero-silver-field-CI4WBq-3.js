import{c as e,d as t,f as n,i as r,l as i,m as a,s as o,t as s}from"./three.module-CsdGEG1w.js";var c=`
void main() {
  gl_Position = vec4(position, 1.0);
}
`,l=`
precision highp float;
uniform float uTime;
uniform vec2 uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(uRes, vec2(1.0));
  float t = uTime * 0.05;
  float n = noise(uv * 3.0 + vec2(t, -t * 0.35));
  float n2 = noise(uv * 7.5 - vec2(t * 0.45, t * 0.8));
  float sheen = smoothstep(0.32, 0.78, n * 0.62 + n2 * 0.38);
  vec3 pearl = vec3(0.956, 0.961, 0.969);
  vec3 steel = vec3(0.604, 0.639, 0.682);
  vec3 col = mix(steel, pearl, sheen);
  float vig = smoothstep(0.12, 0.88, 1.0 - length((uv - 0.5) * vec2(1.15, 1.0)));
  float alpha = 0.16 * vig * (0.5 + 0.5 * sheen);
  gl_FragColor = vec4(col, alpha);
}
`;function u(u){let d=new s({canvas:u,alpha:!0,antialias:!1,powerPreference:`low-power`});d.setClearColor(0,0),d.setPixelRatio(Math.min(window.devicePixelRatio,1.5));let f=new t,p=new e(-1,1,1,-1,0,1),m=new i(2,2),h=new n({transparent:!0,depthTest:!1,uniforms:{uTime:{value:0},uRes:{value:new a(1,1)}},vertexShader:c,fragmentShader:l});f.add(new o(m,h));let g=new r,_=0,v=!1,y=()=>{let e=Math.max(1,u.clientWidth),t=Math.max(1,u.clientHeight);d.setSize(e,t,!1),h.uniforms.uRes.value.set(e,t)},b=()=>{v=!1,_&&=(cancelAnimationFrame(_),0)},x=()=>{v&&(h.uniforms.uTime.value=g.getElapsedTime(),d.render(f,p),_=requestAnimationFrame(x))},S=()=>{v||(v=!0,g.getDelta(),_=requestAnimationFrame(x))},C=()=>{document.hidden?b():S()},w=new IntersectionObserver(([e])=>{e.isIntersecting&&!document.hidden?S():b()});return y(),w.observe(u),window.addEventListener(`resize`,y,{passive:!0}),document.addEventListener(`visibilitychange`,C),()=>{b(),w.disconnect(),window.removeEventListener(`resize`,y),document.removeEventListener(`visibilitychange`,C),m.dispose(),h.dispose(),d.dispose()}}export{u as mountSilverField};
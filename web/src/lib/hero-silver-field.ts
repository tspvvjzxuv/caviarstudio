import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const VERT = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
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
`;

export function mountSilverField(canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
  });
  scene.add(new Mesh(geometry, material));

  const clock = new Clock();
  let raf = 0;
  let running = false;

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    material.uniforms.uRes.value.set(w, h);
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
    material.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    clock.getDelta();
    raf = requestAnimationFrame(tick);
  };

  const onVis = () => {
    if (document.hidden) stop();
    else start();
  };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden) start();
    else stop();
  });

  resize();
  io.observe(canvas);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVis);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

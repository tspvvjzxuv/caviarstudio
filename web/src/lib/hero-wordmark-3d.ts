import {
  ACESFilmicToneMapping,
  BackSide,
  Box3,
  BoxGeometry,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  Scene,
  ShapePath,
  Vector3,
  WebGLRenderer,
  type Shape,
} from "three";
import { CAVIAR_LETTERS, CAVIAR_TRACK, type GlyphCmd } from "@/lib/caviar-glyphs";

const LERP = 0.12;
const FOV = 28;
const SCROLL_VH = 0.8;
const TILT_X = 0.11;
const TILT_Y = 0.16;
const GYRO_RANGE = 28;
const ENV_SPIN = 0.00016;
const EXTRUDE = {
  depth: 220,
  bevelEnabled: true,
  bevelThickness: 30,
  bevelSize: 17,
  bevelOffset: 0,
  bevelSegments: 4,
  curveSegments: 5,
  steps: 1,
} as const;

function makeStudioEnv() {
  const studio = new Scene();
  const geos: Array<BoxGeometry | PlaneGeometry> = [];
  const mats: MeshStandardMaterial[] = [];

  const addMat = (params: ConstructorParameters<typeof MeshStandardMaterial>[0]) => {
    const mat = new MeshStandardMaterial(params);
    mats.push(mat);
    return mat;
  };
  const addBox = (w: number, h: number, d: number) => {
    const geo = new BoxGeometry(w, h, d);
    geos.push(geo);
    return geo;
  };
  const strip = (
    w: number,
    h: number,
    emissive: number,
    intensity: number,
    pos: readonly [number, number, number],
    rot: readonly [number, number, number],
  ) => {
    const geo = new PlaneGeometry(w, h);
    geos.push(geo);
    const mesh = new Mesh(
      geo,
      addMat({
        color: 0x000000,
        emissive: new Color(emissive),
        emissiveIntensity: intensity,
        roughness: 1,
        metalness: 0,
      }),
    );
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    studio.add(mesh);
  };

  studio.add(
    new Mesh(
      addBox(24, 24, 24),
      addMat({ color: 0x050608, side: BackSide, roughness: 1, metalness: 0 }),
    ),
  );
  strip(14, 0.16, 0xf7f8fb, 42, [0, 8.4, 1.4], [Math.PI / 2, 0, 0]);
  strip(0.14, 11, 0xffffff, 58, [7.2, 1.1, 2.4], [0, -0.42, 0]);
  strip(0.1, 9, 0xfff3dc, 36, [-2.8, 0.6, 7.4], [0, 2.95, 0.12]);
  strip(5.5, 7, 0xb9d4ff, 9, [-8.2, 1.4, 0.6], [0, 1.18, 0]);
  strip(9, 0.28, 0xffffff, 32, [0.4, 3.6, -8.6], [0, 0, 0]);
  strip(10, 3.2, 0x6e7786, 2.4, [0, -8.6, 2], [-Math.PI / 2, 0, 0]);

  return {
    studio,
    dispose() {
      for (const geo of geos) geo.dispose();
      for (const mat of mats) mat.dispose();
    },
  };
}

type LetterData = { ox: number; oy: number; oz: number; i: number };

type LetterMesh = Mesh<ExtrudeGeometry, MeshPhysicalMaterial>;

type DOE = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<string>;
};

function cmdsToShapes(cmds: readonly GlyphCmd[]): Shape[] {
  const path = new ShapePath();
  for (const cmd of cmds) {
    const t = cmd[0];
    if (t === "M") {
      path.currentPath?.closePath();
      path.moveTo(cmd[1], cmd[2]);
    } else if (t === "L") path.lineTo(cmd[1], cmd[2]);
    else if (t === "Q") path.quadraticCurveTo(cmd[1], cmd[2], cmd[3], cmd[4]);
    else if (t === "C") path.bezierCurveTo(cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6]);
    else path.currentPath?.closePath();
  }
  path.currentPath?.closePath();
  return path.toShapes();
}

function letterGeometry(cmds: readonly GlyphCmd[]) {
  const shapes = cmdsToShapes(cmds);
  if (!shapes.length) return null;
  let geo: ExtrudeGeometry;
  try {
    geo = new ExtrudeGeometry(shapes, EXTRUDE);
  } catch {
    geo = new ExtrudeGeometry(shapes, { ...EXTRUDE, bevelEnabled: false });
  }
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  if (box) geo.translate(0, 0, -(box.min.z + box.max.z) * 0.5);
  geo.computeVertexNormals();
  return geo;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function mountHeroWordmark(canvas: HTMLCanvasElement): () => void {
  const slot = canvas.parentElement;
  if (!slot) return () => {};
  const hero = (canvas.closest("#top") as HTMLElement | null) ?? slot;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = false;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, 8);

  const pmrem = new PMREMGenerator(renderer);
  const { studio, dispose: disposeStudio } = makeStudioEnv();
  const envTex = pmrem.fromScene(studio, 0).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 1.18;
  disposeStudio();
  pmrem.dispose();

  scene.add(new HemisphereLight(0xeef1f6, 0x0b0d12, 0.08));
  const key = new DirectionalLight(0xffffff, 0.62);
  key.position.set(2.6, 3.8, 4.4);
  key.castShadow = false;
  scene.add(key);
  const bevelSpec = new DirectionalLight(0xffffff, 0.9);
  bevelSpec.position.set(-1.1, 5.2, 2.4);
  bevelSpec.castShadow = false;
  scene.add(bevelSpec);
  const rim = new DirectionalLight(0x9ec1ff, 0.22);
  rim.position.set(-3.4, 1.2, 1.4);
  rim.castShadow = false;
  scene.add(rim);

  const material = new MeshPhysicalMaterial({
    color: new Color("#b7bec8"),
    metalness: 1,
    roughness: 0.03,
    envMapIntensity: 2.45,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    ior: 1.5,
    specularIntensity: 1,
  });

  const group = new Group();
  const letters: LetterMesh[] = [];
  const geos: ExtrudeGeometry[] = [];
  let cursor = 0;
  const mid = (CAVIAR_LETTERS.length - 1) / 2;

  for (let i = 0; i < CAVIAR_LETTERS.length; i++) {
    const letter = CAVIAR_LETTERS[i];
    const geo = letterGeometry(letter.cmds);
    if (!geo) {
      cursor += letter.advance + CAVIAR_TRACK;
      continue;
    }
    geos.push(geo);
    const mesh = new Mesh(geo, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.position.set(cursor, 0, 0);
    mesh.userData = { ox: cursor, oy: 0, oz: 0, i: i - mid } satisfies LetterData;
    group.add(mesh);
    letters.push(mesh);
    cursor += letter.advance + CAVIAR_TRACK;
  }

  if (!letters.length) {
    material.dispose();
    renderer.dispose();
    return () => {};
  }

  const bounds = new Box3().setFromObject(group);
  const center = bounds.getCenter(new Vector3());
  for (const mesh of letters) {
    mesh.position.x -= center.x;
    mesh.position.y -= center.y;
    mesh.position.z -= center.z;
    mesh.userData.ox = mesh.position.x;
    mesh.userData.oy = mesh.position.y;
    mesh.userData.oz = mesh.position.z;
  }
  const size = bounds.getSize(new Vector3());
  const wordW = Math.max(1, size.x);
  group.scale.setScalar(6 / wordW);
  scene.add(group);

  const spreadAmp = wordW * 0.08;
  const letterZAmp = wordW * 0.055;
  const recedeAmp = 7.2;

  const fitCamera = () => {
    const w = Math.max(1, canvas.clientWidth || Math.round(slot.clientWidth * 1.18));
    const h = Math.max(1, canvas.clientHeight || Math.round(slot.clientHeight * 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfH = Math.tan((FOV * Math.PI) / 360);
    const sx = group.scale.x;
    const camDist = Math.max(
      (size.x * sx) / 2 / (halfH * camera.aspect * 0.9),
      (size.y * sx) / 2 / (halfH * 0.72),
    );
    camera.position.set(0, 0, camDist);
    camera.near = Math.max(0.05, camDist * 0.05);
    camera.far = Math.max(40, camDist * 10 + recedeAmp * 2);
    camera.updateProjectionMatrix();
    cacheHero();
  };

  let rx = 0;
  let ry = 0;
  let gz = 0;
  let spread = 0;
  let letterZ = 0;
  let fade = 1;
  let tRx = 0;
  let tRy = 0;
  let tGz = 0;
  let tSpread = 0;
  let tLetterZ = 0;
  let tFade = 1;
  let raf = 0;
  let running = false;
  let gpuEma = 2;
  let gyroOn = false;
  let gyroCalibrated = false;
  let baseBeta = 0;
  let baseGamma = 0;
  const envSpin = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroBox = { left: 0, top: 0, w: 1, h: 1 };

  const cacheHero = () => {
    const r = hero.getBoundingClientRect();
    heroBox.left = r.left;
    heroBox.top = r.top;
    heroBox.w = Math.max(1, r.width);
    heroBox.h = Math.max(1, r.height);
  };

  const readScroll = () => {
    const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * SCROLL_VH)));
    tGz = -recedeAmp * p;
    tSpread = spreadAmp * p;
    tLetterZ = letterZAmp * p;
    tFade = 1 - p;
  };

  const setTilt = (nx: number, ny: number) => {
    tRy = clamp(nx, -1, 1) * TILT_Y;
    tRx = clamp(-ny, -1, 1) * TILT_X;
  };

  const clearTilt = () => {
    tRx = 0;
    tRy = 0;
  };

  const tick = () => {
    if (!running) return;
    const tStart = performance.now();
    rx += (tRx - rx) * LERP;
    ry += (tRy - ry) * LERP;
    gz += (tGz - gz) * LERP;
    spread += (tSpread - spread) * LERP;
    letterZ += (tLetterZ - letterZ) * LERP;
    fade += (tFade - fade) * LERP;
    group.rotation.x = rx;
    group.rotation.y = ry;
    group.position.set(0, 0, gz);
    for (const mesh of letters) {
      const i = mesh.userData.i as number;
      mesh.position.x = mesh.userData.ox + i * spread;
      mesh.position.z = mesh.userData.oz - Math.abs(i) * letterZ;
    }
    if (envSpin) scene.environmentRotation.y = tStart * ENV_SPIN;
    canvas.style.opacity = fade < 0.02 ? "0" : fade.toFixed(3);
    if (fade > 0.015) renderer.render(scene, camera);
    gpuEma = gpuEma * 0.88 + (performance.now() - tStart) * 0.12;
    canvas.dataset.ft = gpuEma.toFixed(2);
    canvas.dataset.rx = rx.toFixed(3);
    canvas.dataset.ry = ry.toFixed(3);
    canvas.dataset.gz = gz.toFixed(3);
    canvas.dataset.spread = spread.toFixed(1);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVis = () => {
    if (document.hidden) stop();
    else start();
  };
  const onScroll = () => {
    readScroll();
    cacheHero();
  };

  const onPointer = (event: PointerEvent) => {
    const nx = ((event.clientX - heroBox.left) / heroBox.w) * 2 - 1;
    const ny = ((event.clientY - heroBox.top) / heroBox.h) * 2 - 1;
    setTilt(nx, ny);
  };

  const onOrient = (event: DeviceOrientationEvent) => {
    if (event.beta == null || event.gamma == null) return;
    if (!gyroCalibrated) {
      baseBeta = event.beta;
      baseGamma = event.gamma;
      gyroCalibrated = true;
    }
    const ny = clamp((event.beta - baseBeta) / GYRO_RANGE, -1, 1);
    const nx = clamp((event.gamma - baseGamma) / GYRO_RANGE, -1, 1);
    setTilt(nx, ny);
  };

  const unbindGyro = () => {
    if (!gyroOn) return;
    gyroOn = false;
    window.removeEventListener("deviceorientation", onOrient);
  };

  const bindGyro = () => {
    if (gyroOn) return;
    gyroOn = true;
    gyroCalibrated = false;
    window.addEventListener("deviceorientation", onOrient, { passive: true });
  };

  const onFirstTap = () => {
    const Ctor = window.DeviceOrientationEvent as DOE | undefined;
    const request = Ctor?.requestPermission;
    if (typeof request !== "function") return;
    void request
      .call(Ctor)
      .then((state) => {
        if (state === "granted") bindGyro();
      })
      .catch(() => {});
  };

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer) {
    hero.addEventListener("pointerenter", cacheHero, { passive: true });
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerleave", clearTilt, { passive: true });
  } else if (typeof window.DeviceOrientationEvent !== "undefined") {
    const Ctor = window.DeviceOrientationEvent as DOE;
    if (typeof Ctor.requestPermission === "function") {
      window.addEventListener("touchend", onFirstTap, { capture: true, passive: true, once: true });
    } else {
      bindGyro();
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden) start();
    else {
      stop();
      clearTilt();
    }
  });
  const ro = new ResizeObserver(() => fitCamera());

  fitCamera();
  readScroll();
  renderer.compile(scene, camera);
  const word = slot.querySelector(".caviar-word");
  if (word instanceof HTMLElement) word.style.opacity = "0";
  io.observe(hero);
  ro.observe(slot);
  ro.observe(canvas);
  requestAnimationFrame(() => requestAnimationFrame(fitCamera));
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", fitCamera, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  start();

  return () => {
    stop();
    canvas.style.removeProperty("opacity");
    if (word instanceof HTMLElement) word.style.removeProperty("opacity");
    delete canvas.dataset.ft;
    delete canvas.dataset.rx;
    delete canvas.dataset.ry;
    delete canvas.dataset.gz;
    delete canvas.dataset.spread;
    io.disconnect();
    ro.disconnect();
    unbindGyro();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", fitCamera);
    window.removeEventListener("touchend", onFirstTap, true);
    document.removeEventListener("visibilitychange", onVis);
    hero.removeEventListener("pointerenter", cacheHero);
    hero.removeEventListener("pointermove", onPointer);
    hero.removeEventListener("pointerleave", clearTilt);
    for (const geo of geos) geo.dispose();
    material.dispose();
    envTex.dispose();
    renderer.dispose();
  };
}

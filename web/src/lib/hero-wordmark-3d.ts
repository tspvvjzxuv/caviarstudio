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
  MeshBasicMaterial,
  MeshPhysicalMaterial,
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
  bevelSegments: 5,
  curveSegments: 12,
  steps: 1,
} as const;

function makeStudioEnv() {
  const studio = new Scene();
  const geos: Array<BoxGeometry | PlaneGeometry> = [];
  const mats: MeshBasicMaterial[] = [];

  const paint = (color: number, extra?: ConstructorParameters<typeof MeshBasicMaterial>[0]) => {
    const mat = new MeshBasicMaterial({ color, ...extra });
    mats.push(mat);
    return mat;
  };
  const panel = (
    w: number,
    h: number,
    color: number,
    pos: readonly [number, number, number],
    rot: readonly [number, number, number],
  ) => {
    const geo = new PlaneGeometry(w, h);
    geos.push(geo);
    const mesh = new Mesh(geo, paint(color));
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    studio.add(mesh);
  };

  const room = new BoxGeometry(30, 20, 30);
  geos.push(room);
  studio.add(new Mesh(room, paint(0x2a303a, { side: BackSide })));
  panel(16, 2.3, 0xffffff, [0, 8.6, -0.4], [Math.PI / 2, 0, 0]);
  panel(16, 1.15, 0xf4f6fa, [0, 8.6, 4.4], [Math.PI / 2, 0, 0]);
  panel(0.95, 13, 0xffffff, [11.2, 1.2, 2.6], [0, -0.52, 0]);
  panel(8, 11, 0xffffff, [14, 1.6, 0], [0, -Math.PI / 2, 0]);
  panel(8, 8, 0xc5d8ff, [-14, 2.1, 0.8], [0, Math.PI / 2, 0]);
  panel(1.15, 9, 0xffe4c2, [-5.4, 0.8, 13], [0, Math.PI, 0.08]);
  panel(16, 7, 0xe9edf4, [0, 3.2, -14], [0, 0, 0]);
  panel(20, 14, 0x7a8494, [0, -9.2, 0], [-Math.PI / 2, 0, 0]);

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

  const mobile = window.matchMedia("(max-width: 767px)").matches;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 3 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = false;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, 8);

  const pmrem = new PMREMGenerator(renderer);
  const { studio, dispose: disposeStudio } = makeStudioEnv();
  const envTex = pmrem.fromScene(studio, 0, 0.1, 100, { size: 256 }).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 1.22;
  disposeStudio();
  pmrem.dispose();

  scene.add(new HemisphereLight(0xf2f4f8, 0x12151c, 0.16));
  const key = new DirectionalLight(0xffffff, 0.78);
  key.position.set(2.6, 3.8, 4.4);
  key.castShadow = false;
  scene.add(key);
  const bevelSpec = new DirectionalLight(0xffffff, 1.05);
  bevelSpec.position.set(-1.1, 5.2, 2.4);
  bevelSpec.castShadow = false;
  scene.add(bevelSpec);
  const rim = new DirectionalLight(0x9ec1ff, 0.28);
  rim.position.set(-3.4, 1.2, 1.4);
  rim.castShadow = false;
  scene.add(rim);

  const material = new MeshPhysicalMaterial({
    color: new Color("#d5dae2"),
    metalness: 1,
    roughness: 0.035,
    envMapIntensity: 1.95,
    clearcoat: 1,
    clearcoatRoughness: 0.035,
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

  const spreadAmp = wordW * (mobile ? 0.1 : 0.08);
  const letterZAmp = wordW * (mobile ? 0.08 : 0.055);
  const recedeAmp = mobile ? 12.6 : 7.2;
  let viewW = 0;
  let viewH = 0;
  let viewportW = window.innerWidth;
  let viewportH = window.innerHeight;
  let lastOp = "";
  let dataN = 0;

  const measureCanvas = () => {
    const box = canvas.getBoundingClientRect();
    const slotBox = slot.getBoundingClientRect();
    const w = Math.max(
      2,
      Math.round(canvas.clientWidth || box.width || slot.clientWidth * 1.18 || slotBox.width),
    );
    const h = Math.max(
      2,
      Math.round(canvas.clientHeight || box.height || slot.clientHeight * 1.5 || slotBox.height * 1.5),
    );
    return { w, h };
  };

  const fitCamera = (force = false) => {
    const { w, h } = measureCanvas();
    if (!force && w === viewW && h === viewH) return;
    // Skip tiny iOS URL-bar jitter after the first real size, not the initial layout.
    if (!force && mobile && w === viewW && viewH > 8 && Math.abs(h - viewH) < 48) return;
    viewW = w;
    viewH = h;
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
  let gyroAsking = false;
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
    const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, viewportH * SCROLL_VH)));
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
    const op = fade < 0.02 ? "0" : fade > 0.97 ? "1" : fade.toFixed(2);
    if (op !== lastOp) {
      lastOp = op;
      if (op === "1") canvas.style.removeProperty("opacity");
      else canvas.style.opacity = op;
    }
    if (fade > 0.015) renderer.render(scene, camera);
    gpuEma = gpuEma * 0.88 + (performance.now() - tStart) * 0.12;
    dataN += 1;
    if (!mobile || dataN % 8 === 0) {
      canvas.dataset.ft = gpuEma.toFixed(2);
      canvas.dataset.rx = rx.toFixed(3);
      canvas.dataset.ry = ry.toFixed(3);
      canvas.dataset.gz = gz.toFixed(3);
      canvas.dataset.spread = spread.toFixed(1);
    }
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
  };

  const heroOnscreen = () => {
    const r = hero.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && r.bottom > 40 && r.top < (window.innerHeight || 1) - 8;
  };

  const onWinResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const widthChanged = w !== viewportW;
    viewportH = h;
    if (!widthChanged && !mobile) return;
    if (!widthChanged) {
      cacheHero();
      return;
    }
    viewportW = w;
    fitCamera();
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
    window.removeEventListener("deviceorientationabsolute" as "deviceorientation", onOrient);
  };

  const bindGyro = () => {
    if (gyroOn) return;
    gyroOn = true;
    gyroCalibrated = false;
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    window.addEventListener("deviceorientationabsolute" as "deviceorientation", onOrient, { passive: true });
  };

  const dropGyroArm = () => {
    window.removeEventListener("pointerdown", onFirstTap, true);
    window.removeEventListener("touchend", onFirstTap, true);
  };

  const onFirstTap = () => {
    const Ctor = window.DeviceOrientationEvent as DOE | undefined;
    const request = Ctor?.requestPermission;
    if (typeof request !== "function") {
      bindGyro();
      dropGyroArm();
      return;
    }
    if (gyroOn || gyroAsking) return;
    gyroAsking = true;
    void request
      .call(Ctor)
      .then((state) => {
        gyroAsking = false;
        if (state === "granted") {
          bindGyro();
          dropGyroArm();
        }
      })
      .catch(() => {
        gyroAsking = false;
      });
  };

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const touchy = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  if (finePointer) {
    hero.addEventListener("pointerenter", cacheHero, { passive: true });
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerleave", clearTilt, { passive: true });
  }
  if (touchy || !finePointer) {
    if (typeof window.DeviceOrientationEvent !== "undefined") {
      const Ctor = window.DeviceOrientationEvent as DOE;
      if (typeof Ctor.requestPermission === "function") {
        window.addEventListener("pointerdown", onFirstTap, { capture: true, passive: true });
        window.addEventListener("touchend", onFirstTap, { capture: true, passive: true });
      } else {
        bindGyro();
      }
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    if (document.hidden) {
      stop();
      return;
    }
    if (entry.isIntersecting || heroOnscreen()) start();
    else stop();
  });
  const ro = new ResizeObserver(() => {
    fitCamera();
  });

  fitCamera(true);
  cacheHero();
  readScroll();
  renderer.compile(scene, camera);
  const word = slot.querySelector(".caviar-word");
  if (word instanceof HTMLElement) word.style.opacity = "0";
  io.observe(hero);
  ro.observe(slot);
  requestAnimationFrame(() => {
    fitCamera(true);
    requestAnimationFrame(() => {
      fitCamera(true);
      if (!document.hidden && heroOnscreen()) start();
    });
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onWinResize, { passive: true });
  window.visualViewport?.addEventListener("resize", onWinResize, { passive: true });
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
    dropGyroArm();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onWinResize);
    window.visualViewport?.removeEventListener("resize", onWinResize);
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

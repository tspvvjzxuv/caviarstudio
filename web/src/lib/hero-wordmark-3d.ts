import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  SRGBColorSpace,
  Scene,
  ShapePath,
  Vector3,
  WebGLRenderer,
  type Shape,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CAVIAR_LETTERS, CAVIAR_TRACK, type GlyphCmd } from "@/lib/caviar-glyphs";

const LERP = 0.12;
const FOV = 28;
const REST_RX = -0.1;
const REST_RY = 0.14;
const SCROLL_VH = 0.8;
const EXTRUDE = {
  depth: 220,
  bevelEnabled: true,
  bevelThickness: 28,
  bevelSize: 16,
  bevelOffset: 0,
  bevelSegments: 2,
  curveSegments: 5,
  steps: 1,
} as const;

type LetterData = { ox: number; oy: number; oz: number; i: number };

type LetterMesh = Mesh<ExtrudeGeometry, MeshPhysicalMaterial>;

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

export function mountHeroWordmark(canvas: HTMLCanvasElement): () => void {
  const slot = canvas.parentElement;
  if (!slot) return () => {};

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
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
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = false;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0.08, 8);

  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 1.05;
  room.dispose();
  pmrem.dispose();

  scene.add(new HemisphereLight(0xf4f5f7, 0x12141a, 0.28));
  const key = new DirectionalLight(0xffffff, 1.15);
  key.position.set(2.4, 3.2, 4.2);
  key.castShadow = false;
  scene.add(key);
  const rim = new DirectionalLight(0x9ec1ff, 0.35);
  rim.position.set(-3.2, 1.4, 1.6);
  rim.castShadow = false;
  scene.add(rim);

  const material = new MeshPhysicalMaterial({
    color: new Color("#c5cad3"),
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.4,
    clearcoat: 0.82,
    clearcoatRoughness: 0.16,
    ior: 1.5,
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

  const spreadAmp = wordW * 0.055;
  const letterZAmp = wordW * 0.028;
  const recedeAmp = 2.8;

  let camDist = 8;
  const fitCamera = () => {
    const w = Math.max(1, canvas.clientWidth);
    const h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const halfH = Math.tan((FOV * Math.PI) / 360);
    const sx = group.scale.x;
    camDist = Math.max(
      ((size.x * sx) / 2) / (halfH * camera.aspect * 0.86),
      ((size.y * sx) / 2) / (halfH * 0.62),
    );
    camera.position.set(0, 0.08, camDist);
    camera.near = Math.max(0.05, camDist * 0.05);
    camera.far = camDist * 8;
    camera.updateProjectionMatrix();
  };

  let rx = REST_RX;
  let ry = REST_RY;
  let gz = 0;
  let spread = 0;
  let letterZ = 0;
  let fade = 1;
  let tRx = REST_RX;
  let tRy = REST_RY;
  let tGz = 0;
  let tSpread = 0;
  let tLetterZ = 0;
  let tFade = 1;
  let raf = 0;
  let running = false;
  let gpuEma = 2;
  const t0 = performance.now();

  const readScroll = () => {
    const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * SCROLL_VH)));
    tGz = -recedeAmp * p;
    tRx = REST_RX + 0.22 * p;
    tRy = REST_RY - 0.38 * p;
    tSpread = spreadAmp * p;
    tLetterZ = letterZAmp * p;
    tFade = 1 - p;
  };

  const tick = () => {
    if (!running) return;
    const tStart = performance.now();
    const t = (tStart - t0) / 1000;
    rx += (tRx + Math.cos(t * 0.37) * 0.028 - rx) * LERP;
    ry += (tRy + Math.sin(t * 0.55) * 0.05 - ry) * LERP;
    gz += (tGz + Math.sin(t * 0.7) * 0.06 - gz) * LERP;
    spread += (tSpread - spread) * LERP;
    letterZ += (tLetterZ - letterZ) * LERP;
    fade += (tFade - fade) * LERP;
    group.rotation.x = rx;
    group.rotation.y = ry;
    group.position.z = gz;
    for (const mesh of letters) {
      const i = mesh.userData.i;
      mesh.position.x = mesh.userData.ox + i * spread;
      mesh.position.z = mesh.userData.oz + i * letterZ * 0.85 + i * i * letterZ * 0.12;
    }
    canvas.style.opacity = fade < 0.02 ? "0" : fade.toFixed(3);
    if (fade > 0.015) renderer.render(scene, camera);
    gpuEma = gpuEma * 0.88 + (performance.now() - tStart) * 0.12;
    canvas.dataset.ft = gpuEma.toFixed(2);
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

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden) start();
    else stop();
  });
  const ro = new ResizeObserver(() => fitCamera());

  fitCamera();
  readScroll();
  renderer.compile(scene, camera);
  slot.classList.add("is-3d");
  io.observe(slot);
  ro.observe(slot);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", fitCamera, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  start();

  return () => {
    stop();
    slot.classList.remove("is-3d");
    canvas.style.removeProperty("opacity");
    delete canvas.dataset.ft;
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", fitCamera);
    document.removeEventListener("visibilitychange", onVis);
    for (const geo of geos) geo.dispose();
    material.dispose();
    envTex.dispose();
    renderer.dispose();
  };
}

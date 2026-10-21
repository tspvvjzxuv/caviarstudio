import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
import {
  PLAYGROUND_PARAMS,
  generateRoundedRectPoissonMask,
  playgroundFragment,
  playgroundVertex,
} from "@/lib/liquid-metal-playground";

const MAX_CARDS = 5;
const CLIP_INSET_PX = 1.25;

function saveDataOn() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

function fallback(sec: HTMLElement | null) {
  sec?.classList.remove("has-metal");
  sec?.classList.add("is-metal-fallback");
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const x2 = x + w;
  const y2 = y + h;
  return [
    `M${x + rr} ${y}`,
    `H${x2 - rr}`,
    `A${rr} ${rr} 0 0 1 ${x2} ${y + rr}`,
    `V${y2 - rr}`,
    `A${rr} ${rr} 0 0 1 ${x2 - rr} ${y2}`,
    `H${x + rr}`,
    `A${rr} ${rr} 0 0 1 ${x} ${y2 - rr}`,
    `V${y + rr}`,
    `A${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

function applyCardClip(
  canvas: HTMLCanvasElement,
  cards: { x: number; y: number; w: number; h: number; open: boolean }[],
  radius: number,
  sectionW: number,
  sectionH: number,
  inset: number,
) {
  const closed = cards.filter((c) => !c.open && c.w > 2 && c.h > 2);
  const r = Math.max(0, radius - inset);
  const paths = closed.map((c) => {
    const x = c.x + inset;
    const y = c.y + inset;
    const w = Math.max(0, c.w - inset * 2);
    const h = Math.max(0, c.h - inset * 2);
    return roundedRectPath(x, y, w, h, r);
  });
  const d = paths.join(" ") || "M0 0";
  canvas.style.clipPath = `path('${d}')`;
  canvas.style.setProperty("-webkit-clip-path", `path('${d}')`);

  const rects = closed
    .map((c) => {
      const x = (c.x + inset).toFixed(2);
      const y = (c.y + inset).toFixed(2);
      const w = Math.max(0, c.w - inset * 2).toFixed(2);
      const h = Math.max(0, c.h - inset * 2).toFixed(2);
      const rr = Math.max(0, Math.min(r, (c.w - inset * 2) / 2, (c.h - inset * 2) / 2)).toFixed(2);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}" ry="${rr}" fill="#fff"/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sectionW}" height="${sectionH}" viewBox="0 0 ${sectionW} ${sectionH}">${rects}</svg>`;
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  canvas.style.webkitMaskImage = url;
  canvas.style.maskImage = url;
}

export function mountServiceMetal(canvas: HTMLCanvasElement): () => void {
  const sec = canvas.closest(".service-sec") as HTMLElement | null;
  if (saveDataOn() || !sec) {
    fallback(sec);
    return () => {};
  }

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    fallback(sec);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5));

  const rects = Array.from({ length: MAX_CARDS }, () => new Vector4(-4000, -4000, 0, 0));
  const open = [0, 0, 0, 0, 0];
  const field = new Vector4(0, 0, 1, 1);

  const mask = generateRoundedRectPoissonMask(64, 32, 8);
  const texture = new DataTexture(mask.data, mask.width, mask.height, RGBAFormat, UnsignedByteType);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.flipY = false;
  texture.needsUpdate = true;

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    premultipliedAlpha: true,
    uniforms: {
      u_mask: { value: texture },
      u_mask_next: { value: texture },
      u_transition: { value: 1 },
      u_time: { value: 0 },
      u_refraction: { value: PLAYGROUND_PARAMS.refraction },
      u_edge: { value: PLAYGROUND_PARAMS.edge },
      u_patternBlur: { value: PLAYGROUND_PARAMS.patternBlur },
      u_liquid: { value: PLAYGROUND_PARAMS.liquid },
      u_speed: { value: PLAYGROUND_PARAMS.speed },
      u_patternScale: { value: PLAYGROUND_PARAMS.patternScale },
      u_resolution: { value: new Vector2(1, 1) },
      u_angle: { value: (PLAYGROUND_PARAMS.angleDeg * Math.PI) / 180 },
      u_mouse: { value: new Vector2(-4000, -4000) },
      uMouseAmt: { value: 0 },
      uRect: { value: rects },
      uOpen: { value: open },
      uRadius: { value: 24 },
      uPad: { value: CLIP_INSET_PX },
      uField: { value: field },
    },
    vertexShader: playgroundVertex,
    fragmentShader: playgroundFragment,
  });
  scene.add(new Mesh(geometry, material));

  const startedAt = performance.now();
  let raf = 0;
  let running = false;
  let skip = 0;
  const mouseTarget = new Vector2(-4000, -4000);
  const mouseSmooth = new Vector2(-4000, -4000);
  let mouseAmt = 0;
  let mouseAmtTarget = 0;
  const mouseFollow = mobile ? 0.03 : 0.045;
  const mouseFade = 0.028;
  let lastClipKey = "";

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth || sec.clientWidth);
    const h = Math.max(1, canvas.clientHeight || sec.clientHeight);
    renderer.setSize(w, h, false);
    material.uniforms.u_resolution.value.set(w, h);
    syncCards();
  };

  const syncCards = () => {
    const root = canvas.getBoundingClientRect();
    const dpr = renderer.getPixelRatio();
    const buttons = sec.querySelectorAll<HTMLButtonElement>("button.service-chrome");
    const cssW = Math.max(1, root.width);
    const cssH = Math.max(1, root.height);
    const sample = buttons[0];
    const styles = sample ? getComputedStyle(sample) : null;
    const cssRadius = styles ? Number.parseFloat(styles.borderRadius) || 24 : 24;
    const borderW = styles ? Number.parseFloat(styles.borderTopWidth) || 1 : 1;
    const inset = Math.max(CLIP_INSET_PX, borderW);
    material.uniforms.uRadius.value = cssRadius * dpr;
    material.uniforms.uPad.value = inset * dpr;

    const cssCards: { x: number; y: number; w: number; h: number; open: boolean }[] = [];
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < MAX_CARDS; i++) {
      const btn = buttons[i];
      if (!btn) {
        rects[i].set(-4000, -4000, 0, 0);
        open[i] = 1;
        continue;
      }
      const box = btn.getBoundingClientRect();
      const x = box.left - root.left;
      const yCss = box.top - root.top;
      const isOpen = btn.getAttribute("aria-expanded") === "true" || btn.classList.contains("is-open");
      rects[i].set(x * dpr, (cssH - yCss - box.height) * dpr, box.width * dpr, box.height * dpr);
      open[i] = isOpen ? 1 : 0;
      cssCards.push({ x, y: yCss, w: box.width, h: box.height, open: isOpen });
      if (!isOpen && box.width > 2 && box.height > 2) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, yCss);
        maxX = Math.max(maxX, x + box.width);
        maxY = Math.max(maxY, yCss + box.height);
      }
    }
    if (Number.isFinite(minX) && maxX > minX && maxY > minY) {
      field.set(minX * dpr, (cssH - maxY) * dpr, (maxX - minX) * dpr, (maxY - minY) * dpr);
    }

    const clipKey = `${cssW.toFixed(2)}x${cssH.toFixed(2)}:${cssRadius}:${inset}:${cssCards
      .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)},${c.w.toFixed(1)},${c.h.toFixed(1)},${c.open ? 1 : 0}`)
      .join("|")}`;
    if (clipKey !== lastClipKey) {
      lastClipKey = clipKey;
      applyCardClip(canvas, cssCards, cssRadius, cssW, cssH, inset);
    }
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
    if (mobile) {
      skip = 1 - skip;
      if (skip === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
    }
    material.uniforms.u_time.value = (performance.now() - startedAt) / 1000;
    const dpr = renderer.getPixelRatio();
    const h = Math.max(1, canvas.getBoundingClientRect().height);
    mouseSmooth.lerp(mouseTarget, mouseFollow);
    mouseAmt += (mouseAmtTarget - mouseAmt) * (mouseAmtTarget > mouseAmt ? mouseFollow : mouseFade);
    material.uniforms.u_mouse.value.set(mouseSmooth.x * dpr, (h - mouseSmooth.y) * dpr);
    material.uniforms.uMouseAmt.value = mouseAmt;
    syncCards();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };

  const onVis = () => {
    if (document.hidden || sec.classList.contains("is-paused")) stop();
    else start();
  };

  const onPointer = (event: PointerEvent) => {
    const root = canvas.getBoundingClientRect();
    const x = event.clientX - root.left;
    const y = event.clientY - root.top;
    if (mouseAmt < 0.02) mouseSmooth.set(x, y);
    mouseTarget.set(x, y);
    mouseAmtTarget = 1;
  };

  const onPointerLeave = () => {
    mouseAmtTarget = 0;
  };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden && !sec.classList.contains("is-paused")) start();
    else stop();
  });

  const ro = new ResizeObserver(() => resize());
  const mo = new MutationObserver(() => {
    syncCards();
    onVis();
  });

  let shaderOk = true;
  renderer.debug.onShaderError = () => {
    shaderOk = false;
  };
  resize();
  renderer.compile(scene, camera);
  if (!shaderOk) {
    fallback(sec);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
    return () => {};
  }

  sec.classList.add("has-metal");
  io.observe(sec);
  ro.observe(sec);
  mo.observe(sec, { attributes: true, attributeFilter: ["class", "aria-expanded"], subtree: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  sec.addEventListener("pointermove", onPointer, { passive: true });
  sec.addEventListener("pointerdown", onPointer, { passive: true });
  sec.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    stop();
    sec.classList.remove("has-metal");
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVis);
    sec.removeEventListener("pointermove", onPointer);
    sec.removeEventListener("pointerdown", onPointer);
    sec.removeEventListener("pointerleave", onPointerLeave);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}

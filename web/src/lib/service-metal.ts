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
  metalCycleAt,
  playgroundFragment,
  playgroundVertex,
} from "@/lib/liquid-metal-playground";

const MAX_CARDS = 5;

function saveDataOn() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

function fallback(sec: HTMLElement | null) {
  sec?.classList.remove("has-metal");
  sec?.classList.add("is-metal-fallback");
}

function blankTexture() {
  const data = new Uint8Array(16);
  const texture = new DataTexture(data, 4, 4, RGBAFormat, UnsignedByteType);
  texture.flipY = true;
  texture.generateMipmaps = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function setMask(canvas: HTMLCanvasElement, url: string | null) {
  if (!url) {
    canvas.style.removeProperty("mask-image");
    canvas.style.removeProperty("-webkit-mask-image");
    canvas.style.removeProperty("mask-size");
    canvas.style.removeProperty("-webkit-mask-size");
    canvas.style.removeProperty("mask-repeat");
    canvas.style.removeProperty("-webkit-mask-repeat");
    return;
  }
  canvas.style.setProperty("mask-image", url);
  canvas.style.setProperty("-webkit-mask-image", url);
  canvas.style.setProperty("mask-size", "100% 100%");
  canvas.style.setProperty("-webkit-mask-size", "100% 100%");
  canvas.style.setProperty("mask-repeat", "no-repeat");
  canvas.style.setProperty("-webkit-mask-repeat", "no-repeat");
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
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
  } catch {
    fallback(sec);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const dprCap = mobile ? 0.55 : 0.75;
  const dprMin = mobile ? 0.32 : 0.42;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(pixelRatio);

  const rects = Array.from({ length: MAX_CARDS }, () => new Vector4(-4000, -4000, 0, 0));
  const open = [0, 0, 0, 0, 0];
  const field = new Vector4(0, 0, 1, 1);
  const texture = blankTexture();
  const initialCycle = metalCycleAt(0);

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
      u_angle: { value: initialCycle.angle },
      u_mouse: { value: new Vector2(-4000, -4000) },
      uMouseAmt: { value: 0 },
      uRect: { value: rects },
      uOpen: { value: open },
      uRadius: { value: 24 },
      uField: { value: field },
      uFocus: { value: new Vector2(initialCycle.focusX, initialCycle.focusY) },
      u_flow: { value: initialCycle.flow },
    },
    vertexShader: playgroundVertex,
    fragmentShader: playgroundFragment,
  });
  scene.add(new Mesh(geometry, material));

  const startedAt = performance.now();
  let raf = 0;
  let running = false;
  let cssHeight = 1;
  const mouseTarget = new Vector2(-4000, -4000);
  const mouseSmooth = new Vector2(-4000, -4000);
  let mouseAmt = 0;
  let mouseAmtTarget = 0;
  const mouseFollow = mobile ? 0.03 : 0.045;
  const mouseFade = 0.028;
  let lastMask = "";
  let gpuEma = 2.2;
  let adaptN = 0;
  const fieldBox = { left: 0, top: 0 };
  let boxRaf = 0;

  const cacheFieldBox = () => {
    const root = canvas.getBoundingClientRect();
    fieldBox.left = root.left;
    fieldBox.top = root.top;
  };

  const applyPixelRatio = (next: number) => {
    const clamped = Math.max(dprMin, Math.min(dprCap, next));
    if (Math.abs(clamped - pixelRatio) < 0.03) return;
    pixelRatio = clamped;
    renderer.setPixelRatio(pixelRatio);
    resize();
  };

  const resize = () => {
    const w = Math.max(1, canvas.clientWidth || sec.clientWidth);
    const h = Math.max(1, canvas.clientHeight || sec.clientHeight);
    renderer.setSize(w, h, false);
    material.uniforms.u_resolution.value.set(w, h);
    cacheFieldBox();
    syncCards();
  };

  const syncCards = () => {
    const root = canvas.getBoundingClientRect();
    const dpr = renderer.getPixelRatio();
    const buttons = sec.querySelectorAll<HTMLButtonElement>("button.service-chrome");
    const cssW = Math.max(1, root.width);
    const cssH = Math.max(1, root.height);
    cssHeight = cssH;
    const sample = buttons[0];
    const styles = sample ? getComputedStyle(sample) : null;
    const cssRadius = styles ? Number.parseFloat(styles.borderRadius) || 24 : 24;
    material.uniforms.uRadius.value = cssRadius * dpr;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const maskCards: { x: number; y: number; w: number; h: number; r: number }[] = [];

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
      if (!isOpen && box.width > 2 && box.height > 2) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, yCss);
        maxX = Math.max(maxX, x + box.width);
        maxY = Math.max(maxY, yCss + box.height);
        maskCards.push({ x, y: yCss, w: box.width, h: box.height, r: cssRadius });
      }
    }
    if (Number.isFinite(minX) && maxX > minX && maxY > minY) {
      field.set(minX * dpr, (cssH - maxY) * dpr, (maxX - minX) * dpr, (maxY - minY) * dpr);
    }

    const maskKey = `${cssW.toFixed(2)}x${cssH.toFixed(2)}:${maskCards
      .map((c) => `${c.x.toFixed(2)},${c.y.toFixed(2)},${c.w.toFixed(2)},${c.h.toFixed(2)},${c.r}`)
      .join("|")}`;
    if (maskKey !== lastMask) {
      lastMask = maskKey;
      if (!maskCards.length) {
        setMask(canvas, null);
      } else {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cssW} ${cssH}" preserveAspectRatio="none">${maskCards
          .map(
            (c) =>
              `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.r}" ry="${c.r}" fill="#fff"/>`,
          )
          .join("")}</svg>`;
        setMask(canvas, `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`);
      }
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
    const t0 = performance.now();
    const elapsed = (t0 - startedAt) / 1000;
    const cycle = metalCycleAt(elapsed);
    material.uniforms.u_time.value = elapsed;
    material.uniforms.u_flow.value = cycle.flow;
    material.uniforms.u_angle.value = cycle.angle;
    material.uniforms.uFocus.value.set(cycle.focusX, cycle.focusY);
    const dpr = renderer.getPixelRatio();
    mouseSmooth.lerp(mouseTarget, mouseFollow);
    mouseAmt += (mouseAmtTarget - mouseAmt) * (mouseAmtTarget > mouseAmt ? mouseFollow : mouseFade);
    material.uniforms.u_mouse.value.set(mouseSmooth.x * dpr, (cssHeight - mouseSmooth.y) * dpr);
    material.uniforms.uMouseAmt.value = mouseAmt;
    renderer.render(scene, camera);
    gpuEma = gpuEma * 0.88 + (performance.now() - t0) * 0.12;
    adaptN += 1;
    if (adaptN >= 24) {
      adaptN = 0;
      if (gpuEma > 3) applyPixelRatio(pixelRatio * 0.82);
      else if (gpuEma < 1.55) applyPixelRatio(pixelRatio * 1.1);
    }
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
    if (event.type === "pointerdown") cacheFieldBox();
    const x = event.clientX - fieldBox.left;
    const y = event.clientY - fieldBox.top;
    if (mouseAmt < 0.02) mouseSmooth.set(x, y);
    mouseTarget.set(x, y);
    mouseAmtTarget = 1;
  };

  const onScroll = () => {
    if (boxRaf || mouseAmtTarget <= 0) return;
    boxRaf = requestAnimationFrame(() => {
      boxRaf = 0;
      cacheFieldBox();
    });
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
  mo.observe(sec, {
    attributes: true,
    attributeFilter: ["class", "aria-expanded", "lang"],
    subtree: true,
    childList: true,
  });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  sec.addEventListener("pointermove", onPointer, { passive: true });
  sec.addEventListener("pointerdown", onPointer, { passive: true });
  sec.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    stop();
    sec.classList.remove("has-metal");
    setMask(canvas, null);
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    if (boxRaf) cancelAnimationFrame(boxRaf);
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

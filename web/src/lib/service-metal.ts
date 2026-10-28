import {
  CanvasTexture,
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
import { rafNeedsKick } from "@/lib/hero-motion";
import { anyCardOpen, chromeIsOpen, metalShouldRun, panelTweening } from "@/lib/service-metal-run";

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

// iOS WebKit composites the WebGL canvas on its own layer, so CSS mix-blend-mode on the titles has no backdrop to
// difference against and they render flat. Rasterise the tile ink (titles, icons, rings) into a mask and invert in the shader.
function drawSvg(ctx: CanvasRenderingContext2D, svg: SVGSVGElement, x: number, y: number, w: number, h: number) {
  const vb = svg.viewBox.baseVal;
  const vw = vb && vb.width ? vb.width : 24;
  const vh = vb && vb.height ? vb.height : 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / vw, h / vh);
  ctx.lineWidth = Number.parseFloat(getComputedStyle(svg).strokeWidth) || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const el of svg.querySelectorAll("path,circle,rect,line,polyline,polygon,ellipse")) {
    const a = (n: string) => Number.parseFloat(el.getAttribute(n) || "0");
    let path: Path2D;
    if (el.tagName === "path") path = new Path2D(el.getAttribute("d") || "");
    else {
      path = new Path2D();
      if (el.tagName === "circle") path.arc(a("cx"), a("cy"), a("r"), 0, Math.PI * 2);
      else if (el.tagName === "ellipse") path.ellipse(a("cx"), a("cy"), a("rx"), a("ry"), 0, 0, Math.PI * 2);
      else if (el.tagName === "rect") path.roundRect(a("x"), a("y"), a("width"), a("height"), a("rx") || a("ry"));
      else if (el.tagName === "line") {
        path.moveTo(a("x1"), a("y1"));
        path.lineTo(a("x2"), a("y2"));
      } else {
        const pts = (el.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
        for (let i = 0; i + 1 < pts.length; i += 2) path[i ? "lineTo" : "moveTo"](pts[i], pts[i + 1]);
        if (el.tagName === "polygon") path.closePath();
      }
    }
    ctx.stroke(path);
  }
  ctx.restore();
}

function drawInk(ctx: CanvasRenderingContext2D, sec: HTMLElement, root: DOMRect, sx: number, sy: number) {
  try {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(sx, 0, 0, sy, -root.left * sx, -root.top * sy);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#fff";
    const sel = "button.service-chrome .service-ink";
    for (const ink of sec.querySelectorAll<HTMLElement>(sel)) {
      const chrome = ink.closest<HTMLElement>("button.service-chrome");
      if (chrome && chromeIsOpen(chrome)) continue;
      for (const disc of ink.querySelectorAll<HTMLElement>(".icon-disc")) {
        const b = disc.getBoundingClientRect();
        ctx.lineWidth = Number.parseFloat(getComputedStyle(disc).borderTopWidth) || 1;
        ctx.beginPath();
        ctx.arc(b.left + b.width / 2, b.top + b.height / 2, b.width / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
        const svg = disc.querySelector("svg");
        if (svg) {
          const r = svg.getBoundingClientRect();
          drawSvg(ctx, svg, r.left, r.top, r.width, r.height);
        }
      }
      const title = ink.querySelector<HTMLElement>(".service-title-live");
      if (!title) continue;
      const cs = getComputedStyle(title);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.textBaseline = "alphabetic";
      const ascent = ctx.measureText("Hg").fontBoundingBoxAscent;
      const range = document.createRange();
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent || "";
        for (let i = 0; i < text.length; i++) {
          if (text[i].trim() === "") continue;
          let end = i + 1;
          while (end < text.length && /\p{M}/u.test(text[end])) end += 1;
          range.setStart(node, i);
          range.setEnd(node, end);
          const b = range.getBoundingClientRect();
          ctx.fillText(text.slice(i, end), b.left, b.top + ascent);
          i = end - 1;
        }
      }
    }
  } catch {
    // shortcut: skip a torn layout frame during open/close; next syncCards redraws
  }
}

export function mountServiceMetal(canvas: HTMLCanvasElement): () => void {
  const sec = canvas.closest(".service-sec") as HTMLElement | null;
  if (saveDataOn() || !sec) {
    fallback(sec);
    return () => {};
  }

  const mobile = window.matchMedia("(max-width: 767px)").matches;
  // Tablets share phone retina DPR but sit above the mobile breakpoint — keep HQ there too.
  const tablet = !mobile && window.matchMedia("(max-width: 1280px)").matches;
  const hiRes = mobile || tablet;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
      stencil: false,
      depth: false,
    });
  } catch {
    fallback(sec);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);
  // iOS blanks the FBO when backing store is 0 (floor(css * 0.55)) or DPR < 1.
  const dprCap = hiRes ? 2 : 1.25;
  const dprMin = hiRes ? 1.25 : 0.75;
  let pixelRatio = Math.min(Math.max(dprMin, window.devicePixelRatio || 1), dprCap);
  renderer.setPixelRatio(pixelRatio);

  const rects = Array.from({ length: MAX_CARDS }, () => new Vector4(-4000, -4000, 0, 0));
  const open = [0, 0, 0, 0, 0];
  const field = new Vector4(0, 0, 1, 1);
  const texture = blankTexture();
  const initialCycle = metalCycleAt(0);
  const inkCanvas = document.createElement("canvas");
  const inkCtx = inkCanvas.getContext("2d");
  const inkTexture = new CanvasTexture(inkCanvas);
  inkTexture.generateMipmaps = false;
  inkTexture.minFilter = LinearFilter;
  inkTexture.magFilter = LinearFilter;

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
      uTileH: { value: 160 },
      u_ink: { value: inkTexture },
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
  const mouseFollow = hiRes ? 0.03 : 0.045;
  const mouseFade = 0.028;
  let gpuEma = 2.2;
  let adaptN = 0;
  let viewW = 0;
  let viewH = 0;
  let sizeRaf = 0;
  const fieldBox = { left: 0, top: 0 };
  let boxRaf = 0;

  const cacheFieldBox = () => {
    const root = canvas.getBoundingClientRect();
    fieldBox.left = root.left;
    fieldBox.top = root.top;
  };

  const applyPixelRatio = (next: number) => {
    if (panelTweening(sec)) return;
    const clamped = Math.max(dprMin, Math.min(dprCap, next));
    if (Math.abs(clamped - pixelRatio) < 0.03) return;
    pixelRatio = clamped;
    renderer.setPixelRatio(pixelRatio);
    applySize(true);
  };

  const bufferScale = (cssW: number, cssH: number) => {
    const gl = renderer.getContext();
    const bufW = Math.max(1, gl.drawingBufferWidth || canvas.width);
    const bufH = Math.max(1, gl.drawingBufferHeight || canvas.height);
    return { sx: bufW / Math.max(1, cssW), sy: bufH / Math.max(1, cssH), bufW, bufH };
  };

  const readCssSize = () => {
    const canvasBox = canvas.getBoundingClientRect();
    const secBox = sec.getBoundingClientRect();
    const w = Math.max(
      2,
      Math.round(canvas.clientWidth || canvasBox.width || sec.clientWidth || secBox.width || viewW),
    );
    const h = Math.max(
      2,
      Math.round(canvas.clientHeight || canvasBox.height || sec.clientHeight || secBox.height || viewH),
    );
    return { w, h };
  };

  const applySize = (force = false) => {
    const { w, h } = readCssSize();
    const gl = renderer.getContext();
    const backingBad =
      canvas.width < 2 || canvas.height < 2 || gl.drawingBufferWidth < 2 || gl.drawingBufferHeight < 2;
    const sizeChanged = force || backingBad || w !== viewW || h !== viewH;
    if (sizeChanged) {
      viewW = w;
      viewH = h;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(w, h, false);
      if (canvas.width < 2 || canvas.height < 2) {
        const ratio = Math.max(1, pixelRatio);
        canvas.width = Math.max(2, Math.floor(w * ratio));
        canvas.height = Math.max(2, Math.floor(h * ratio));
        renderer.setViewport(0, 0, canvas.width, canvas.height);
      }
    }
    const { bufW, bufH } = bufferScale(w, h);
    material.uniforms.u_resolution.value.set(bufW, bufH);
    cacheFieldBox();
    syncCards();
    if (sizeChanged && running) renderer.render(scene, camera);
  };

  const phoneOpen = () => mobile && anyCardOpen(sec);

  const shouldRun = () =>
    metalShouldRun({
      hidden: document.hidden,
      onscreen: sectionOnscreen(),
      paused: sec.classList.contains("is-paused"),
      tweening: panelTweening(sec),
      phoneOpen: phoneOpen(),
    });

  const resize = () => {
    if (panelTweening(sec)) return;
    applySize();
  };

  const sectionOnscreen = () => {
    const r = sec.getBoundingClientRect();
    return r.width > 2 && r.height > 2 && r.bottom > -80 && r.top < (window.innerHeight || 0) + 360;
  };

  const requestResize = () => {
    if (sizeRaf) return;
    sizeRaf = requestAnimationFrame(() => {
      sizeRaf = 0;
      resize();
    });
  };

  const onPanelTween = (event: TransitionEvent) => {
    if (event.propertyName !== "grid-template-rows") return;
    if (panelTweening(sec)) {
      stop();
      return;
    }
    applySize();
    if (shouldRun()) start();
    else stop();
  };

  const syncCards = () => {
    if (panelTweening(sec)) return;
    const root = canvas.getBoundingClientRect();
    const buttons = sec.querySelectorAll<HTMLButtonElement>("button.service-chrome");
    const cssW = Math.max(1, root.width);
    const cssH = Math.max(1, root.height);
    cssHeight = cssH;
    const { sx, sy } = bufferScale(cssW, cssH);
    const sample = buttons[0];
    const styles = sample ? getComputedStyle(sample) : null;
    const cssRadius = styles ? Number.parseFloat(styles.borderRadius) || 24 : 24;
    material.uniforms.uRadius.value = cssRadius * Math.min(sx, sy);

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let tileH = 0;
    let tileN = 0;

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
      rects[i].set(x * sx, (cssH - yCss - box.height) * sy, box.width * sx, box.height * sy);
      open[i] = chromeIsOpen(btn) ? 1 : 0;
      if (box.width > 2 && box.height > 2) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, yCss);
        maxX = Math.max(maxX, x + box.width);
        maxY = Math.max(maxY, yCss + box.height);
        tileH += box.height * sy;
        tileN += 1;
      }
    }
    if (Number.isFinite(minX) && maxX > minX && maxY > minY) {
      field.set(minX * sx, (cssH - maxY) * sy, (maxX - minX) * sx, (maxY - minY) * sy);
    }
    material.uniforms.uTileH.value = tileN ? tileH / tileN : Math.max(field.w * 0.4, 1);
    if (inkCtx) {
      const { bufW, bufH } = bufferScale(cssW, cssH);
      if (inkCanvas.width !== bufW || inkCanvas.height !== bufH) {
        inkCanvas.width = bufW;
        inkCanvas.height = bufH;
      }
      inkCtx.imageSmoothingEnabled = true;
      inkCtx.imageSmoothingQuality = "high";
      drawInk(inkCtx, sec, root, sx, sy);
      inkTexture.needsUpdate = true;
      if (!sec.classList.contains("ink-gl")) sec.classList.add("ink-gl");
      if (running) renderer.render(scene, camera);
    }
  };

  const stop = () => {
    running = false;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  let cardsReady = false;

  const tick = () => {
    if (!running) return;
    const t0 = performance.now();
    if (!cardsReady || canvas.width < 2 || canvas.height < 2) {
      applySize(true);
      cardsReady = rects.some((box) => box.z > 2);
    }
    const elapsed = (t0 - startedAt) / 1000;
    const cycle = metalCycleAt(elapsed);
    material.uniforms.u_time.value = elapsed;
    material.uniforms.u_flow.value = cycle.flow;
    material.uniforms.u_angle.value = cycle.angle;
    material.uniforms.uFocus.value.set(cycle.focusX, cycle.focusY);
    const { sx, sy } = bufferScale(Math.max(1, canvas.clientWidth || viewW || 1), Math.max(1, cssHeight));
    mouseSmooth.lerp(mouseTarget, mouseFollow);
    mouseAmt += (mouseAmtTarget - mouseAmt) * (mouseAmtTarget > mouseAmt ? mouseFollow : mouseFade);
    material.uniforms.u_mouse.value.set(mouseSmooth.x * sx, (cssHeight - mouseSmooth.y) * sy);
    material.uniforms.uMouseAmt.value = mouseAmt;
    renderer.render(scene, camera);
    gpuEma = gpuEma * 0.88 + (performance.now() - t0) * 0.12;
    adaptN += 1;
    if (adaptN >= 24) {
      adaptN = 0;
      // Never crush tablet/phone resolution — soft metal + muddy ink invert is what looked weak there.
      if (!hiRes) {
        if (gpuEma > 3) applyPixelRatio(pixelRatio * 0.82);
        else if (gpuEma < 1.55) applyPixelRatio(pixelRatio * 1.1);
      }
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!shouldRun()) return;
    if (!rafNeedsKick(running, raf)) return;
    running = true;
    applySize(true);
    raf = requestAnimationFrame(tick);
  };

  const onVis = () => {
    if (shouldRun()) start();
    else stop();
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
    if (entry.isIntersecting && shouldRun()) start();
    else if (!entry.isIntersecting || !shouldRun()) stop();
  });

  const ro = new ResizeObserver(() => {
    if (panelTweening(sec)) {
      stop();
      return;
    }
    requestResize();
    if (shouldRun()) start();
    else stop();
  });
  const mo = new MutationObserver(() => {
    if (panelTweening(sec)) {
      stop();
      return;
    }
    cardsReady = false;
    syncCards();
    if (shouldRun()) start();
    else stop();
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

  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
  };
  const onContextRestored = () => {
    cardsReady = false;
    applySize(true);
    onVis();
  };
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);

  sec.classList.add("has-metal");
  io.observe(sec);
  ro.observe(sec);
  requestAnimationFrame(() => {
    applySize(true);
    requestAnimationFrame(() => {
      applySize(true);
      if (!document.hidden && sectionOnscreen()) start();
    });
  });
  mo.observe(sec, {
    attributes: true,
    attributeFilter: ["class", "aria-expanded", "lang"],
    subtree: true,
    childList: true,
  });
  document.fonts?.ready.then(() => syncCards());
  sec.addEventListener("transitionend", onPanelTween);
  sec.addEventListener("transitioncancel", onPanelTween);
  window.addEventListener("resize", requestResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  sec.addEventListener("pointermove", onPointer, { passive: true });
  sec.addEventListener("pointerdown", onPointer, { passive: true });
  sec.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    stop();
    sec.classList.remove("has-metal", "ink-gl");
    inkTexture.dispose();
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost, false);
    canvas.removeEventListener("webglcontextrestored", onContextRestored, false);
    sec.removeEventListener("transitionend", onPanelTween);
    sec.removeEventListener("transitioncancel", onPanelTween);
    window.removeEventListener("resize", requestResize);
    window.removeEventListener("scroll", onScroll);
    if (boxRaf) cancelAnimationFrame(boxRaf);
    if (sizeRaf) cancelAnimationFrame(sizeRaf);
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

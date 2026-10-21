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
  metalCycleAt,
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
  sec?.classList.remove("has-metal", "has-metal-ink");
  sec?.classList.add("is-metal-fallback");
}

function blankGlyphTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  return { canvas, texture: textureFromCanvas(canvas) };
}

function textureFromCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const width = Math.max(1, canvas.width);
  const height = Math.max(1, canvas.height);
  const pixels = ctx ? ctx.getImageData(0, 0, width, height).data : new Uint8ClampedArray(width * height * 4);
  const texture = new DataTexture(pixels, width, height, RGBAFormat, UnsignedByteType);
  texture.flipY = true;
  texture.generateMipmaps = false;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function svgDataUrl(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("stroke", "#ffffff");
  clone.setAttribute("fill", "none");
  clone.querySelectorAll("[stroke]").forEach((node) => {
    const stroke = node.getAttribute("stroke");
    if (stroke && stroke !== "none") node.setAttribute("stroke", "#ffffff");
  });
  clone.querySelectorAll("[fill]").forEach((node) => {
    const fill = node.getAttribute("fill");
    if (fill && fill !== "none" && fill !== "transparent") node.setAttribute("fill", "#ffffff");
  });
  const box = svg.getBoundingClientRect();
  clone.setAttribute("width", String(Math.max(1, box.width)));
  clone.setAttribute("height", String(Math.max(1, box.height)));
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
}

const glyphImageCache = new Map<string, HTMLImageElement>();

async function imageFromUrl(url: string) {
  const hit = glyphImageCache.get(url);
  if (hit) return hit;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  glyphImageCache.set(url, img);
  return img;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

async function paintCardGlyph(
  canvas: HTMLCanvasElement,
  btn: HTMLButtonElement,
  dpr: number,
  stillCurrent: () => boolean,
) {
  const box = btn.getBoundingClientRect();
  const cssW = Math.max(1, box.width);
  const cssH = Math.max(1, box.height);
  const pxW = Math.max(1, Math.round(cssW * dpr));
  const pxH = Math.max(1, Math.round(cssH * dpr));
  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;
    canvas.height = pxH;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pxW, pxH);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const discs = btn.querySelectorAll<HTMLElement>(".icon-disc");
  const title = btn.querySelector<HTMLElement>(".font-serif");
  const jobs: Promise<void>[] = [];

  discs.forEach((disc) => {
    const rect = disc.getBoundingClientRect();
    const x = rect.left - box.left;
    const y = rect.top - box.top;
    const radius = Math.min(rect.width, rect.height) / 2;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1.1, rect.width * 0.028);
    ctx.beginPath();
    ctx.arc(x + rect.width / 2, y + rect.height / 2, Math.max(1, radius - ctx.lineWidth), 0, Math.PI * 2);
    ctx.stroke();
    const svg = disc.querySelector("svg");
    if (!(svg instanceof SVGSVGElement)) return;
    const icon = svg.getBoundingClientRect();
    jobs.push(
      imageFromUrl(svgDataUrl(svg)).then((img) => {
        if (!stillCurrent()) return;
        ctx.drawImage(img, icon.left - box.left, icon.top - box.top, icon.width, icon.height);
      }),
    );
  });

  if (title) {
    const rect = title.getBoundingClientRect();
    const style = getComputedStyle(title);
    const text = (title.textContent ?? "").replace(/\s+/g, " ").trim();
    ctx.fillStyle = "#ffffff";
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const maxW = Math.max(8, rect.width);
    const lines = wrapLines(ctx, text, maxW);
    const lineHeight = Number.parseFloat(style.lineHeight) || rect.height / Math.max(1, lines.length);
    const startY = rect.top - box.top + (rect.height - lineHeight * (lines.length - 1)) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, rect.left - box.left, startY + i * lineHeight, maxW);
    });
  }

  await Promise.all(jobs);
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

  const glyphs = Array.from({ length: MAX_CARDS }, () => blankGlyphTexture());
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
      uPad: { value: CLIP_INSET_PX },
      uField: { value: field },
      uFocus: { value: new Vector2(initialCycle.focusX, initialCycle.focusY) },
      u_flow: { value: initialCycle.flow },
      uGlyph0: { value: glyphs[0].texture },
      uGlyph1: { value: glyphs[1].texture },
      uGlyph2: { value: glyphs[2].texture },
      uGlyph3: { value: glyphs[3].texture },
      uGlyph4: { value: glyphs[4].texture },
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
  let lastGlyphKey = "";
  let glyphTimer = 0;
  let glyphGen = 0;

  const rasterizeGlyphs = async () => {
    const gen = ++glyphGen;
    const buttons = sec.querySelectorAll<HTMLButtonElement>("button.service-chrome");
    const dpr = renderer.getPixelRatio();
    try {
      await document.fonts.ready;
      await document.fonts.load('400 2.1rem "Bodoni Moda"');
    } catch {
      /* keep going with fallback serif */
    }
    if (gen !== glyphGen) return;
    let painted = 0;
    await Promise.all(
      Array.from({ length: MAX_CARDS }, async (_, i) => {
        const btn = buttons[i];
        if (!btn) {
          const blank = glyphs[i].canvas;
          blank.width = 4;
          blank.height = 4;
          glyphs[i].texture.dispose();
          glyphs[i].texture = textureFromCanvas(blank);
          material.uniforms[`uGlyph${i}`].value = glyphs[i].texture;
          return;
        }
        await paintCardGlyph(glyphs[i].canvas, btn, dpr, () => gen === glyphGen);
        if (gen !== glyphGen) return;
        glyphs[i].texture.dispose();
        glyphs[i].texture = textureFromCanvas(glyphs[i].canvas);
        material.uniforms[`uGlyph${i}`].value = glyphs[i].texture;
        painted += 1;
      }),
    );
    if (gen === glyphGen && painted > 0) sec.classList.add("has-metal-ink");
  };

  const scheduleGlyphs = () => {
    window.clearTimeout(glyphTimer);
    glyphTimer = window.setTimeout(() => {
      void rasterizeGlyphs();
    }, 40);
  };

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

    const glyphKey = `${dpr}:${cssW.toFixed(1)}x${cssH.toFixed(1)}:${Array.from(buttons)
      .map((btn) => {
        const title = btn.querySelector(".font-serif")?.textContent?.trim() ?? "";
        const box = btn.getBoundingClientRect();
        return `${title}:${box.width.toFixed(1)}x${box.height.toFixed(1)}`;
      })
      .join("|")}`;
    if (glyphKey !== lastGlyphKey) {
      lastGlyphKey = glyphKey;
      scheduleGlyphs();
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
    const elapsed = (performance.now() - startedAt) / 1000;
    const cycle = metalCycleAt(elapsed);
    material.uniforms.u_time.value = elapsed;
    material.uniforms.u_flow.value = cycle.flow;
    material.uniforms.u_angle.value = cycle.angle;
    material.uniforms.uFocus.value.set(cycle.focusX, cycle.focusY);
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
    glyphs.forEach(({ texture: glyph }) => glyph.dispose());
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
    characterData: true,
  });
  const onFonts = () => scheduleGlyphs();
  document.fonts.addEventListener("loadingdone", onFonts);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  sec.addEventListener("pointermove", onPointer, { passive: true });
  sec.addEventListener("pointerdown", onPointer, { passive: true });
  sec.addEventListener("pointerleave", onPointerLeave, { passive: true });

  return () => {
    stop();
    sec.classList.remove("has-metal", "has-metal-ink");
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    document.fonts.removeEventListener("loadingdone", onFonts);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVis);
    sec.removeEventListener("pointermove", onPointer);
    sec.removeEventListener("pointerdown", onPointer);
    sec.removeEventListener("pointerleave", onPointerLeave);
    window.clearTimeout(glyphTimer);
    geometry.dispose();
    material.dispose();
    texture.dispose();
    glyphs.forEach(({ texture: glyph }) => glyph.dispose());
    renderer.dispose();
  };
}

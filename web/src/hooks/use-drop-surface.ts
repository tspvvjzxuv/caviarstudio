import { useEffect, type RefObject } from "react";
import { serviceSeed, startMetal } from "@/lib/liquid-metal";

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const COARSE = "(hover: none), (pointer: coarse)";

function pausedHost(host: HTMLElement) {
  return Boolean(host.closest(".service-sec.is-paused"));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function isOpen(host: HTMLElement) {
  return host.classList.contains("is-open") || host.getAttribute("aria-expanded") === "true";
}

type Ripple = { x: number; y: number; age: number; amp: number };
type Splat = { x: number; y: number; vx: number; vy: number };

export function useDropSurface(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const clip = canvas?.parentElement;
    const host = canvas?.closest(".service-chrome") as HTMLElement | null;
    if (!canvas || !clip || !host) return;

    const fine = window.matchMedia(FINE);
    const reduce = window.matchMedia(REDUCE);
    const coarse = window.matchMedia(COARSE);
    const gpu = reduce.matches ? null : startMetal(canvas);
    const ctx2 = gpu ? null : canvas.getContext("2d", { alpha: true });
    const seed = serviceSeed(host.closest(".service-card")?.getAttribute("data-service") ?? "");

    const mouse = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, hover: 0, thover: 0, open: 0 };
    const ripples: Ripple[] = [
      { x: 0, y: 0, age: 99, amp: 0 },
      { x: 0, y: 0, age: 99, amp: 0 },
    ];
    const splats: Splat[] = [
      { x: 0, y: 0, vx: 0, vy: 0 },
      { x: 0, y: 0, vx: 0, vy: 0 },
    ];
    let nextRipple = 0;
    let nextSplat = 0;
    let lastSpawn = 0;
    let lastSplat = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();
    let idleAt = 0;
    let cssW = 1;
    let cssH = 1;
    let pxW = 1;
    let pxH = 1;
    let aspect = 1;
    let originX = 0;
    let originY = 0;

    const toField = (nx: number, ny: number) => ({ x: nx * aspect, y: ny });

    const size = () => {
      const box = clip.getBoundingClientRect();
      cssW = Math.max(1, Math.round(box.width));
      cssH = Math.max(1, Math.round(box.height));
      const cap = coarse.matches ? 1.25 : 1.5;
      const dpr = Math.min(cap, window.devicePixelRatio || 1);
      pxW = Math.max(1, Math.round(cssW * dpr));
      pxH = Math.max(1, Math.round(cssH * dpr));
      canvas.width = pxW;
      canvas.height = pxH;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      aspect = cssW / Math.max(cssH, 1);
      const hostBox = host.getBoundingClientRect();
      originX = (((hostBox.left + hostBox.width / 2 - box.left) / Math.max(box.width, 1)) * 2 - 1) * aspect;
      originY = 1 - ((hostBox.top + hostBox.height / 2 - box.top) / Math.max(box.height, 1)) * 2;
      if (gpu) gpu.gl.viewport(0, 0, pxW, pxH);
    };

    const local = (event: PointerEvent) => {
      const box = clip.getBoundingClientRect();
      return {
        nx: ((event.clientX - box.left) / Math.max(1, box.width)) * 2 - 1,
        ny: 1 - ((event.clientY - box.top) / Math.max(1, box.height)) * 2,
      };
    };

    const spawnRipple = (nx: number, ny: number, amp: number) => {
      if (reduce.matches || pausedHost(host)) return;
      const slot = ripples[nextRipple++ % ripples.length];
      const p = toField(nx, ny);
      slot.x = p.x;
      slot.y = p.y;
      slot.age = 0;
      slot.amp = amp;
    };

    const spawnSplat = (nx: number, ny: number, vx: number, vy: number) => {
      if (reduce.matches || pausedHost(host)) return;
      const speed = Math.hypot(vx, vy);
      if (speed < 0.05) return;
      const slot = splats[nextSplat++ % splats.length];
      const p = toField(nx, ny);
      slot.x = p.x;
      slot.y = p.y;
      const gain = Math.min(0.4, speed * 0.7);
      slot.vx = vx * gain;
      slot.vy = vy * gain;
    };

    const draw2d = (hover: number) => {
      if (!ctx2) return;
      ctx2.setTransform(pxW / cssW, 0, 0, pxH / cssH, 0, 0);
      ctx2.clearRect(0, 0, cssW, cssH);
      const g = ctx2.createLinearGradient(0, 0, cssW, cssH);
      g.addColorStop(0, "#f2f3f6");
      g.addColorStop(0.18, "#9aa1ab");
      g.addColorStop(0.42, "#1a1c20");
      g.addColorStop(1, "#070708");
      ctx2.fillStyle = g;
      ctx2.beginPath();
      ctx2.ellipse(cssW * 0.5, cssH * 0.5, cssW * 0.48, cssH * 0.42, -0.2, 0, Math.PI * 2);
      ctx2.fill();
      const spec = ctx2.createRadialGradient(cssW * 0.32, cssH * 0.22, 6, cssW * 0.5, cssH * 0.5, cssW * 0.55);
      spec.addColorStop(0, `rgba(255,255,255,${0.5 + 0.2 * hover})`);
      spec.addColorStop(1, "rgba(0,0,0,0)");
      ctx2.globalCompositeOperation = "screen";
      ctx2.fillStyle = spec;
      ctx2.fill();
      ctx2.globalCompositeOperation = "source-over";
    };

    const drawGpu = (time: number) => {
      if (!gpu) return;
      const { gl, prog, buf, loc } = gpu;
      gl.viewport(0, 0, pxW, pxH);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(loc.res, pxW, pxH);
      gl.uniform1f(loc.time, time);
      gl.uniform1f(loc.hover, mouse.hover);
      gl.uniform1f(loc.open, mouse.open);
      gl.uniform1f(loc.seed, seed);
      gl.uniform2f(loc.mouse, mouse.x * aspect, mouse.y);
      gl.uniform2f(loc.vel, mouse.vx, mouse.vy);
      gl.uniform2f(loc.origin, originX, originY);
      gl.uniform4f(loc.r0, ripples[0].x, ripples[0].y, ripples[0].age, ripples[0].amp);
      gl.uniform4f(loc.r1, ripples[1].x, ripples[1].y, ripples[1].age, ripples[1].amp);
      gl.uniform4f(loc.s0, splats[0].x, splats[0].y, splats[0].vx, splats[0].vy);
      gl.uniform4f(loc.s1, splats[1].x, splats[1].y, splats[1].vx, splats[1].vy);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const tick = (now: number) => {
      running = true;
      const dt = Math.min((now - last) / 1000, 0.2);
      last = now;
      if (pausedHost(host) || reduce.matches) {
        running = false;
        return;
      }
      const k = 1 - Math.exp(-4.2 * dt);
      const prevX = mouse.x;
      const prevY = mouse.y;
      mouse.x = mix(mouse.x, mouse.tx, k);
      mouse.y = mix(mouse.y, mouse.ty, k);
      mouse.vx = mix(mouse.vx, (mouse.x - prevX) / Math.max(dt, 0.001), 0.35);
      mouse.vy = mix(mouse.vy, (mouse.y - prevY) / Math.max(dt, 0.001), 0.35);
      mouse.hover = mix(mouse.hover, mouse.thover, k);
      mouse.open = mix(mouse.open, isOpen(host) ? 1 : 0, k);
      host.style.setProperty("--drop-x", mouse.x.toFixed(3));
      host.style.setProperty("--drop-y", (-mouse.y).toFixed(3));
      for (const r of ripples) r.age += dt;
      for (const s of splats) {
        s.vx *= Math.exp(-dt * 1.8);
        s.vy *= Math.exp(-dt * 1.8);
      }
      const time = now * 0.001;
      if (gpu) drawGpu(time);
      else draw2d(mouse.hover);

      const busy =
        mouse.thover > 0.01 ||
        mouse.hover > 0.02 ||
        Math.abs(mouse.open - (isOpen(host) ? 1 : 0)) > 0.01 ||
        ripples.some((r) => r.age < 2.6 && r.amp > 0) ||
        splats.some((s) => Math.hypot(s.vx, s.vy) > 0.008);
      if (busy) idleAt = now;
      const keepIdle = Boolean(gpu && now - idleAt < (coarse.matches ? 2400 : 9000));
      if (busy || keepIdle) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const kick = () => {
      if (running || reduce.matches) return;
      last = performance.now();
      idleAt = last;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches || reduce.matches) return;
      const p = local(event);
      mouse.tx = Math.max(-1, Math.min(1, p.nx));
      mouse.ty = Math.max(-1, Math.min(1, p.ny));
      mouse.thover = 1;
      const now = performance.now();
      if (now - lastSplat > 32) {
        lastSplat = now;
        spawnSplat(mouse.tx, mouse.ty, mouse.vx, mouse.vy);
      }
      if (now - lastSpawn > 90) {
        lastSpawn = now;
        spawnRipple(mouse.tx, mouse.ty, 0.45);
      }
      kick();
    };

    const onDown = (event: PointerEvent) => {
      if (reduce.matches) return;
      const p = local(event);
      mouse.tx = Math.max(-1, Math.min(1, p.nx));
      mouse.ty = Math.max(-1, Math.min(1, p.ny));
      mouse.thover = 1;
      spawnRipple(mouse.tx, mouse.ty, 1);
      spawnSplat(mouse.tx, mouse.ty, mouse.vx * 1.2, mouse.vy * 1.2);
      kick();
    };

    const onLeave = () => {
      mouse.thover = 0;
      mouse.tx = 0;
      mouse.ty = 0;
      kick();
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(clip);
    const sec = host.closest(".service-sec");
    const mo = new MutationObserver(() => {
      if (!pausedHost(host)) kick();
    });
    if (sec) mo.observe(sec, { attributes: true, attributeFilter: ["class"] });
    mo.observe(host, { attributes: true, attributeFilter: ["class", "aria-expanded"] });
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onLeave);
    if (gpu && !reduce.matches) kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      host.style.removeProperty("--drop-x");
      host.style.removeProperty("--drop-y");
      if (gpu) gpu.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [canvasRef]);
}

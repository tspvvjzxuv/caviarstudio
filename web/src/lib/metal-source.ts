/** Dark gallium plate used as the MeltGL source (transparent outside). */

export function makeMetalSource(width: number, height: number, seed: number): Promise<HTMLImageElement> {
  const w = Math.max(160, Math.round(width));
  const h = Math.max(96, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no 2d"));

  const padX = Math.max(2, w * 0.012);
  const padY = Math.max(2, h * 0.02);
  const rw = w - padX * 2;
  const rh = h - padY * 2;
  const rad = Math.min(22, Math.min(rw, rh) * 0.18);
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.roundRect(padX, padY, rw, rh, rad);

  const fill = ctx.createLinearGradient(padX, padY, padX + rw, padY + rh);
  fill.addColorStop(0, "#9aa1ab");
  fill.addColorStop(0.18, "#5c616a");
  fill.addColorStop(0.42, "#2a2e34");
  fill.addColorStop(0.72, "#15181c");
  fill.addColorStop(1, "#0b0c0e");
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  ctx.clip();

  const spec = ctx.createRadialGradient(
    padX + rw * (0.22 + seed * 0.1),
    padY + rh * 0.16,
    2,
    padX + rw * 0.42,
    padY + rh * 0.5,
    Math.max(rw, rh) * 0.82,
  );
  spec.addColorStop(0, "rgba(244,246,250,0.72)");
  spec.addColorStop(0.14, "rgba(186,193,204,0.28)");
  spec.addColorStop(0.4, "rgba(61,138,255,0.06)");
  spec.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(padX, padY, rw, rh);

  const rim = ctx.createLinearGradient(padX, padY, padX, padY + rh);
  rim.addColorStop(0, "rgba(240,243,247,0.42)");
  rim.addColorStop(0.16, "rgba(240,243,247,0)");
  rim.addColorStop(0.8, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = rim;
  ctx.fillRect(padX, padY, rw, rh);

  ctx.restore();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("metal source"));
    img.src = canvas.toDataURL("image/png");
  });
}

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
  fill.addColorStop(0, "#4a4e56");
  fill.addColorStop(0.22, "#24272d");
  fill.addColorStop(0.55, "#121418");
  fill.addColorStop(1, "#08090b");
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  ctx.clip();

  const spec = ctx.createRadialGradient(
    padX + rw * (0.22 + seed * 0.1),
    padY + rh * 0.18,
    2,
    padX + rw * 0.4,
    padY + rh * 0.48,
    Math.max(rw, rh) * 0.78,
  );
  spec.addColorStop(0, "rgba(236,239,244,0.38)");
  spec.addColorStop(0.16, "rgba(160,168,180,0.16)");
  spec.addColorStop(0.42, "rgba(61,138,255,0.05)");
  spec.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(padX, padY, rw, rh);

  const rim = ctx.createLinearGradient(padX, padY, padX, padY + rh);
  rim.addColorStop(0, "rgba(230,234,240,0.28)");
  rim.addColorStop(0.18, "rgba(230,234,240,0)");
  rim.addColorStop(0.82, "rgba(0,0,0,0)");
  rim.addColorStop(1, "rgba(0,0,0,0.45)");
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

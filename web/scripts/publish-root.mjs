import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(webDir, "..");
const dist = resolve(webDir, "dist");

if (!existsSync(resolve(dist, "index.html"))) {
  throw new Error("dist/index.html missing — run npm run build first");
}

cpSync(resolve(dist, "index.html"), resolve(root, "index.html"));

const assetsSrc = resolve(dist, "assets");
const assetsDest = resolve(root, "assets");
if (existsSync(assetsDest)) rmSync(assetsDest, { recursive: true, force: true });
if (existsSync(assetsSrc)) cpSync(assetsSrc, assetsDest, { recursive: true });

writeFileSync(resolve(root, ".nojekyll"), "");

for (const name of readdirSync(dist)) {
  if (name === "index.html" || name === "assets") continue;
  const from = resolve(dist, name);
  const to = resolve(root, name);
  cpSync(from, to, { recursive: true });
}

for (const folder of ["img", "media"]) {
  const dest = resolve(root, folder);
  rmSync(dest, { recursive: true, force: true });
  const src = resolve(dist, folder);
  if (existsSync(src)) cpSync(src, dest, { recursive: true });
  else mkdirSync(dest, { recursive: true });
}
console.log("published dist to repo root (GitHub Pages branch fallback)");

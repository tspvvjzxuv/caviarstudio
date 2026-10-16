import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(webDir, "..");
const pub = resolve(webDir, "public");
mkdirSync(pub, { recursive: true });

const files = ["CNAME", "robots.txt", "sitemap.xml", "icon.svg", "apple-touch-icon.png"];
for (const file of files) {
  cpSync(resolve(root, file), resolve(pub, file));
}
writeFileSync(resolve(pub, ".nojekyll"), "");
for (const folder of ["img", "media"]) {
  rmSync(resolve(pub, folder), { recursive: true, force: true });
  cpSync(resolve(root, folder), resolve(pub, folder), { recursive: true });
}
console.log("synced public assets");

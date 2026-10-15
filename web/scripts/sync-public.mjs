import { cpSync, mkdirSync, writeFileSync } from "node:fs";
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
cpSync(resolve(root, "img"), resolve(pub, "img"), { recursive: true });
cpSync(resolve(root, "media"), resolve(pub, "media"), { recursive: true });
console.log("synced public assets");

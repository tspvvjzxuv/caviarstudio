import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const src = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(src, "../index.css"), "utf8");
const header = readFileSync(join(src, "../components/site-header.tsx"), "utf8");
const sections = readFileSync(join(src, "../components/sections.tsx"), "utf8");
const metal = readFileSync(join(src, "./service-metal.ts"), "utf8");
const panel = readFileSync(join(src, "../components/service-panel.tsx"), "utf8");

function rule(cssText: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cssText.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  return match?.[1] ?? "";
}

describe("Čo robíme heading", () => {
  it("keeps .section-title as real CSS glyphs, not a Safari text-fill bitmap", () => {
    const body = rule(css, ".section-title");
    assert.ok(body, "missing .section-title");
    assert.match(body, /font-family:\s*var\(--font-sans\)/);
    assert.doesNotMatch(
      body,
      /-webkit-text-fill-color/,
      "fill-color rasterizes large glyphs (g) on iPhone even with background:none",
    );
  });

  it("keeps the section heading outside the metal isolate", () => {
    const services = sections.slice(sections.indexOf("export function Services"));
    const headingAt = services.indexOf("<Section.Heading");
    const deckAt = services.indexOf('className="service-sec');
    assert.ok(headingAt > 0 && deckAt > 0, "Services must render Heading and a service-sec deck");
    assert.ok(headingAt < deckAt, "Heading must sit above service-sec so WebGL isolate cannot flatten it");
  });

  it("keeps service tile titles as real CSS glyphs, not a Safari text-fill / canvas bitmap", () => {
    assert.doesNotMatch(
      css,
      /\.service-title-live[\s\S]{0,280}-webkit-text-fill-color/,
      "fill-color rasterizes Bodoni tile titles the same way it flattened .section-title",
    );
    assert.doesNotMatch(
      css,
      /\.ink-gl[\s\S]{0,160}opacity:\s*0/,
      "hiding .service-ink leaves only the WebGL glyph texture",
    );
    assert.doesNotMatch(metal, /function drawInk/);
    assert.doesNotMatch(metal, /classList\.add\("ink-gl"\)/);
    assert.match(css, /\.service-title[\s\S]{0,180}text-rendering:\s*geometricPrecision/);
  });

  it("settles an open panel even if grid-template-rows never fires transitionend", () => {
    assert.match(panel, /setTimeout/);
    assert.match(panel, /gridTemplateRows = settle/);
  });
});

describe("open mobile menu chrome", () => {
  it("does not ship the old full-bleed black sheet", () => {
    const sheetAt = header.indexOf("<SheetContent");
    const sheet = header.slice(sheetAt, header.indexOf("</SheetContent>", sheetAt));
    assert.ok(sheetAt > 0 && sheet.length > 0, "missing SheetContent");
    assert.doesNotMatch(sheet, /bg-\[rgb\(7_7_8\/0\.96\)\]/);
    assert.doesNotMatch(sheet, /font-serif text-\[clamp\(2\.2rem/);
    assert.match(sheet, /nav-sheet/);
    assert.doesNotMatch(sheet, /<CaviarLogo/);
    assert.doesNotMatch(sheet, /<LangSwitch/);
  });

  it("styles the open sheet as frost glass, not a solid black panel", () => {
    const mobile = css.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n\}/);
    assert.ok(mobile, "missing phone header/sheet media query");
    assert.doesNotMatch(
      mobile[1],
      /\[data-slot="sheet-content"\][\s\S]*?background-color:\s*#070708/,
      "phone sheet-content must not force solid #070708",
    );
    const sheet = css.match(/\.nav-sheet[^{]*\{([^}]+)\}/);
    assert.ok(sheet, "missing .nav-sheet");
    assert.match(sheet[1], /backdrop-filter/);
    assert.doesNotMatch(sheet[1], /background-color:\s*#070708/);
  });
});

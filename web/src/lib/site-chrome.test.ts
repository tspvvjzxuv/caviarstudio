import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const src = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(src, "../index.css"), "utf8");
const header = readFileSync(join(src, "../components/site-header.tsx"), "utf8");
const sections = readFileSync(join(src, "../components/sections.tsx"), "utf8");

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
});

describe("service tile titles", () => {
  it("does not bitmap tile titles with -webkit-text-fill-color", () => {
    const live = css.match(/\.service-sec\.has-metal \.service-chrome \.service-title-live\s*\{([^}]+)\}/);
    assert.ok(live, "missing metal tile title rule");
    assert.doesNotMatch(
      live[1],
      /-webkit-text-fill-color/,
      "fill-color rasterizes Bodoni on iPhone the same way it bitmapped .section-title",
    );
    const title = rule(css, ".service-title");
    assert.match(title, /text-rendering:\s*geometricPrecision/);
  });

  it("sets condensed chrome type on tile titles without a text-fill bitmap", () => {
    assert.match(css, /--font-display:\s*"Saira Extra Condensed"/);
    assert.match(css, /\.service-title-live[\s\S]*?background-clip:\s*text/);
    assert.doesNotMatch(
      css,
      /\.service-title-live[\s\S]{0,400}-webkit-text-fill-color/,
      "chrome titles must stay vector CSS glyphs",
    );
  });

  it("keeps closed-tile titles and icons as live CSS, not a hidden atlas", () => {
    const closedInk = css.match(/\.service-sec\.has-metal \.service-chrome \.service-ink\s*\{([^}]+)\}/);
    assert.ok(closedInk, "missing closed-tile ink rule");
    assert.doesNotMatch(closedInk[1], /opacity:\s*0/, "hiding CSS ink leaves only the low-res metal bitmap");
    assert.match(closedInk[1], /mix-blend-mode:\s*difference/);
    assert.doesNotMatch(
      css,
      /\.service-sec\.has-metal(?:\.ink-gl)? \.service-chrome \.service-ink\s*\{[^}]*opacity:\s*0/,
    );
  });

  it("shows real CSS glyphs on an open tile", () => {
    const openInk = css.match(
      /\.service-sec\.has-metal \.service-chrome\.is-open \.service-ink[\s\S]*?\{([^}]+)\}/,
    );
    assert.ok(openInk, "missing open-tile ink rule");
    assert.match(openInk[1], /mix-blend-mode:\s*normal/);
  });

  it("covers the open tile with CSS so metal does not need a same-frame punch", () => {
    const open = css.match(
      /\.service-sec\.has-metal \.service-chrome\.is-open,\s*\.service-sec\.has-metal \.service-chrome\[aria-expanded="true"\]\s*\{([^}]+)\}/,
    );
    assert.ok(open, "missing open-tile chrome rule");
    assert.match(open[1], /background-color:\s*#0e0e12/);
  });

  it("hides the metal canvas on a phone while a tile is open", () => {
    assert.match(
      css,
      /@media \(max-width: 767px\) \{[\s\S]*has-metal:has\(\.service-chrome\.is-open\) \.service-metal[\s\S]*visibility:\s*hidden/,
    );
  });

  it("keeps the open service panel above the metal canvas", () => {
    const body = rule(css, ".service-sec.has-metal .service-panel.is-open");
    assert.ok(body, "missing open-panel stacking rule");
    assert.match(body, /z-index:\s*3/);
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

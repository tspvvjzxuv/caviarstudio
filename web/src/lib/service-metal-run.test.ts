import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  inkOnMetal,
  metalCycleAt,
  METAL_SPIN_RAD_PER_SEC,
  PLAYGROUND_PARAMS,
} from "./liquid-metal-playground.ts";
import { anyCardOpen, chromeIsOpen, metalShouldRun, metalSkipGpu, panelTweening } from "./service-metal-run.ts";

describe("metalShouldRun", () => {
  const ok = {
    hidden: false,
    onscreen: true,
    paused: false,
    tweening: false,
    phoneOpen: false,
  };

  it("runs when the section is idle and onscreen", () => {
    assert.equal(metalShouldRun(ok), true);
  });

  it("stops while a panel is tweening", () => {
    assert.equal(metalShouldRun({ ...ok, tweening: true }), false);
  });

  it("stops on a phone while a card is open", () => {
    assert.equal(metalShouldRun({ ...ok, phoneOpen: true }), false);
  });

  it("skips GPU resize while tweening or a phone card is open", () => {
    assert.equal(metalSkipGpu({ tweening: false, phoneOpen: false }), false);
    assert.equal(metalSkipGpu({ tweening: true, phoneOpen: false }), true);
    assert.equal(metalSkipGpu({ tweening: false, phoneOpen: true }), true);
  });

  it("stops when offscreen, hidden, or paused", () => {
    assert.equal(metalShouldRun({ ...ok, onscreen: false }), false);
    assert.equal(metalShouldRun({ ...ok, hidden: true }), false);
    assert.equal(metalShouldRun({ ...ok, paused: true }), false);
  });
});

describe("panelTweening / anyCardOpen", () => {
  it("treats px grid rows as a live tween", () => {
    const sec = {
      querySelectorAll: () => [{ style: { gridTemplateRows: "180px" } }],
      querySelector: () => null,
    } as unknown as ParentNode;
    assert.equal(panelTweening(sec), true);
  });

  it("is idle when rows are 0fr / 1fr", () => {
    const sec = {
      querySelectorAll: () => [{ style: { gridTemplateRows: "1fr" } }],
      querySelector: () => null,
    } as unknown as ParentNode;
    assert.equal(panelTweening(sec), false);
  });

  it("sees an expanded chrome tile", () => {
    const sec = {
      querySelectorAll: () => [],
      querySelector: () => ({}),
    } as unknown as ParentNode;
    assert.equal(anyCardOpen(sec), true);
  });

  it("treats is-open or aria-expanded as an open tile", () => {
    const open = {
      classList: { contains: (name: string) => name === "is-open" },
      getAttribute: () => null,
    };
    const aria = {
      classList: { contains: () => false },
      getAttribute: (name: string) => (name === "aria-expanded" ? "true" : null),
    };
    const shut = {
      classList: { contains: () => false },
      getAttribute: () => "false",
    };
    assert.equal(chromeIsOpen(open), true);
    assert.equal(chromeIsOpen(aria), true);
    assert.equal(chromeIsOpen(shut), false);
  });

  it("clears metal from open tiles", () => {
    const metal = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "service-metal.ts"), "utf8");
    assert.match(metal, /open\[i\] = chromeIsOpen\(btn\) \? 1 : 0/);
  });

  it("does not punch or resize the metal FBO on the open frame", () => {
    const metal = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "service-metal.ts"), "utf8");
    const panel = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../components/service-panel.tsx"), "utf8");
    assert.doesNotMatch(metal, /const punchOpen = /);
    assert.match(metal, /const applySize = \(force = false\) => \{\s*if \(gpuHold\(\)\) return;/);
    assert.match(metal, /if \(gpuHold\(\)\) \{\s*stop\(\);\s*return;/);
    assert.match(panel, /function measureOpenHeight\(inner: HTMLElement\) \{[^}]*inner\.scrollHeight/);
  });

  it("keeps metal DPR capped and does not bitmap closed titles or icons", () => {
    const metal = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "service-metal.ts"), "utf8");
    assert.match(metal, /dprCap = hiRes \? 2 : 1\.25/);
    assert.match(metal, /dprMin = hiRes \? 1 : 0\.75/);
    assert.doesNotMatch(metal, /ctx\.fillText/);
    assert.doesNotMatch(metal, /function drawInk/);
    assert.doesNotMatch(metal, /function drawSvg/);
    assert.doesNotMatch(metal, /ink-gl/);
    assert.doesNotMatch(metal, /NearestFilter/);
  });
});

describe("metal cycle", () => {
  it("stays molten, not frantic", () => {
    assert.ok(PLAYGROUND_PARAMS.speed > 0.035);
    assert.ok(PLAYGROUND_PARAMS.speed < 0.07);
    assert.ok(METAL_SPIN_RAD_PER_SEC > 0.04);
    assert.ok(METAL_SPIN_RAD_PER_SEC < 0.16);
  });

  it("turns the flow over time instead of only sliding", () => {
    const a = metalCycleAt(0).angle;
    const b = metalCycleAt(8).angle;
    assert.ok(Math.abs(b - a - 8 * METAL_SPIN_RAD_PER_SEC) < 1e-6);
  });
});

describe("inkOnMetal", () => {
  it("keeps titles light on dark metal", () => {
    assert.equal(inkOnMetal(0.12), "light");
  });

  it("flips to dark when a bright sheen passes", () => {
    assert.equal(inkOnMetal(0.7), "dark");
    assert.equal(inkOnMetal(0.42), "dark");
  });
});

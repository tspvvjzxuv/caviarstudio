import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inkOnMetal,
  metalCycleAt,
  METAL_SPIN_RAD_PER_SEC,
  PLAYGROUND_PARAMS,
} from "./liquid-metal-playground.ts";
import { anyCardOpen, metalShouldRun, panelTweening } from "./service-metal-run.ts";

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

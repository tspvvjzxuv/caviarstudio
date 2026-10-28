import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CAVIAR_EASE,
  LOCKUP_SPLIT,
  flipDuration,
  lockupDelay,
  revealVars,
} from "./gsap-motion.ts";

const src = dirname(fileURLToPath(import.meta.url));

describe("revealVars", () => {
  it("rises 20–30px and fades in ~0.8–1s on desktop", () => {
    const v = revealVars({ reduced: false, desktop: true, skipY: false });
    assert.ok(v.y >= 20 && v.y <= 30);
    assert.ok(v.duration >= 0.8 && v.duration <= 1);
    assert.equal(v.opacity, 0);
  });

  it("shortens on reduced motion and skips fade", () => {
    const v = revealVars({ reduced: true, desktop: true, skipY: false });
    assert.ok(v.y <= 10);
    assert.ok(v.duration <= 0.4);
    assert.equal(v.opacity, 1);
  });

  it("does not translate metal tiles", () => {
    const v = revealVars({ reduced: false, desktop: true, skipY: true });
    assert.equal(v.y, 0);
  });
});

describe("Flip / SplitText tokens", () => {
  it("keeps service Flip snappy, not a 1s layout crawl", () => {
    assert.ok(flipDuration(true, false) < 0.7);
    assert.equal(flipDuration(true, true), 0);
  });

  it("splits the lockup by lines, not letters", () => {
    assert.equal(LOCKUP_SPLIT, "lines");
    assert.equal(CAVIAR_EASE, "expo.out");
  });

  it("waits for the intro veil on first load", () => {
    assert.ok(lockupDelay(false) > 1);
    assert.ok(lockupDelay(true) < 0.2);
  });
});

describe("stack", () => {
  it("registers ScrollTrigger, Flip, SplitText and nothing banned", () => {
    const gsap = readFileSync(join(src, "gsap.ts"), "utf8");
    assert.match(gsap, /ScrollTrigger/);
    assert.match(gsap, /Flip/);
    assert.match(gsap, /SplitText/);
    assert.doesNotMatch(gsap, /ScrollSmoother|Lenis|MorphSVG|DrawSVG|Draggable|Physics|ScrambleText/);
  });

  it("re-applies is-flipping when Flip plays (useGSAP cleanup can strip it)", () => {
    const flip = readFileSync(join(src, "service-flip.ts"), "utf8");
    assert.match(flip, /function playServiceFlip[\s\S]*classList\.add\("is-flipping"\)/);
  });

  it("does not add video or Playwright CI tests", () => {
    const pkg = readFileSync(join(src, "../../package.json"), "utf8");
    assert.doesNotMatch(pkg, /playwright|mp4|video.*test/i);
  });
});

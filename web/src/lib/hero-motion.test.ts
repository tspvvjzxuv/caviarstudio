import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { heroShouldRun, rafNeedsKick } from "./hero-motion.ts";

describe("heroShouldRun", () => {
  it("runs on first view", () => {
    assert.equal(heroShouldRun(false, true), true);
  });

  it("stops when scrolled away", () => {
    assert.equal(heroShouldRun(false, false), false);
  });

  it("resumes when the hero is onscreen again", () => {
    assert.equal(heroShouldRun(false, true), true);
  });

  it("stays off while the tab is hidden", () => {
    assert.equal(heroShouldRun(true, true), false);
    assert.equal(heroShouldRun(true, false), false);
  });
});

describe("rafNeedsKick", () => {
  it("kicks a stopped loop", () => {
    assert.equal(rafNeedsKick(false, 0), true);
  });

  it("kicks again when running but rAF was dropped", () => {
    assert.equal(rafNeedsKick(true, 0), true);
  });

  it("does not double-schedule an active frame", () => {
    assert.equal(rafNeedsKick(true, 17), false);
  });
});

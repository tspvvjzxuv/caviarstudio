import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { isRevealVisible, REVEAL_IO, syncVisibleReveals } from "./reveal-gate.ts";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../index.css"), "utf8");

describe("reveal CSS", () => {
  it("does not hide .reveal until IntersectionObserver fires", () => {
    const hidden = css.match(/\.js \.reveal \{([^}]+)\}/);
    assert.ok(hidden, "missing .js .reveal rule");
    assert.doesNotMatch(
      hidden[1],
      /opacity:\s*0\s*;/,
      "opacity 0 until .in leaves a black hole on fast scroll / jump",
    );
  });
});

describe("REVEAL_IO", () => {
  it("marks on any pixel, including footer at the bottom of the viewport", () => {
    assert.equal(REVEAL_IO.threshold, 0);
    assert.match(String(REVEAL_IO.rootMargin ?? "0px"), /^-?\d|^0|%|px/);
    assert.doesNotMatch(String(REVEAL_IO.rootMargin), /-\d/, "negative rootMargin skips End / hash jumps");
  });
});

describe("isRevealVisible", () => {
  it("counts a 1px clip (fast scroll / threshold 0.08 would miss)", () => {
    assert.equal(isRevealVisible({ top: 799, bottom: 800 }, 800), true);
  });

  it("counts a card sitting in the last 5% (old -6% bottom inset missed this)", () => {
    assert.equal(isRevealVisible({ top: 768, bottom: 900 }, 800), true);
  });

  it("rejects fully above or below", () => {
    assert.equal(isRevealVisible({ top: -120, bottom: 0 }, 800), false);
    assert.equal(isRevealVisible({ top: 800, bottom: 980 }, 800), false);
  });
});

describe("syncVisibleReveals", () => {
  it("adds .in to onscreen nodes after a jump", () => {
    const seen = { classList: new Set<string>(), getBoundingClientRect: () => ({ top: 40, bottom: 200 }) };
    const hidden = { classList: new Set<string>(), getBoundingClientRect: () => ({ top: 1200, bottom: 1400 }) };
    const already = {
      classList: new Set(["in"]),
      getBoundingClientRect: () => ({ top: 10, bottom: 80 }),
    };
    syncVisibleReveals(
      [
        {
          classList: {
            contains: (c: string) => seen.classList.has(c),
            add: (c: string) => {
              seen.classList.add(c);
            },
          },
          getBoundingClientRect: seen.getBoundingClientRect,
        },
        {
          classList: {
            contains: (c: string) => hidden.classList.has(c),
            add: (c: string) => {
              hidden.classList.add(c);
            },
          },
          getBoundingClientRect: hidden.getBoundingClientRect,
        },
        {
          classList: {
            contains: (c: string) => already.classList.has(c),
            add: (c: string) => {
              already.classList.add(c);
            },
          },
          getBoundingClientRect: already.getBoundingClientRect,
        },
      ],
      800,
    );
    assert.ok(seen.classList.has("in"));
    assert.equal(hidden.classList.has("in"), false);
    assert.deepEqual([...already.classList], ["in"]);
  });
});

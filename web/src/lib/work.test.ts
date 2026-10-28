import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { WORK } from "./work.ts";

const here = dirname(fileURLToPath(import.meta.url));
const tile = readFileSync(join(here, "../components/work-tile.tsx"), "utf8");
const css = readFileSync(join(here, "../index.css"), "utf8");

const PHONE_FILMS = [
  ["lile-lentilka", "/media/work/lile-lentilka-scroll.mp4"],
  ["ptra", "/media/work/ptra-scroll.mp4"],
  ["malovanienatvar2", "/media/work/malovanie-scroll.mp4"],
] as const;

describe("work scroll films", () => {
  it("sets a video path on each live site", () => {
    for (const [id, path] of PHONE_FILMS) {
      const item = WORK.find((row) => row.id === id);
      assert.ok(item, `missing work item ${id}`);
      assert.equal(item.video, path);
      assert.ok(item.imageMobile || item.image, `${id} needs a still for poster`);
    }
  });

  it("plays one muted loop video, with no device chrome", () => {
    assert.match(tile, /function WorkFilm/);
    assert.match(tile, /<video[\s\S]*muted[\s\S]*playsInline[\s\S]*autoPlay[\s\S]*loop/);
    assert.match(tile, /className="project-film"/);
    assert.match(tile, /height=\{560\}/);
    assert.doesNotMatch(tile, /DevicePair|device-laptop|device-phone|device-stage/);
    assert.match(css, /aspect-ratio:\s*500\s*\/\s*560/);
    assert.doesNotMatch(css, /aspect-ratio:\s*500\s*\/\s*830/);
  });
});

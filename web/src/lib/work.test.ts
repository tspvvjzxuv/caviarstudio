import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { WORK } from "./work.ts";

const here = dirname(fileURLToPath(import.meta.url));
const tile = readFileSync(join(here, "../components/work-tile.tsx"), "utf8");
const media = join(here, "../../..", "media/work");

const PHONE_FILMS = [
  ["lile-lentilka", "/media/work/lile-lentilka-scroll.mp4", "lile-lentilka-scroll.mp4"],
  ["ptra", "/media/work/ptra-scroll.mp4", "ptra-scroll.mp4"],
  ["malovanienatvar2", "/media/work/malovanie-scroll.mp4", "malovanie-scroll.mp4"],
] as const;

describe("work phone scroll films", () => {
  it("sets a video path on each live site", () => {
    for (const [id, path] of PHONE_FILMS) {
      const item = WORK.find((row) => row.id === id);
      assert.ok(item, `missing work item ${id}`);
      assert.equal(item.video, path);
      assert.ok(item.imageMobile || item.image, `${id} needs a still for poster`);
    }
  });

  it("keeps the mp4s next to the stills", () => {
    for (const [, , file] of PHONE_FILMS) {
      const abs = join(media, file);
      assert.ok(existsSync(abs), `missing ${abs}`);
      const head = readFileSync(abs).subarray(4, 8).toString("ascii");
      assert.equal(head, "ftyp", `${file} is not an mp4`);
    }
  });

  it("plays the film in the phone, not the laptop", () => {
    assert.match(tile, /function PhoneFilm/);
    assert.match(tile, /<video[\s\S]*muted[\s\S]*playsInline[\s\S]*autoPlay[\s\S]*loop/);
    assert.match(tile, /videoSrc=\{film/);
    const laptop = tile.slice(tile.indexOf("device-laptop"), tile.indexOf("device-phone"));
    assert.doesNotMatch(laptop, /videoSrc/);
  });
});

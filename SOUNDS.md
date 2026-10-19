# UI sounds

Quiet single piano notes for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops. No clicks, whooshes, shutters, or chords.

Shipped files live in `media/ui/` as WebM/Opus plus MP3. Each is one piano key, trimmed to ~1.05 s with a natural fade, low-passed slightly, and under 10 KB.

| Cue | Files | Mapping |
| --- | --- | --- |
| Soft piano A4 | `piano-open.webm` / `.mp3` | Fotky / Videá / Weby **open** |
| Same family, lower A3, quieter | `piano-close.webm` / `.mp3` | Same cards **close** |
| Same A4 at lower playback gain | `piano-open.webm` / `.mp3` | Primary `.metal-fill` buttons; unmute confirm |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio off.

## Sources and licenses

Verified 2026-10-19 on each file page. Every source is **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credits below are optional.

Freesound pages link [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/) and state: “You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking permission to the author.” The author also writes: “Use this for anything you want, commercial or not, credit me or not. Consider it public domain.”

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| Open / hit — single A4 (trim ~0–1.05 s; fade from 0.52 s) | A4.ogg | [freesound.org/people/TEDAgame/sounds/448561](https://freesound.org/people/TEDAgame/sounds/448561/) | HQ preview used (same CC0 recording; original OGG requires login) | CC0 1.0 |
| Close — single A3, quieter (trim ~0–1.05 s; fade from 0.48 s) | A3.ogg | [freesound.org/people/TEDAgame/sounds/448562](https://freesound.org/people/TEDAgame/sounds/448562/) | HQ preview used (same CC0 recording) | CC0 1.0 |

Pack: [88 piano keys, long reverb](https://freesound.org/people/TEDAgame/packs/25405/) by TEDAgame. Edits (trim, fade, low-pass, quieter mix, Opus/MP3 encode) are allowed under CC0.

## Playback

`web/src/lib/sound.ts` prefetches the WebM/Opus or MP3 `ArrayBuffer`s on module load, creates an `AudioContext`, and `decodeAudioData`s even while the context is suspended. The first pointer/key gesture calls `resume()` (capture phase) plus a 1-sample silent warmup. `playUiSound` starts the decoded buffer at `ctx.currentTime` on the card’s `pointerdown` / `keydown`. Primary buttons reuse the A4 buffer at lower gain. Mute unchanged.

# UI sounds

Quiet single piano notes for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops. No clicks, whooshes, shutters, chords, or button hits.

Shipped files live in `media/ui/` as WebM/Opus plus MP3. Each is one piano key, trimmed to ~0.62 s, low-passed at 2.7 kHz, faded out from 0.30 s, and peaked around **−30 dBFS** (open) / **−36 dBFS** (close). Under 4 KB.

| Cue | Files | Mapping |
| --- | --- | --- |
| Soft piano A4 | `piano-open.webm` / `.mp3` | Fotky / Videá / Weby **open** |
| Same family, lower A3, quieter | `piano-close.webm` / `.mp3` | Same cards **close** |
| — | no sample | Primary buttons and unmute confirm stay **silent** |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio on or off.

## Sources and licenses

Verified 2026-10-19 on each file page. Every source is **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credits below are optional.

No suitable CC0 felt / una-corda / muted-grand **single note** was found (felt packs on Freesound require attribution; tur.kis “Muted piano C” is a 1:42 prepared take, not a short UI key). The shipped cues are the same TEDAgame CC0 single keys as before, processed quieter and duller as allowed under CC0.

Freesound pages link [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/) and state: “You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking permission to the author.” The author also writes: “Use this for anything you want, commercial or not, credit me or not. Consider it public domain.”

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| Open — single A4 (trim ~0–0.62 s; LPF 2.7 kHz; fade from 0.30 s; peak ≈ −30 dBFS) | A4.ogg | [freesound.org/people/TEDAgame/sounds/448561](https://freesound.org/people/TEDAgame/sounds/448561/) | HQ preview used (same CC0 recording; original OGG requires login) | CC0 1.0 |
| Close — single A3, quieter (same treatment; peak ≈ −36 dBFS) | A3.ogg | [freesound.org/people/TEDAgame/sounds/448562](https://freesound.org/people/TEDAgame/sounds/448562/) | HQ preview used (same CC0 recording) | CC0 1.0 |

Pack: [88 piano keys, long reverb](https://freesound.org/people/TEDAgame/packs/25405/) by TEDAgame. Edits (trim, fade, low-pass, quieter mix, Opus/MP3 encode) are allowed under CC0.

## Playback

`web/src/lib/sound.ts` prefetches the WebM/Opus or MP3 `ArrayBuffer`s on module load, creates an `AudioContext`, and `decodeAudioData`s even while the context is suspended. The first pointer/key gesture calls `resume()` (capture phase) plus a 1-sample silent warmup. `playUiSound` starts the decoded buffer at `ctx.currentTime` on the card’s `pointerdown` / `keydown`.

Each play builds a short graph: `BiquadFilter` low-pass at 2.7 kHz, then a gain envelope that ramps from 0 over **32 ms** (softens the hammer), holds, and fades to 0 by ~0.58 s. Master gain is 0.9. Close uses the quieter A3 file plus 0.72 voice gain. Buttons are silent. Mute unchanged.

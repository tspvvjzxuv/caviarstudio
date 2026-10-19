# UI sounds

Quiet tactile cues for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops. No lens clicks, whooshes, shutters, or chords.

Shipped files live in `media/ui/` as WebM/Opus plus MP3.

| Cue | Files | Mapping |
| --- | --- | --- |
| Soft piano A4 | `piano-open.webm` / `.mp3` | Fotky / Videá / Weby **open** |
| Same family, lower A3, quieter | `piano-close.webm` / `.mp3` | Same cards **close** |
| Soft glass tap | `glass-tap.webm` / `.mp3` | Primary `.metal-fill` buttons; unmute confirm |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio **off**.

## Piano (cards)

Each key is trimmed to ~0.62 s, low-passed at 2.7 kHz, faded out from 0.30 s, and peaked around **−30 dBFS** (open) / **−36 dBFS** (close). Under 4 KB.

No suitable CC0 felt / una-corda / muted-grand **single note** was found (felt packs on Freesound require attribution; tur.kis “Muted piano C” is a 1:42 prepared take, not a short UI key). The shipped cues are TEDAgame CC0 single keys, processed quieter and duller as allowed under CC0.

## Glass tap (buttons)

A ~90 ms slice of a finger tapping a phone screen: high-passed, low-passed at 4.8 kHz, 3 ms fade-in, fade-out from 48 ms, peak ≈ **−38 dBFS** (quieter than the card piano). No ring-out. Under 2 KB.

## Sources and licenses

Verified 2026-10-19 on each file page. Every source is **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credits below are optional.

Freesound pages link [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/) and state: “You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking permission to the author.”

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| Open — single A4 (trim ~0–0.62 s; LPF 2.7 kHz; fade from 0.30 s; peak ≈ −30 dBFS) | A4.ogg | [freesound.org/people/TEDAgame/sounds/448561](https://freesound.org/people/TEDAgame/sounds/448561/) | HQ preview used (same CC0 recording; original OGG requires login) | CC0 1.0 |
| Close — single A3, quieter (same treatment; peak ≈ −36 dBFS) | A3.ogg | [freesound.org/people/TEDAgame/sounds/448562](https://freesound.org/people/TEDAgame/sounds/448562/) | HQ preview used (same CC0 recording) | CC0 1.0 |
| Hit — one finger tap on a phone screen (slice ~0.60–0.69 s of the source; LPF 4.8 kHz; peak ≈ −38 dBFS) | Finger Tapping Phone | [freesound.org/people/jentlemen/sounds/704862](https://freesound.org/people/jentlemen/sounds/704862/) | HQ preview used (same CC0 recording) | CC0 1.0 |

Piano pack: [88 piano keys, long reverb](https://freesound.org/people/TEDAgame/packs/25405/) by TEDAgame. The tap author writes that they recorded it because they could not find a clean CC0 phone-screen tap. Edits (trim, fade, low-pass, quieter mix, Opus/MP3 encode) are allowed under CC0.

## Playback

`web/src/lib/sound.ts` prefetches the WebM/Opus or MP3 `ArrayBuffer`s on module load, creates an `AudioContext`, and `decodeAudioData`s even while the context is suspended. The first pointer/key gesture calls `resume()` (capture phase) plus a 1-sample silent warmup. `playUiSound` starts the decoded buffer at `ctx.currentTime` on `pointerdown` / `keydown`.

Each play builds a short graph: `BiquadFilter` low-pass, then a gain envelope from 0.

- Cards: 32 ms attack, 2.7 kHz, fade by ~0.58 s. Close uses the quieter A3 file plus 0.72 voice gain.
- Buttons: 8 ms attack, 4.5 kHz, ~90 ms total, 0.62 voice. Quieter than the piano.

Master gain is 0.9. Mute unchanged.

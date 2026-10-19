# UI sounds

Quiet tactile one-shots for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops.

Shipped files live in `media/ui/` as WebM/Opus plus MP3. Each is trimmed under 0.5 s, peak-limited, and under 8 KB.

| Cue | Files | Mapping |
| --- | --- | --- |
| Lens bayonet lock (mount click) + quiet piano | `lens-open.webm` / `.mp3` | Fotky / Videá / Weby **open** |
| Lighter lens take-out click | `lens-close.webm` / `.mp3` | Same cards **close** |
| Short DSLR shutter | `hit.webm` / `.mp3` | Primary `.metal-fill` buttons; unmute confirm |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio off.

## Sources and licenses

Verified 2026-10-19 on each file page and on the catalog license. Every source is **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credits below are optional.

- Freesound 516490: page link [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/) — “You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking permission to the author.”
- SFXMint catalog: [CC0 1.0](https://sfxmint.com/license) — “every SFXMint sound is CC0 1.0 public domain… no attribution required.” Legal code: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| Open — lens mount / bayonet lock (trim ~22.442–22.762 s of the recording; transient aligned to the start) | Old SLR manual lens - Taking out and putting back in camera | [freesound.org/people/khenshom/sounds/516490](https://freesound.org/people/khenshom/sounds/516490/) | HQ preview used (original WAV requires login; same CC0 recording) | CC0 1.0 |
| Open — quiet piano underlay (~0.09 mix, faded with the click) | Piano Major Chord 01 | [sfxmint.com/sounds/piano-major-chord-01](https://sfxmint.com/sounds/piano-major-chord-01) | [piano-major-chord-01.wav](https://sfxmint.com/dl/piano-major-chord-01.wav) | CC0 1.0 |
| Close — lighter take-out click (trim ~4.682–4.922 s) | same Konica SLR lens recording | same Freesound page | same | CC0 1.0 |
| Hit — camera shutter (trim ~0.01–0.39 s of a 2 s file) | Single Dslr Camera Shutter 39 (No Reverb) | [sfxmint.com/sounds/office-camera-39](https://sfxmint.com/sounds/office-camera-39) | [office-camera-39.wav](https://sfxmint.com/dl/office-camera-39.wav) | CC0 1.0 |

Edits (trim, fade, mix, peak limit, Opus/MP3 encode) are allowed under CC0.

## Playback

`web/src/lib/sound.ts` prefetches the WebM/Opus or MP3 `ArrayBuffer`s on module load, creates an `AudioContext`, and `decodeAudioData`s even while the context is suspended. The first pointer/key gesture calls `resume()` (capture phase) plus a 1-sample silent warmup. `playUiSound` starts the decoded buffer at `ctx.currentTime` on the card’s `pointerdown` / `keydown` — it does not wait on fetch or decode if the buffer is already ready. Gain stays low on a shared master bus.

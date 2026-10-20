# UI sounds

Quiet tactile cues for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops. No piano, lens clicks, whooshes, shutters, chords, Apple system sounds, or synthesized tones.

One shipped cue lives in `media/ui/` as WebM/Opus plus MP3.

| Cue | Files | Mapping |
| --- | --- | --- |
| Soft glass tap | `glass-tap.webm` / `.mp3` | Fotky / Videá / Weby / Dron **open** (voice 1.0); same cards **close** (voice 0.62, quieter); primary `.metal-fill` buttons and unmute confirm (voice 0.88) |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio **off**.

## Glass tap

One clean finger tap on a phone screen, taken from the original CC0 recording. Trimmed to ~90 ms around the first onset (~0.598–0.688 s of the source) and peak-normalized to ≈ **−32 dBFS**. 1 ms fade-in / 4 ms fade-out only at the splice so the cut does not click. No extra EQ, low-pass, pitch shift, or `playbackRate`. Under 2 KB.

Playback is the decoded buffer through a gain node (level only). Close uses the same buffer, quieter. No oscillators, noise bursts, or other Web Audio synthesis.

## Sources and licenses

Verified 2026-10-19 on the file page. **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credit below is optional.

The Freesound page links [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/) and states: “You can copy, modify, distribute and perform the sound, even for commercial purposes, all without the need of asking permission to the author.”

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| One finger tap on a phone screen (trim ~0.598–0.688 s; peak ≈ −32 dBFS) | Finger Tapping Phone | [freesound.org/people/jentlemen/sounds/704862](https://freesound.org/people/jentlemen/sounds/704862/) | HQ preview used (same CC0 recording; original WAV requires login) | CC0 1.0 |

The author writes that they recorded it because they could not find a clean CC0 phone-screen tap. Trim, quieter mix, and Opus/MP3 encode are allowed under CC0. This is not an Apple system sound.

## Playback

`web/src/lib/sound.ts` prefetches the WebM/Opus or MP3 `ArrayBuffer` on module load, creates an `AudioContext`, and `decodeAudioData`s even while the context is suspended. The first pointer/key gesture calls `resume()` (capture phase) plus a 1-sample silent warmup. `playUiSound` starts the decoded buffer at `ctx.currentTime` on `pointerdown` / `keydown`.

Master gain is 0.9. Mute unchanged.

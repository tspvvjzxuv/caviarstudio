# UI sounds

Quiet cinematic one-shots for caviarstudio.sk. Play only after a user gesture. Mute is a glass disc in the header (`localStorage` `caviar-sound:v1`, default on). No ambient loops.

Shipped files live in `media/ui/` as WebM/Opus plus MP3. Each is trimmed under 1.5 s, loudness-normalized around −24 LUFS, and under 40 KB.

| Cue | Files | Mapping |
| --- | --- | --- |
| Soft cinematic whoosh | `whoosh-open.webm` / `.mp3` | Fotky / Videá / Weby **open** |
| Reverse whoosh | `whoosh-close.webm` / `.mp3` | Same cards **close** (reverse edit of the open whoosh) |
| Low hit + glassy shimmer | `hit.webm` / `.mp3` | Primary `.metal-fill` buttons; unmute confirm |

The mute control itself is unchanged (same disc, same persistence). It does not play a sound when turning audio off.

## Sources and licenses

Verified 2026-10-19 on each file page and on the catalog license. Every source is **CC0 1.0** (public domain): free commercial website use, modification, and redistribution, **no attribution required**. Credits below are optional.

Catalog license: [SFXMint CC0 1.0](https://sfxmint.com/license) — “every SFXMint sound is CC0 1.0 public domain… no attribution required.” Legal code: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

| Shipped cue | Original title | Source page | Download | License |
| --- | --- | --- | --- | --- |
| Open whoosh (trimmed 0.28–1.50 s of the original) | Slow Deep Air Whoosh Transition 03 | [sfxmint.com/sounds/transition-whoosh-03](https://sfxmint.com/sounds/transition-whoosh-03) | [transition-whoosh-03.wav](https://sfxmint.com/dl/transition-whoosh-03.wav) | CC0 1.0 |
| Close whoosh | Reverse of the trimmed open whoosh (same source) | same | same | CC0 1.0 |
| Hit — impact layer (first 0.50 s; drop padded tail) | Soft Transition Impact 01 | [sfxmint.com/sounds/soft-transition-impact-01](https://sfxmint.com/sounds/soft-transition-impact-01) | [soft-transition-impact-01.wav](https://sfxmint.com/dl/soft-transition-impact-01.wav) | CC0 1.0 |
| Hit — glassy shimmer layer (first 0.45 s, quieter mix) | Glassy Notification Chime 68 | [sfxmint.com/sounds/ui-chime-68](https://sfxmint.com/sounds/ui-chime-68) | [ui-chime-68.wav](https://sfxmint.com/dl/ui-chime-68.wav) | CC0 1.0 |

Edits (trim, fade, reverse, mix, loudnorm, Opus/MP3 encode) are allowed under CC0.

## Playback

`web/src/lib/sound.ts` fetches WebM/Opus when the browser reports `probably`, otherwise MP3. Decode happens lazily after the first pointer/key gesture. Gain stays low on a shared `AudioContext` master bus.

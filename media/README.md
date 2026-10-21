# Caviar media

## Hero loop

Liquid-chrome backdrop in `media/hero/`:

- `liquid-chrome.webm` / `liquid-chrome-720.webm` (AV1, 1080p / 720p)
- `liquid-chrome.mp4` / `liquid-chrome-720.mp4` (H.264 High, yuv420p, faststart)
- `liquid-chrome.hevc.mp4` / `liquid-chrome-720.hevc.mp4` (HEVC `hvc1` for Safari)
- `liquid-chrome.jpg` (poster)

Re-encode with `scripts/encode-hero.sh` from the original mp4 in git (`a83667b`). Native timestamps are passed through — no `-r`, no `setpts`, no `fps=` resample — so playback speed and duration stay with the source (~9.97 s, 30 tbr). CRF, 1 s GOP. Browsers pick 720p under 768px via `<source media>`.

| File | Codec | Size | Was |
|------|-------|------|-----|
| `liquid-chrome.webm` | AV1 Main 1080p30 | 2.41 MiB | VP9 4.28 MiB |
| `liquid-chrome.mp4` | H.264 High yuv420p faststart 1080p30 | 2.54 MiB | H.264 3.95 MiB |
| `liquid-chrome.hevc.mp4` | HEVC Main `hvc1` 1080p30 | 1.72 MiB | — |
| `liquid-chrome-720.webm` | AV1 Main 720p30 | 1.46 MiB | — |
| `liquid-chrome-720.mp4` | H.264 High yuv420p faststart 720p30 | 1.43 MiB | — |
| `liquid-chrome-720.hevc.mp4` | HEVC Main `hvc1` 720p30 | 1.05 MiB | — |
| `liquid-chrome.jpg` | JPEG poster | 108 KB | 158 KB |

Source: [Pexels 29848606](https://www.pexels.com/video/29848606/). Pexels license: free commercial use, no attribution required.

The hero plays it muted, looping, full-bleed. It stays on the poster if `prefers-reduced-motion` is on, or if Save-Data / 2G is set.

## Work stills

Live-site screenshots of public websites go in `media/work/` as WebP: desktop `1440×900` (`<id>.webp`) and mobile `390×844` (`<id>-mobile.webp`), each under 250 KB. Add one object to `WORK` in `web/src/lib/work.ts` only when the live URL loads with real content. Do not add a tile without a working live page.

```ts
{
  id: "ptra",
  image: "/media/work/ptra.webp",
  title: "Stredoveký festival Stropkov",
  categories: ["festival"],
  href: "https://ptra.sk/",
  layout: "feature",
}
```

See the root `README.md` section **Work / photos**.

## UI sounds

One quiet glass tap in `media/ui/` (`webm` + `mp3`) for service cards and primary buttons. Sources, licenses, and mapping: root `SOUNDS.md`.

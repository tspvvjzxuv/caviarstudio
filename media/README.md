# Caviar media

## Hero loop

Liquid-chrome backdrop in `media/hero/`:

- `liquid-chrome.webm` / `liquid-chrome-720.webm` (AV1, 1080p / 720p)
- `liquid-chrome.mp4` / `liquid-chrome-720.mp4` (H.264 High, yuv420p, faststart)
- `liquid-chrome.hevc.mp4` / `liquid-chrome-720.hevc.mp4` (HEVC `hvc1` for Safari)
- `liquid-chrome.jpg` (poster)

Motion-interpolate to 60 fps with RIFE v4.6 (`scripts/interpolate-hero-60.sh`, CPU `-g -1`; cleaner than ffmpeg `minterpolate` on chrome highlights), then encode with `scripts/encode-hero.sh`. Source is the original mp4 in git (`a83667b`): 9.966667 s, 300 frames, `r=30/1`. Output is **10.000 s, 600 frames, `r=60/1`**, GOP 60. No `-r` on a video input, no `setpts`. Loop-pad copies frame 1 after frame 300 so the last in-between is last→first. Browsers pick 720p under 768px via `<source media>`. Cache-buster `?v=opt3`.

| File | Codec | Size | 30 fps was | Original |
|------|-------|------|------------|----------|
| `liquid-chrome.webm` | AV1 Main 1080p60 | 3.19 MiB | 2.41 MiB | VP9 4.28 MiB |
| `liquid-chrome.mp4` | H.264 High yuv420p faststart 1080p60 | 2.85 MiB | 2.54 MiB | H.264 3.95 MiB |
| `liquid-chrome.hevc.mp4` | HEVC Main `hvc1` 1080p60 | 1.70 MiB | 1.72 MiB | — |
| `liquid-chrome-720.webm` | AV1 Main 720p60 | 1.89 MiB | 1.46 MiB | — |
| `liquid-chrome-720.mp4` | H.264 High yuv420p faststart 720p60 | 1.58 MiB | 1.43 MiB | — |
| `liquid-chrome-720.hevc.mp4` | HEVC Main `hvc1` 720p60 | 1.04 MiB | 1.05 MiB | — |
| `liquid-chrome.jpg` | JPEG poster | 121 KB | 108 KB | 158 KB |

Source: [Pexels 29848606](https://www.pexels.com/video/29848606/). Pexels license: free commercial use, no attribution required.

The hero plays it muted, looping, full-bleed at the original speed. Skip the file only on Save-Data; `prefers-reduced-motion` still plays. Pause when off-screen or the tab is hidden. `preload="metadata"`.

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

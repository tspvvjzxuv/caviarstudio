# Caviar media

## Hero loop

Liquid-chrome backdrop in `media/hero/`:

- `liquid-chrome.webm` (VP9)
- `liquid-chrome.mp4` (H.264 fallback)
- `liquid-chrome.jpg` (poster / reduced-motion still)

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

Quiet UI cues in `media/ui/` (`webm` + `mp3`): soft piano on the service cards, a short glass tap on primary buttons. Sources, licenses, and mapping: root `SOUNDS.md`.

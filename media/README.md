# Caviar media

## Hero loop

Liquid-chrome backdrop in `media/hero/`:

- `liquid-chrome.webm` (VP9)
- `liquid-chrome.mp4` (H.264 fallback)
- `liquid-chrome.jpg` (poster / reduced-motion still)

Source: [Pexels 29848606](https://www.pexels.com/video/29848606/). Pexels license: free commercial use, no attribution required.

The hero plays it muted, looping, full-bleed. It stays on the poster if `prefers-reduced-motion` is on, or if Save-Data / 2G is set.

## Work stills

Owner stills only. Drop a file here, then add one object to `WORK` in `web/src/lib/work.ts`. While that array is empty, the Work section shows an invite line and a quote button — no empty tiles.

```ts
{
  id: "cafe",
  image: "/media/cafe.webp",   // this folder
  video: "/media/cafe.mp4",    // optional muted hover film
  title: "Café Ruža",          // or { sk, en, de }
  category: "foto",            // foto | video | web, or an array
  href: "https://example.com", // optional
  layout: "feature",           // feature (full-width) | pair (two-up)
}
```

See the root `README.md` section **Work / photos**.

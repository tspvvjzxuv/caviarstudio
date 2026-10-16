# Caviar media

## Hero loop

Liquid-chrome backdrop in `media/hero/`:

- `liquid-chrome.webm` (VP9)
- `liquid-chrome.mp4` (H.264 fallback)
- `liquid-chrome.jpg` (poster / reduced-motion still)

Source: [Pexels 29848606](https://www.pexels.com/video/29848606/). Pexels license: free commercial use, no attribution required.

The hero plays it muted, looping, full-bleed. It stays on the poster if `prefers-reduced-motion` is on, or if Save-Data / 2G is set.

## Work stills

Owner stills only. The Work section reads `WORK` in `web/src/lib/work.ts` and stays hidden while that array is empty.

```js
{
  id: "everlight",
  kind: "image",          // image | video | silver
  layout: "feature",      // feature (full-width, tall) | pair (two-up)
  image: "./media/everlight.webp",
  video: "",              // optional muted mp4; leave "" until a file exists
  href: "https://thedesigns.org/foto/",
  titleKey: "wEverTitle",
  lineKey: "wEverLine",
  tags: ["tagFoto", "tagVideo"],
  altKey: "w5alt",
  silver: "c"             // fallback field if the image file is missing
}
```

See the root `README.md` section **Work / photos**.

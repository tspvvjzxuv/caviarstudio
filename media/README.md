# Caviar media

## Hero loop

Optional abstract silver/platinum video (no gold, no photos). Drop files here when ready:

- `media/hero-loop.webm`
- `media/hero-loop.mp4` (fallback)

The hero already looks for those paths, uses `img/og.png` as poster, lazy-loads, and stays on the CSS field if the files are missing, if `prefers-reduced-motion` is on, or if Save-Data / 2G is set. Rebuild with `cd web && npm run build:pages` after adding files.

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

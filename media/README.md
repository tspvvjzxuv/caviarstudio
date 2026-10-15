# Caviar media

Drop project stills and hover-preview films here. The work section reads a `WORK` array at the top of `index.html`.

```js
{
  id: "editorial",
  kind: "image",          // image | video | silver
  layout: "feature",      // feature (full-width, tall) | pair (two-up)
  image: "./media/editorial.webp",
  video: "./media/editorial.mp4", // optional; plays muted on hover
  href: "",               // optional case-study URL
  titleKey: "wEditorialTitle",
  lineKey: "wEditorialLine",
  tags: ["tagFoto"],
  altKey: "w1alt",
  silver: "a"             // a | b | c — used when kind is silver, or if image fails
}
```

- Prefer WebP stills and short muted MP4/WebM loops.
- Leave `video` as `""` until a file exists (no 404s).
- `kind: "silver"` draws a dark platinum field so the grid stays complete before photos arrive.
- Update SK / EN / DE strings in `dictionary` for the matching `titleKey` / `lineKey`.

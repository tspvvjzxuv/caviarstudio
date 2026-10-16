# Caviar media

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

# Caviar — caviarstudio.sk

Dark silver art-house studio site. **Slovak default**, English and German in lockstep.

Source of truth is a **Vite + React + Tailwind CSS v4 + shadcn/ui** app in `web/`. GitHub Pages still serves a **static build at the repo root**, so the live site stays up even before Actions is enabled.

## Deploy (keep the site live)

The repo currently publishes from **branch `main`, folder `/` (legacy)**. That cannot be changed from this agent.

1. **Fallback (already committed):** `web/` builds into `web/dist`, then `npm run build:pages` copies `index.html` + `assets/` to the repo root. Pushing `main` keeps [caviarstudio.sk](https://caviarstudio.sk) working with the existing Pages source.
2. **GitHub Actions (optional, recommended):** `.github/workflows/pages.yml` builds `web/` and deploys with `actions/deploy-pages`.

### What the owner must switch (you have to do this in the GitHub UI)

Until this is changed, the Actions workflow’s **deploy** job will fail; the committed root files still serve the site.

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** change from **Deploy from a branch** to **GitHub Actions**
3. Leave the custom domain `caviarstudio.sk` (root `CNAME` is preserved in `web/public` and in the build)
4. Keep **HTTPS** on once the certificate is ready

Do not point the apex DNS CNAME at `github.io` if you use GitHub’s A records (`185.199.108.153`–`111.153`).

## Local

```bash
cd web
npm install
npm run dev
```

Production build + write the root fallback:

```bash
cd web
npm run build:pages
```

## Content rules

- Prices: 49 / 69 / 190 / 349 EUR including VAT (always s DPH)
- Contacts: mircoft.sk@gmail.com, +421 905 173 086, Instagram /mircoft, Trnava
- Palette: near-black `#070708`, silver/platinum only — **no gold**
- No stock photos and no assistant-chosen portraits. Hero is a muted liquid-chrome loop (`media/hero/`) over a silver field. Team uses monograms.

## Work / photos

The Work section and its nav link stay **visible**. While `WORK` in `web/src/lib/work.ts` is empty, the section shows one invite line and a quote button. It does not render empty tiles or “coming soon” copy.

To add a photo (or a video):

1. Drop the file in `media/` (for example `media/cafe.webp`). Optional muted hover film: `media/cafe.mp4`.
2. Open `web/src/lib/work.ts` and add one object to `WORK`:

```ts
{ id: "cafe", image: "/media/cafe.webp", title: "Café Ruža", category: "foto" }
```

3. Rebuild: `cd web && npm run build:pages`.

Optional fields: `video`, `line`, `alt`, `href`, `layout` (`feature` = full-width, `pair` = two consecutive pair items sit side by side). `title` / `line` / `alt` can be a string (all languages) or `{ sk, en, de }`. `category` is `foto`, `video`, `web`, or an array of those.

Do not drop in stock photos. A missing file falls back to a silver field on that tile only. It is not a placeholder grid.

## Credits

Hero background loop: [Pexels video 29848606](https://www.pexels.com/video/29848606/) (liquid chrome). Pexels license allows free commercial use; attribution is not required.

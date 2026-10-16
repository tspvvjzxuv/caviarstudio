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
- No stock photos and no assistant-chosen portraits. Hero is a silver field + shader. Team uses monograms.

## Work / photos

The Work section and its nav link stay **hidden** until you add your own stills to `WORK`. Placeholder tiles and sample images are gone on purpose.

1. Put your WebP stills in `media/` (for example `media/everlight.webp`). Optional muted hover film: `media/<id>.mp4`.
2. Open `web/src/lib/work.ts` and push an item onto `WORK`. Copy the commented Everlight example. `SHOW_WORK` turns on by itself when the array is not empty.
3. Add matching SK / EN / DE strings in `web/src/lib/i18n.ts` for `titleKey`, `lineKey`, and `altKey`.
4. Rebuild: `cd web && npm run build:pages`.

Do not drop in stock photos or “coming soon” silver tiles. If a file is missing, `kind: "silver"` is only a fallback for a broken owner still, not a placeholder grid.

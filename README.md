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
- Palette: near-black `#070708`, silver/platinum type, azure `#3D8AFF` main accent, lemon `#FFE44D` secondary — **no metallic gold**. Display type is **Bodoni Moda**; body is DM Sans. Soft glass radii; translucent borders. Logo is upright CAVIAR + STUDIO · TRNAVA.
- No stock photos and no assistant-chosen portraits. Hero is a muted liquid-chrome loop (`media/hero/`) over a silver field. Team uses monograms.

## Work / photos

The Work section (**Naša práca**) lists public websites already built. Data lives in `web/src/lib/work.ts`. Live sites get a screenshot in `media/work/`; otherwise the tile is typographic (no photo). Each tile may show one small type label. The tile opens the live site; GitHub is the secondary link.

To add a site:

1. If it is live, drop a 1440×900 screenshot in `media/work/<id>.webp` (under 250 KB).
2. Push one object onto `WORK` in `web/src/lib/work.ts`.
3. Rebuild: `cd web && npm run build:pages`.

Optional fields: `video`, `line`, `alt`, `tag`, `href`, `repo`, `layout` (`feature` = full-width, `pair` = two-up). `title` / `line` / `alt` / `tag` can be a string or `{ sk, en, de }`.

Do not drop in stock photos. Do not invent clients or results.

## Credits

Hero background loop: [Pexels video 29848606](https://www.pexels.com/video/29848606/) (liquid chrome). Pexels license allows free commercial use; attribution is not required.

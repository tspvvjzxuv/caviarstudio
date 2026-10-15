# Caviar — caviarstudio.sk

Standalone GitHub Pages export. Copy **this folder’s contents** to a **new repo root** (not thedesigns.org).

Root `CNAME` in the hub repo stays `thedesigns.org`. This folder’s `CNAME` is `caviarstudio.sk`.

## Deploy

1. Create a new GitHub repository (example: `caviarstudio`).
2. Copy everything in `caviar-site/` to the **root** of that repo (`index.html`, `caviar.css`, `CNAME`, `img/`, …).
3. Push to `main` and enable **GitHub Pages** from the root of `main`.
4. In the repo: Settings → Pages → Custom domain `caviarstudio.sk` → enable HTTPS (wait for the certificate).
5. DNS at the domain registrar (apex `caviarstudio.sk`):

   **A records** to GitHub Pages:

   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

   Do **not** point a DNS CNAME for the apex at `github.io` if you use these A records. Optional `www` CNAME can go to `<user>.github.io`.

6. After DNS propagates, confirm `https://caviarstudio.sk` serves this `index.html`.

thedesigns.org `/weby/` already redirects here. Hub card on thedesigns.org links to `https://caviarstudio.sk`.

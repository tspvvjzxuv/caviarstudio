# Caviar web app

Vite + React + Tailwind v4 + shadcn/ui. See the repo root `README.md` for deploy and Pages settings.

Do not run `.agents/skills/web-artifacts-builder/scripts/init-artifact.sh` or `bundle-artifact.sh` here. Those scripts scaffold a Tailwind 3 Claude artifact. This app is already initialized and must emit a multi-file GitHub Pages build.

React performance follows `.agents/skills/vercel-react-best-practices` (Vite SPA subset). Do not migrate this app to Next.js.

```bash
npm install
npm run dev
npm run build:pages   # writes static files to the repo root for GitHub Pages
```

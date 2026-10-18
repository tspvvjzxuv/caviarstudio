# Caviar agent rules

Follow `DESIGN.md` and `.cursor/rules/caviar-design.mdc`. Skills live in `.agents/skills/` (inventory: `SKILLS.md`). Marketing context: `.agents/product-marketing.md`.

## Site

Static Vite + React + Tailwind v4 + shadcn/ui in `web/`, deployed as GitHub Pages at the repo root (`caviarstudio.sk`). Default language Slovak; EN and DE stay in lockstep. Build with `cd web && npm run build:pages`.

## Art direction

Quiet gallery, not a SaaS kit. Near-black `#070708`, pearl/silver/platinum type. **Azure `#3D8AFF` is the main accent; lemon `#FFE44D` is the secondary accent** (not metallic gold, not mustard). Azure-deep `#1D4ED8` fills primary CTAs. Two type families: Bodoni Moda (display/wordmark) and DM Sans (body/UI). Soft glass radii (`--radius` 1.5rem, pills, `rounded-3xl` cards). Translucent borders. Panels never touch. Menus use `.glass` / `.glass-panel`.

Spend boldness on the Caviar wordmark over the liquid-chrome hero loop (`media/hero/`), azure CTAs, and the Komplet card. Yellow only for small high-impact moments. Do not add numbered markers on parallel offerings (Web / Video / Foto). Process steps use lucide icons in circular glass discs — no gradient dashes.

## Motion that earns its place

- One orchestrated hero stagger after the intro veil (first-time / explanation).
- Muted looping liquid-chrome hero (`media/hero/liquid-chrome.webm` / `.mp4`, poster `.jpg`, 1080p). Always play, including when `prefers-reduced-motion` is on (Windows “Animation effects” off). Skip only on explicit Save-Data. Retry play on canplay, loadeddata, visibility, and first pointer/key/scroll. Pause when off-screen or the tab is hidden. CSS field + lazy Three.js shader if Save-Data blocks the loop. Keep the video visible under the azure/lemon glows. Hero centerpiece is the upright Bodoni CAVIAR lockup (same mark as favicon/nav). Do not clip display type or card copy.
- Button press: `transform: scale(0.97)` on `.metal-fill`, 160ms ease-out, specific properties only.
- Scroll reveals: fade in once. Do not add hover motion on every card.
- Honor `prefers-reduced-motion`. Skip the shader on mobile, coarse pointer, and Save-Data. Pause ken-burns, sheen, and marquee when off-screen.

## Conversion

Primary action is a quote: “Chcem cenovú ponuku” / “I want a quote” / “Angebot anfordern”. Keep it on the hero, on pricing cards, in the header, and on the form. Do not add a second quote button under the price notes. Secondary is “Pozrieť cenník”. Reply copy is immediate: “Ozveme sa hneď.” / “We reply right away.” / “Wir melden uns sofort.” Do not invent testimonials, client counts, limited slots, bonuses, or guaranteed results. Hero centerpiece is the CAVIAR lockup; brand tagline is “STUDIO · TRNAVA.” Work (**Naša práca**) lists **live** public websites only from `web/src/lib/work.ts`: screenshot + live href. Glass pill filters when two or more categories remain.

## SEO

Keep title, meta description, canonical, hreflang, Open Graph, Twitter, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) in sync with visible copy. Do not invent a street address, geo coordinates, opening hours, or review stars.

## Do not use on this site

WordPress, Expo, Remotion, Cloudflare, auth, databases, or programmatic city/template pages (thin content on a one-pager). Three.js only as the lazy hero shader.

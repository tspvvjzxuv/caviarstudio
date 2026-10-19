# Caviar agent rules

Follow `DESIGN.md` and `.cursor/rules/caviar-design.mdc`. Skills live in `.agents/skills/` (inventory: `SKILLS.md`). Marketing context: `.agents/product-marketing.md`.

## Site

Static Vite + React + Tailwind v4 + shadcn/ui in `web/`, deployed as GitHub Pages at the repo root (`caviarstudio.sk`). Default language Slovak; EN and DE stay in lockstep. Build with `cd web && npm run build:pages`.

## Art direction

Quiet gallery, not a SaaS kit. Near-black `#070708`, pearl/silver/platinum type. **Azure `#3D8AFF` is the main accent; lemon `#FFE44D` is the secondary accent** (not metallic gold, not mustard). Azure-deep `#1D4ED8` fills primary CTAs. Two type families: Bodoni Moda (wordmark, prices, short display names) and DM Sans (body, UI, **section headings** — 600, pearl, no hairline serif, measure `min(100%, 20ch)` of the heading font). Soft glass radii (`--radius` 1.5rem, pills, `rounded-3xl` cards). Translucent borders. Panels never touch. Menus use `.glass` / `.glass-panel`.

Spend boldness on the Caviar wordmark over the liquid-chrome hero loop (`media/hero/`), azure CTAs, the Komplet card, and the Čo robíme chrome expanders. Yellow only for small high-impact moments. Do not add numbered markers on parallel offerings (Fotky / Videá / Weby). Section kickers are tracked uppercase azure with a 6px azure dot — not a faded dash or a tiny lucide chip. There is no process / Postup section.

## Motion that earns its place

- One orchestrated hero stagger after the intro veil (first-time / explanation).
- Muted looping liquid-chrome hero (`media/hero/liquid-chrome.webm` / `.mp4`, poster `.jpg`, 1080p). Always play, including when `prefers-reduced-motion` is on (Windows “Animation effects” off). Skip only on explicit Save-Data. Retry play on canplay, loadeddata, visibility, and first pointer/key/scroll. Pause when off-screen or the tab is hidden. CSS field + lazy Three.js shader if Save-Data blocks the loop. Keep the video visible under the azure/lemon glows. Hero centerpiece is the upright Bodoni CAVIAR lockup (same mark as favicon/nav). Do not clip display type or card copy.
- Button press: `transform: scale(0.97)` on `.metal-fill`, 160ms ease-out, specific properties only. Fine-pointer pills may take a small magnetic translate (`--mx` / `--my`).
- Scroll reveals: slow fade + rise (blur-to-sharp on desktop only), staggered, expo easing. Do not add hover lift on every card.
- Honor `prefers-reduced-motion` by shortening and shrinking motion, not by removing it. Skip the shader on mobile, coarse pointer, and Save-Data. Pause ken-burns, sheen, glow, and marquee when off-screen.
- UI sound is a quiet CC0 pack in `media/ui/`: piano A4 open / quieter A3 close on service cards (~−30 dBFS, 32 ms gain ramp, 2.7 kHz low-pass), and a ~90 ms glass tap on primary pills. Prefetch and decode via Web Audio before the first gesture; play on pointerdown/keydown. Mute toggle in the header; persist `caviar-sound:v1`. No ambient autoplay. Sources and licenses: `SOUNDS.md`.

## Conversion

Primary action is a quote: “Chcem cenovú ponuku” / “I want a quote” / “Angebot anfordern”. Keep it on the hero, on pricing cards, in the header, and on the form. Do not add a second quote button under the price notes. Secondary is “Pozrieť cenník”. Reply copy is immediate: “Ozveme sa hneď.” / “We reply right away.” / “Wir melden uns sofort.” Do not invent testimonials, client counts, limited slots, bonuses, or guaranteed results. Hero centerpiece is the CAVIAR lockup; brand tagline is “STUDIO · TRNAVA.” Live website examples sit inside the Weby expander (`web/src/lib/work.ts`: desktop + mobile screenshots in a chrome laptop/phone pair, live href). Photo/video example arrays stay empty until the owner adds media.

## SEO

Keep title, meta description, canonical, hreflang, Open Graph, Twitter, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) in sync with visible copy. Do not invent a street address, geo coordinates, opening hours, or review stars.

## Do not use on this site

WordPress, Expo, Remotion, Cloudflare, auth, databases, or programmatic city/template pages (thin content on a one-pager). Three.js only as the lazy hero shader.

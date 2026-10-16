# Caviar agent rules

Follow `DESIGN.md` and `.cursor/rules/caviar-design.mdc`. Skills live in `.agents/skills/` (inventory: `SKILLS.md`). Marketing context: `.agents/product-marketing.md`.

## Site

Static Vite + React + Tailwind v4 + shadcn/ui in `web/`, deployed as GitHub Pages at the repo root (`caviarstudio.sk`). Default language Slovak; EN and DE stay in lockstep. Build with `cd web && npm run build:pages`.

## Art direction

Quiet gallery, not a SaaS kit. Near-black `#070708`, pearl/silver/platinum only. **No gold, champagne, amber, or warm yellow.** Two type families: Cormorant Garamond (display) and DM Sans (body/UI). Sharp 0–2px corners. Panels never touch.

Spend boldness on the silver/platinum hero field (optional muted `media/hero-loop` video) and the platinum Komplet card. Do not add numbered markers on parallel offerings (Web / Video / Foto). Process steps may stay numbered because they are a sequence.

## Motion that earns its place

- One orchestrated hero stagger after the intro veil (first-time / explanation).
- Ken-burns on the silver hero field, sheen, optional muted looping backdrop (`media/hero-loop.webm` / `.mp4`, poster `img/og.png`), and lazy Three.js pearl shader on capable desktops only. Skip the loop on reduced motion, Save-Data, and slow 2G. No stock photos. Do not clip display type or card copy.
- Button press: `transform: scale(0.97)` on `.metal-fill`, 160ms ease-out, specific properties only.
- Scroll reveals: fade in once. Do not add hover motion on every card.
- Honor `prefers-reduced-motion`. Skip the shader on mobile, coarse pointer, and Save-Data. Pause ken-burns, sheen, and marquee when off-screen.

## Conversion

Primary action is a quote: “Chcem cenovú ponuku” / “I want a quote” / “Angebot anfordern”. Keep it on the hero, on pricing cards, after the price notes, in the header, and on the form. Secondary is “Pozrieť cenník”. Reply copy is immediate: “Ozveme sa hneď.” / “We reply right away.” / “Wir melden uns sofort.” Do not invent testimonials, client counts, limited slots, bonuses, or guaranteed results. Headline is “Váš podnik v najlepšom svetle.” Work stays hidden until the owner adds photos to `WORK`.

## SEO

Keep title, meta description, canonical, hreflang, Open Graph, Twitter, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) in sync with visible copy. Do not invent a street address, geo coordinates, opening hours, or review stars.

## Do not use on this site

WordPress, Expo, Remotion, Cloudflare, auth, databases, or programmatic city/template pages (thin content on a one-pager). Three.js only as the lazy hero shader.

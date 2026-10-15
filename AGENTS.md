# Caviar agent rules

Follow `DESIGN.md` and `.cursor/rules/caviar-design.mdc`. Skills live in `.agents/skills/` (inventory: `SKILLS.md`). Marketing context: `.agents/product-marketing.md`.

## Site

Static Vite + React + Tailwind v4 + shadcn/ui in `web/`, deployed as GitHub Pages at the repo root (`caviarstudio.sk`). Default language Slovak; EN and DE stay in lockstep. Build with `cd web && npm run build:pages`.

## Art direction

Quiet gallery, not a SaaS kit. Near-black `#070708`, pearl/silver/platinum only. **No gold, champagne, amber, or warm yellow.** Two type families: Cormorant Garamond (display) and DM Sans (body/UI). Sharp 0–2px corners. Panels never touch.

Spend boldness on the hero still and the platinum Komplet card. Do not add numbered markers on parallel offerings (Web / Video / Foto). Process steps may stay numbered because they are a sequence.

## Motion that earns its place

- One orchestrated hero stagger after the intro veil (first-time / explanation).
- Ken-burns, silver sheen, and lazy Three.js pearl shader on capable desktops only.
- Button press: `transform: scale(0.97)` on `.metal-fill`, 160ms ease-out, specific properties only.
- Scroll reveals: fade in once. Do not add hover motion on every card.
- Honor `prefers-reduced-motion`. Skip the shader on mobile, coarse pointer, and Save-Data. Pause ken-burns, sheen, and marquee when off-screen.

## Conversion

Primary action is a quote: “Chcem cenovú ponuku” / “I want a quote” / “Angebot anfordern”. Keep it on the hero, on pricing cards, after the price notes, in the header, and on the form. Secondary is “Pozrieť cenník”. Do not invent testimonials, client counts, or results.

## SEO

Keep title, meta description, canonical, hreflang, Open Graph, Twitter, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) in sync with visible copy. Do not invent a street address, geo coordinates, opening hours, or review stars.

## Do not use on this site

WordPress, Expo, Remotion, Cloudflare, auth, databases, or programmatic city/template pages (thin content on a one-pager). Three.js only as the lazy hero shader.

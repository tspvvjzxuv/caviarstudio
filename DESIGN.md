---
version: alpha
name: Caviar
description: Dark luxury art-house studio. Cool silver and platinum on near-black, with azure and lemon accents.
colors:
  bg: "#070708"
  elev: "#0E0E12"
  surface: "#14141A"
  pearl: "#F4F5F7"
  silver: "#C5CAD3"
  platinum: "#E8EAEE"
  steel: "#9AA3AE"
  ink: "#0A0A0C"
  line: "#2A2C32"
  azure: "#3D8AFF"
  azure-deep: "#1D4ED8"
  lemon: "#FFE44D"
typography:
  display:
    fontFamily: Bodoni Moda
    fontSize: 88px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.015em
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.22em
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  20: 80px
  24: 96px
  panel-gap: 24px
  panel-pad: 32px
  gutter: 24px
  margin: 32px
  max: 1120px
rounded:
  sm: 12px
  md: 16px
  lg: 24px
  xl: 24px
  "2xl": 16px
  "3xl": 24px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.azure-deep}"
    textColor: "{colors.pearl}"
    rounded: "{rounded.full}"
    padding: 16px
  button-ghost:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.pearl}"
    rounded: "{rounded.full}"
    padding: 16px
---

# Caviar

## Overview

Caviar is a small creative studio in Trnava. The site should feel like a quiet gallery: cool, high-end, and artistic — never like a SaaS template. Near-black fields, platinum type, generous empty space, azure as the main accent, and lemon only for small high-impact moments. Motion is slow and cinematic. Copy stays plain and concrete. No metallic gold, mustard, neon kits, or invented social proof.

**Design direction (taste / frontend-design):** the idea is the material of the name — caviar black, cool silver, platinum sheen — with azure and a clean electric yellow as restrained accents, not a generic dark SaaS kit. Left-aligned display over a full-bleed still. One memorable surface (the hero wordmark), everything else quieter. Parallel offerings (Fotky / Videá / Weby) are not numbered. Agent follow-up rules live in `AGENTS.md`. Marketing facts live in `.agents/product-marketing.md`.

## Colors

The palette is pearl on caviar black. Silver and platinum stay on type. **Azure is the main accent. Lemon yellow is the secondary accent.**

- **Background (#070708):** Near-black field for every page surface.
- **Pearl (#F4F5F7):** Primary reading color and headlines.
- **Silver (#C5CAD3):** Captions and secondary metal type.
- **Platinum (#E8EAEE):** Highlights and italic display sheen.
- **Steel (#9AA3AE):** Quiet metadata.
- **Elevated (#0E0E12):** Cards and featured pricing, one step off black.
- **Azure (#3D8AFF):** Main accent — kickers, links, larger glows, tile hover borders.
- **Azure deep (#1D4ED8):** Primary CTA fills (`--primary`). Pearl on this blue must stay WCAG AA.
- **Lemon (#FFE44D):** Secondary accent — small high-impact only: price numbers, launch badges, focus rings, cursor dot, hairline sheen. Not metallic gold, not mustard.

Do not use metallic gold, champagne, or mustard. Lemon is a vivid electric / lemon-amber yellow, used sparingly so the site stays premium. Keep text contrast WCAG AA. The hero video must stay visible under the blue-to-yellow overlay glows. Menus use `.glass` / `.glass-panel` (backdrop-blur + saturate, faint azure/lemon tint, 1px inner highlight, solid fallback where `backdrop-filter` is missing, `-webkit-backdrop-filter` for Safari).

## Typography

Two families only: **Bodoni Moda** for the wordmark, price numbers, and short display names, **DM Sans** for UI, body, labels, and **section headings**.

- **Section titles:** DM Sans 600, pearl `#F4F5F7`, no gradient and no hairline serif. Size `clamp(2.5rem, 7vw, 4rem)`. Measure is `min(100%, 20ch)` of the heading font (not a squeezed body-size column), so long titles stay 1–2 lines on desktop and wrap naturally at 390px.
- **Display:** Upright Bodoni, slightly tight tracking, only where a short mark can take it (logo, prices, card names). The logo is uppercase, tracked 0.12em, weight 500.
- **Body:** 16–18px, long line-height, max ~42–58ch.
- **Labels:** Small caps via uppercase + wide tracking. Never more than two weights on a screen (400 and 500/600).
- **Section kickers:** Tracked uppercase azure (`.kicker`) with a 6px solid azure dot, vertically centered. No faded silver dash, no lucide chip. Same mark on Cenník, Kontakt, Tím, FAQ (SK/EN/DE). “Čo robíme” stays a display `h2` with no kicker.

## Layout

Mobile-first. Spacing follows the **Tailwind 4px scale** (`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64`). Content width caps at 1120px. Section padding scales from 72px to 140px.

**Panels never touch.** Service, pricing, work tiles, team, FAQ, and form cards are independent surfaces with `--gap-panel` between them (24px mobile, 32px from `md`, 40px from `xl`) and `--pad-panel` inside (24px / 32px). Do not join columns with a shared 1px divider and `gap: 0`.

The UI is built with the **full Tailwind CSS utility system** and the **full shadcn/ui component set + CSS-variable theming** ([components](https://ui.shadcn.com/docs/components), [blocks](https://ui.shadcn.com/blocks)): Button, Card, Badge, Accordion (FAQ), Tabs, Input/Select/Label (form), Navigation Menu, Sheet (mobile menu), Separator, Tooltip, Toggle Group (SK/EN/DE), Field. Tokens live in `web/src/index.css` (`@theme` semantic colors, `--radius` 1.5rem, class-based `.dark` always on). Agent skills in `.agents/skills/`: `tailwind-design-system` (wshobson/agents), `shadcn` (shadcn-ui/ui), `web-artifacts-builder` (anthropics/skills), `vercel-react-best-practices` (vercel-labs/agent-skills), and `frontend-slides` (zarazhangrui).

`web-artifacts-builder` is the React + Vite + Tailwind + shadcn stack skill. Follow its **design guidelines** (no Inter, no purple gradients, no excessive centering). Large rounding is intentional for Caviar (pills and `rounded-3xl` cards), not a default UI kit. Do **not** run its `init-artifact.sh` or Parcel `bundle-artifact.sh` for this site: those target a single Claude HTML artifact. Caviar already has Vite + Tailwind v4 + shadcn in `web/` and must ship a GitHub Pages static build (`npm run build:pages`).

`vercel-react-best-practices` is the React performance skill. Follow its SPA-relevant rules (direct imports, passive listeners, lazy state, refs for transient cursor values, no inline components, versioned localStorage). Skip Next.js/RSC-only rules. Do not introduce `next/dynamic` or a Next.js app.

Language changes use React `<ViewTransition>` (fade) triggered with `startTransition`. Header, footer, grain, and cursor are isolated so chrome does not cross-fade. `prefers-reduced-motion` zeros view-transition durations. This is a one-page site: no directional page slides (those are for hierarchical routes).

`frontend-slides` (zarazhangrui) is for presentation-style beats on this site, not a 16:9 HTML deck: one orchestrated hero stagger after the intro veil, silver grid atmosphere, hairline chrome, expo easing, `prefers-reduced-motion`. Do not copy its mustard/gold Studio templates or reflow the marketing page as a fixed 1920×1080 stage. Caviar’s lemon is a restrained secondary accent, not a slide-deck fill.

Project skills inventory: `SKILLS.md`. Use copywriting/humanizer/SEO skills for SK/EN/DE prose; never invent testimonials, counts, or stock photography. Three.js is a lazy silver/pearl hero shader on desktop (CSS silver-field fallback on mobile, coarse pointer, Save-Data, and `prefers-reduced-motion`). WordPress, Expo, and Remotion skills stay installed but unused: this is not WordPress, and a CSS silver field is lighter than a Remotion runtime.

Source: `web/` (Vite + React). GitHub Pages still needs a static output: commit the built `index.html` + `assets/` at the repo root **and** use `.github/workflows/pages.yml`. Do not rely on GitHub Pages to run `npm` unless Pages source is **GitHub Actions**.

The “Čo robíme” block sits immediately under the hero: a real display `h2` (not a tracked kicker), a one-line lead, and three expandable chrome cards — **Fotky / Videá / Weby** (EN Photos / Videos / Websites, DE Fotos / Videos / Websites). One card open at a time. Clicking a card reveals a “Napríklad dostanete” list (quality and size included) plus a data-driven examples area. Weby shows the live website tiles. Fotky and Videá show nothing until the owner adds media — no empty tiles. Page order after that is Cenník, then Kontakt, then Tím and FAQ. Visible address is **Trnava** only (JSON-LD may still use `addressCountry: SK`).

## Elevation & Depth

Hierarchy comes from tonal layers, film grain, translucent glass borders, and glass chrome — not heavy drop shadows. Featured surfaces (Caviar Komplet) use a faint azure border and an azure-to-lemon wash. Hero depth is a muted liquid-chrome loop (`media/hero/liquid-chrome.webm` / `.mp4`, poster `.jpg`) on near-black, with grain, a light sweep, a blue glow (left) and lemon glow (right), a vignette, and a dark gradient so the wordmark stays readable and the video stays visible. The loop plays even when `prefers-reduced-motion` is on (it is a slow muted ambient clip). Skip only on explicit Save-Data; pause it off-screen. The hero centerpiece is the upright Bodoni **CAVIAR** lockup (silver gradient, hairline, STUDIO · TRNAVA), not a pearl mark or italic wordmark. The CSS silver field and lazy Three.js shader remain the fallback. Cards use open overflow so serif italic never clips the frame.

## Shapes

Soft glass. `--radius` is 1.5rem. Cards, frames, tiles, dialogs, and dropdowns are `rounded-3xl`. Buttons and language chips are `rounded-full` pills. Inputs are `rounded-2xl`. Icon containers are circles. Borders are translucent white/azure at about 8–15% alpha — never a hard solid outline.

## Components

- **Logo:** Upright uppercase **CAVIAR** in Bodoni Moda 500, letter-spacing 0.12em, silver gradient `#ffffff → #d9dee6 → #8f98a6`. Thin silver hairline (`#c9d0da`, fading at the ends) under the word, then **STUDIO · TRNAVA** in Bodoni 400, `#a7afbb`, tracked uppercase. Same lockup on the hero, nav, intro, footer, favicon, and apple-touch. No pearl circle, no italic. Hero size: about 80% width on 390px, clamp up to ~10.5rem on desktop. Azure/lemon glows stay around the hero, not in the letters.
- **Icons:** Lucide line icons, stroke 1.75, round caps/joins, overflow visible so nothing clips. Menu and contact chips sit in circular `.icon-disc` frosted-glass circles (azure wash, lemon hairline). Form selects and Fotky/Videá/Weby expanders use a silver-hairline `.glass-mark` / `.service-mark` disc with a thin centered plus or chevron. No decorative gradient dashes.
- **Buttons:** Primary is an azure-deep metal fill with pearl type (lemon hairline inset), fully pill-shaped. Ghost/outline uses a translucent glass border. Uppercase labels, 52px min height, full width on small screens.
- **Feature / service cards:** Super-mirror chrome (`.service-chrome`): liquid-silver gradient, azure and lemon edge light, translucent border, `rounded-3xl`. Slow sheen sweep on hover/open; pause the sheen under `prefers-reduced-motion`. Three-up on desktop with `--gap-panel`. Each card is a keyboard-accessible expander (`aria-expanded`, thin plus in a silver-hairline glass disc that rotates into ×). Azure/lemon glows sit in a full-width section field plus a large soft bloom behind each card; they fade to transparent past the chrome, with `overflow-x: clip` only on `html`. Names only on the face — Fotky, Videá, Weby. The “what you get” list and examples sit in the open panel, not on the closed card.
- **Pricing cards:** Shared lemon launch-price pill; launch amounts in lemon. Caviar Komplet is visually louder: faint azure border, azure-to-lemon wash, wider measure. Same gap as other panel grids. Foto / video / one-pager lists live in Čo robíme. The E-shop card lists what is included (and a short gateway note) on the card itself.
- **Header / menus:** Fixed `.glass` navbar over the hero so the loop shows through. Mobile sheet, language switcher, select, tooltip, popover, dropdown, and dialog use `.glass` / `.glass-panel`.
- **FAQ:** Each question is its own bordered panel (accordion), not a flush stacked divider list.
- **Form fields:** Bordered inputs on elevated ground (shadcn-style field), not underline-only. Select chevrons sit in a 32px silver-hairline glass disc, flex-centered in a square with even right padding (`pr-2.5`); native `appearance` is reset.
- **Work tiles:** Live website examples sit inside the **Weby** expander in Čo robíme. Data in `web/src/lib/work.ts`: desktop `image` (1440×900) plus `imageMobile` (390×844), live href. Each tile is a CSS/SVG dark-chrome laptop + overlapping phone pair (no third-party mockup assets), azure/lemon glow, slow tilt/sheen on hover. Title, short description, and category labels sit under the pair. The whole pair is one live-site link — no GitHub chips, repo links, or tech/hosting talk. Photo and video example arrays stay empty until the owner adds media; render nothing rather than empty tiles.
- **Team tiles:** Serif monograms on brushed silver fields instead of missing photos.
- **Footer:** Hairline bar with stacked contacts (no middle-dot meta string). Azure link hover. Study shadcn navbar/footer block rhythm, keep Caviar type.

## Do's and Don'ts

- Do keep Slovak as the default language, with EN and DE in lockstep
- Do explain what Caviar does in one plain sentence under the hero headline
- Do respect `prefers-reduced-motion` for ken-burns, sheen, reveals, and cursor
- Do leave a visible gap between every card/panel on mobile and desktop
- Don't use metallic gold, mustard, or champagne metals; lemon yellow is the only yellow, and only in small doses
- Don't use Inter or purple/violet gradients (web-artifacts-builder anti-slop). Rounding is the Caviar glass system, not a default kit.
- Don't invent testimonials, client counts, limited slots, or guaranteed results (no “more bookings”, no “first 10” counters)
- Don't show the words TODO or Placeholder anywhere in the UI
- Don't add a Node/Tailwind build that GitHub Pages must run unless Pages source is GitHub Actions; always keep a committed static fallback at the repo root
- Do keep prices 59 / 79 / 219 / 379 / 590 EUR including VAT. Video Reel is 59 EUR (three reels 129 EUR). E-shop is 590 EUR one-time plus 19 EUR/month (server, backups, maintenance).
- Do keep contacts: mircoft.sk@gmail.com, +421 905 173 086, Instagram /mircoft, address **Trnava** only
- Do pause ken-burns, sheen, and marquee when off-screen or the tab is hidden

## Motion that earns its place

Motion is slow and cinematic (`cubic-bezier(0.16, 1, 0.3, 1)`, 700–1200 ms). Scroll reveals fade, rise, and on fine pointers blur-to-sharp, once, staggered. Service chrome keeps a slow sheen sweep and a quiet azure/lemon glow pulse (opacity only). Hero logo and field ease on a gentle parallax. Fotky / Videá / Weby panels open and close on a long `1fr`↔`0fr` height ease with a short content stagger. Primary pills take a small magnetic translate on fine pointers. Animate `transform` and `opacity` (blur only on desktop). Do not add hover lift on every card. `prefers-reduced-motion` shortens and shrinks motion — it does not snap everything off. Primary CTA press still scales to 0.97.

Quiet tactile UI samples (`media/ui/`, CC0) play only after a user gesture, never as ambient loops. Service cards and primary pills share one short glass tap (phone-screen finger tap). Open is at full voice; close is the same tap quieter; buttons sit in between. Default on. A round glass mute disc in the header remembers `localStorage` key `caviar-sound:v1`. See `SOUNDS.md`.

## Conversion

One primary action: request a quote. Keep that CTA in the header, hero, each price card, and on the form. Do not add a second quote button under the price notes. Secondary is see pricing. No fake social proof, slot counters, or promised booking results. Hero centerpiece is the CAVIAR lockup; brand tagline is “STUDIO · TRNAVA.” Explain Caviar in one plain sentence under the lockup.

## SEO

Title, meta, Open Graph, hreflang, canonical, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) must match visible copy. Do not invent a street, geo pin, hours, or reviews. Programmatic SEO city pages are out of scope on this one-pager.

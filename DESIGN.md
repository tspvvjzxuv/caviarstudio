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
    fontFamily: Cormorant Garamond
    fontSize: 88px
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Cormorant Garamond
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
  none: 0px
  sm: 2px
  md: 4px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.azure-deep}"
    textColor: "{colors.pearl}"
    rounded: "{rounded.none}"
    padding: 16px
  button-ghost:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.pearl}"
    rounded: "{rounded.none}"
    padding: 16px
---

# Caviar

## Overview

Caviar is a small creative studio in Trnava. The site should feel like a quiet gallery: cool, high-end, and artistic — never like a SaaS template. Near-black fields, platinum type, generous empty space, azure as the main accent, and lemon only for small high-impact moments. Motion is slow and cinematic. Copy stays plain and concrete. No metallic gold, mustard, neon kits, or invented social proof.

**Design direction (taste / frontend-design):** the idea is the material of the name — caviar black, cool silver, platinum sheen — with azure and a clean electric yellow as restrained accents, not a generic dark SaaS kit. Left-aligned display over a full-bleed still. One memorable surface (the hero), everything else quieter. Parallel offerings (Web / Video / Foto) are not numbered; the four-step process is, because it is a sequence. Agent follow-up rules live in `AGENTS.md`. Marketing facts live in `.agents/product-marketing.md`.

## Colors

The palette is pearl on caviar black. Silver and platinum stay on type. **Azure is the main accent. Lemon yellow is the secondary accent.**

- **Background (#070708):** Near-black field for every page surface.
- **Pearl (#F4F5F7):** Primary reading color and headlines.
- **Silver (#C5CAD3):** Captions and secondary metal type.
- **Platinum (#E8EAEE):** Highlights and italic display sheen.
- **Steel (#9AA3AE):** Quiet metadata.
- **Elevated (#0E0E12):** Cards and featured pricing, one step off black.
- **Azure (#3D8AFF):** Main accent — kickers, links, process numbers, larger glows, tile hover borders.
- **Azure deep (#1D4ED8):** Primary CTA fills (`--primary`). Pearl on this blue must stay WCAG AA.
- **Lemon (#FFE44D):** Secondary accent — small high-impact only: price numbers, launch badges, focus rings, cursor dot, hairline sheen. Not metallic gold, not mustard.

Do not use metallic gold, champagne, or mustard. Lemon is a vivid electric / lemon-amber yellow, used sparingly so the site stays premium. Keep text contrast WCAG AA. The hero video must stay visible under the blue-to-yellow overlay glows. Menus use `.glass` / `.glass-panel` (backdrop-blur + saturate, faint azure/lemon tint, 1px inner highlight, solid fallback where `backdrop-filter` is missing, `-webkit-backdrop-filter` for Safari).

## Typography

Two families only: **Cormorant Garamond** for display and titles, **DM Sans** for UI, body, and labels.

- **Display:** Large, slightly tight tracking, italic second line in a silver metallic wash.
- **Body:** 16–18px, long line-height, max ~42–58ch.
- **Labels:** Small caps via uppercase + wide tracking. Never more than two weights on a screen (400 and 500/600).

## Layout

Mobile-first. Spacing follows the **Tailwind 4px scale** (`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64`). Content width caps at 1120px. Section padding scales from 72px to 140px.

**Panels never touch.** Service, pricing, process, work, team, FAQ, and form cards are independent surfaces with `--gap-panel` between them (24px mobile, 32px from `md`, 40px from `xl`) and `--pad-panel` inside (24px / 32px). Do not join columns with a shared 1px divider and `gap: 0`.

The UI is built with the **full Tailwind CSS utility system** and the **full shadcn/ui component set + CSS-variable theming** ([components](https://ui.shadcn.com/docs/components), [blocks](https://ui.shadcn.com/blocks)): Button, Card, Badge, Accordion (FAQ), Tabs, Input/Select/Label (form), Navigation Menu, Sheet (mobile menu), Separator, Tooltip, Toggle Group (SK/EN/DE), Field. Tokens live in `web/src/index.css` (`@theme` semantic colors, `--radius` 2px, class-based `.dark` always on). Agent skills in `.agents/skills/`: `tailwind-design-system` (wshobson/agents), `shadcn` (shadcn-ui/ui), `web-artifacts-builder` (anthropics/skills), `vercel-react-best-practices` (vercel-labs/agent-skills), and `frontend-slides` (zarazhangrui).

`web-artifacts-builder` is the React + Vite + Tailwind + shadcn stack skill. Follow its **design guidelines** (no Inter, no purple gradients, no excessive centering, no uniform large rounding). Do **not** run its `init-artifact.sh` or Parcel `bundle-artifact.sh` for this site: those target a single Claude HTML artifact. Caviar already has Vite + Tailwind v4 + shadcn in `web/` and must ship a GitHub Pages static build (`npm run build:pages`).

`vercel-react-best-practices` is the React performance skill. Follow its SPA-relevant rules (direct imports, passive listeners, lazy state, refs for transient cursor values, no inline components, versioned localStorage). Skip Next.js/RSC-only rules. Do not introduce `next/dynamic` or a Next.js app.

Language changes use React `<ViewTransition>` (fade) triggered with `startTransition`. Header, footer, grain, and cursor are isolated so chrome does not cross-fade. `prefers-reduced-motion` zeros view-transition durations. This is a one-page site: no directional page slides (those are for hierarchical routes).

`frontend-slides` (zarazhangrui) is for presentation-style beats on this site, not a 16:9 HTML deck: one orchestrated hero stagger after the intro veil, speaker-led process steps (one idea each), silver grid atmosphere, hairline chrome, expo easing, `prefers-reduced-motion`. Do not copy its mustard/gold Studio templates or reflow the marketing page as a fixed 1920×1080 stage. Caviar’s lemon is a restrained secondary accent, not a slide-deck fill.

Project skills inventory: `SKILLS.md`. Use copywriting/humanizer/SEO skills for SK/EN/DE prose; never invent testimonials, counts, or stock photography. Three.js is a lazy silver/pearl hero shader on desktop (CSS silver-field fallback on mobile, coarse pointer, Save-Data, and `prefers-reduced-motion`). WordPress, Expo, and Remotion skills stay installed but unused: this is not WordPress, and a CSS silver field is lighter than a Remotion runtime.

Source: `web/` (Vite + React). GitHub Pages still needs a static output: commit the built `index.html` + `assets/` at the repo root **and** use `.github/workflows/pages.yml`. Do not rely on GitHub Pages to run `npm` unless Pages source is **GitHub Actions**.

The “Čo robíme” block sits immediately under the hero: a real display `h2` (not a tracked kicker), a one-line lead, three equal Web / Video / Foto cards, plus a full-width “Pre koho” panel. Visible address is **Trnava** only (JSON-LD may still use `addressCountry: SK`).

## Elevation & Depth

Hierarchy comes from tonal layers, film grain, thin azure-to-lemon hairlines, and glass chrome — not heavy drop shadows. Featured surfaces (Caviar Komplet) use an azure ring and a faint azure-to-lemon wash. Hero depth is a muted liquid-chrome loop (`media/hero/liquid-chrome.webm` / `.mp4`, poster `.jpg`) on near-black, with grain, a light sweep, a blue glow (left) and lemon glow (right), a vignette, and a dark gradient so the headline stays readable and the video stays visible. The loop plays even when `prefers-reduced-motion` is on (it is a slow muted ambient clip). Skip only on explicit Save-Data; pause it off-screen. No decorative ghost “Caviar” wordmark in the hero. The CSS silver field and lazy Three.js shader remain the fallback. Cards and hero type use open overflow and 1.08–1.15 display leading so serif italic never clips the frame.

## Shapes

Architectural sharpness. Buttons, cards, and inputs are square (0–2px). The only full round is the 7px pearl kicker dot. Do not mix pill CTAs with sharp cards.

## Components

- **Buttons:** Primary is an azure-deep metal fill with pearl type (lemon hairline inset). Ghost is a hairline that warms to lemon on hover. Uppercase labels, 52px min height, full width on small screens.
- **Feature / service cards:** Elevated `#0E0E12` surface, 1px steel border, equal padding, hover hairline goes azure. Three-up on desktop with `--gap-panel`.
- **Pricing cards:** Shared lemon launch-price badge; launch amounts in lemon. Caviar Komplet is visually louder: azure frame, faint azure-to-lemon wash, wider measure. Same gap as other panel grids.
- **Header / menus:** Fixed `.glass` navbar over the hero so the loop shows through. Mobile sheet, language switcher, select, tooltip, popover, dropdown, and dialog use `.glass` / `.glass-panel`.
- **FAQ:** Each question is its own bordered panel (accordion), not a flush stacked divider list.
- **Form fields:** Bordered inputs on elevated ground (shadcn-style field), not underline-only.
- **Work tiles:** Section and nav stay visible. Empty `WORK` is one invite line plus a quote CTA — no empty tiles, no “Čoskoro” grid. Each owner item in `web/src/lib/work.ts` (image or video, title, category, optional link) becomes a large Attic Salt–style tile (hover parallax, scroll shift, hover film, custom cursor). Silver fallback only if that file is missing. Never “TODO”, “Placeholder”, or filler tiles.
- **Team tiles:** Serif monograms on brushed silver fields instead of missing photos.
- **Footer:** Hairline bar with stacked contacts (no middle-dot meta string). Azure link hover. Study shadcn navbar/footer block rhythm, keep Caviar type.

## Do's and Don'ts

- Do keep Slovak as the default language, with EN and DE in lockstep
- Do explain what Caviar does in one plain sentence under the hero headline
- Do respect `prefers-reduced-motion` for ken-burns, sheen, reveals, and cursor
- Do leave a visible gap between every card/panel on mobile and desktop
- Don't use metallic gold, mustard, or champagne metals; lemon yellow is the only yellow, and only in small doses
- Don't use Inter, purple/violet gradients, or uniformly large rounded corners (web-artifacts-builder anti-slop)
- Don't invent testimonials, client counts, limited slots, or guaranteed results (no “more bookings”, no “first 10” counters)
- Don't show the words TODO or Placeholder anywhere in the UI
- Don't add a Node/Tailwind build that GitHub Pages must run unless Pages source is GitHub Actions; always keep a committed static fallback at the repo root
- Do keep prices 49 / 69 / 190 / 349 EUR including VAT
- Do keep contacts: mircoft.sk@gmail.com, +421 905 173 086, Instagram /mircoft, address **Trnava** only
- Do pause ken-burns, sheen, and marquee when off-screen or the tab is hidden

## Motion that earns its place

Animate only what has a job: the first-load hero stagger (explanation), ken-burns/sheen/shader on the still (atmosphere), accordion and sheet (spatial), metal-fill press scale 0.97 (feedback). Do not add hover lift on every card. Honor `prefers-reduced-motion`. Primary CTA press uses `transition` on `transform` and `background-image` only, 160ms ease-out.

## Conversion

One primary action: request a quote. Keep that CTA in the header, hero, each price card, after the price notes, and on the form. Secondary is see pricing. No fake social proof, slot counters, or promised booking results. Hero headline: “Váš podnik v najlepšom svetle.”

## SEO

Title, meta, Open Graph, hreflang, canonical, `robots.txt`, `sitemap.xml`, and JSON-LD (`LocalBusiness` + `ProfessionalService`, `WebSite`, `FAQPage`) must match visible copy. Do not invent a street, geo pin, hours, or reviews. Programmatic SEO city pages are out of scope on this one-pager.

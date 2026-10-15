---
version: alpha
name: Caviar
description: Dark luxury art-house studio. Cool silver and platinum on near-black. No gold.
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
typography:
  display:
    fontFamily: Cormorant Garamond
    fontSize: 88px
    fontWeight: 400
    lineHeight: 0.9
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
    backgroundColor: "{colors.platinum}"
    textColor: "{colors.ink}"
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

Caviar is a small creative studio in Trnava. The site should feel like a quiet gallery: cool, high-end, and artistic — never like a SaaS template. Near-black fields, platinum type, generous empty space, and a single silver accent language. Motion is slow and cinematic. Copy stays plain and concrete. No gold, champagne, neon, or invented social proof.

## Colors

The palette is pearl on caviar black, with silver as the only metal.

- **Background (#070708):** Near-black field for every page surface.
- **Pearl (#F4F5F7):** Primary reading color and headlines.
- **Silver (#C5CAD3):** Kickers, captions, secondary metal.
- **Platinum (#E8EAEE):** Highlights, primary buttons, italic display sheen.
- **Steel (#9AA3AE):** Hairlines and quiet metadata.
- **Elevated (#0E0E12):** Cards and featured pricing, one step off black.

Do not introduce warm yellow, gold, or amber. Everlight samples may be desaturated to sit in this register.

## Typography

Two families only: **Cormorant Garamond** for display and titles, **DM Sans** for UI, body, and labels.

- **Display:** Large, slightly tight tracking, italic second line in a silver metallic wash.
- **Body:** 16–18px, long line-height, max ~42–58ch.
- **Labels:** Small caps via uppercase + wide tracking. Never more than two weights on a screen (400 and 500/600).

## Layout

Mobile-first. Spacing follows the **Tailwind 4px scale** (`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64`). Content width caps at 1120px. Section padding scales from 72px to 140px.

**Panels never touch.** Service, pricing, process, work, team, FAQ, and form cards are independent surfaces with `--gap-panel` between them (16px mobile, 24px from 720px, 32px from 1080px) and `--pad-panel` inside (24px / 32px). Do not join columns with a shared 1px divider and `gap: 0`.

Component anatomy (card padding, feature grids, pricing, FAQ accordion, form fields, navbar, footer) follows [shadcn/ui](https://ui.shadcn.com/) and [shadcn blocks](https://ui.shadcn.com/blocks), restyled in Caviar metals. The site is static GitHub Pages: keep vanilla CSS on this scale, or commit a precompiled stylesheet. Do not add a deploy-time Tailwind build.

The “Čo robíme” strip sits immediately under the hero as three equal cards plus a full-width “Pre koho” panel.

## Elevation & Depth

Hierarchy comes from tonal layers, film grain, and 1px steel hairlines — not drop shadows. Featured surfaces (Caviar Komplet) use a platinum hairline and a faint inner silver wash. Hero depth is a slow ken-burns still, a moving silver sheen, and a bottom fade into black.

## Shapes

Architectural sharpness. Buttons, cards, and inputs are square (0–2px). The only full round is the 7px pearl kicker dot. Do not mix pill CTAs with sharp cards.

## Components

- **Buttons:** Primary is a platinum metal fill with dark ink type. Ghost is a hairline. Uppercase labels, 52px min height, full width on small screens.
- **Feature / service cards:** Elevated `#0E0E12` surface, 1px steel border, equal padding, hover hairline brightens. Three-up on desktop with `--gap-panel`.
- **Pricing cards:** Shared launch-price badge. Caviar Komplet is visually louder: platinum frame, elevated ground, wider measure. Same gap as other panel grids.
- **FAQ:** Each question is its own bordered panel (accordion), not a flush stacked divider list.
- **Form fields:** Bordered inputs on elevated ground (shadcn-style field), not underline-only.
- **Work tiles:** Dark silver art-directed fields or grayscale stills. Captions are quiet style words. Never “TODO” or “Placeholder”.
- **Team tiles:** Serif monograms on brushed silver fields instead of missing photos.
- **Header / footer:** Sticky blurred navbar; footer is a hairline bar with uppercase meta. Study shadcn navbar/footer block rhythm, keep Caviar type.

## Do's and Don'ts

- Do keep Slovak as the default language, with EN and DE in lockstep
- Do explain what Caviar does in one plain sentence under the hero headline
- Do respect `prefers-reduced-motion` for ken-burns, sheen, reveals, and cursor
- Do leave a visible gap between every card/panel on mobile and desktop
- Don't use gold, warm yellow, or champagne metals
- Don't invent testimonials, client counts, or results
- Don't show the words TODO or Placeholder anywhere in the UI
- Don't add a Node/Tailwind build that GitHub Pages must run
- Do keep prices 49 / 69 / 190 / 349 EUR including VAT
- Do keep contacts: mircoft.sk@gmail.com, +421 905 173 086, Instagram /mircoft, Trnava

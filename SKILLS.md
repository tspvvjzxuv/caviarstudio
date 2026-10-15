# Installed agent skills

Project-scope copies live in `.agents/skills/` (lock: `skills-lock.json`). Installed with `npx skills add … -y --copy`. MCP servers from workflow bundles were skipped.

## Already in the repo before this pass

- `wshobson/agents@tailwind-design-system`
- `shadcn-ui/ui@shadcn` (+ `migrate-radix-to-base`)
- `anthropics/skills@web-artifacts-builder`
- `vercel-labs/agent-skills@vercel-react-best-practices`

## Named owner installs

- `vercel-labs/agent-skills@vercel-react-view-transitions`
- `vercel-labs/agent-skills@vercel-composition-patterns`
- `zarazhangrui/frontend-slides`
- `ibelick/ui-skills` (8 skills)
- `remotion-dev/skills@remotion-best-practices`
- `CloudAI-X/threejs-skills` (10 skills)
- `Automattic/agent-skills@wp-block-development` (install only; site is not WordPress)
- `Automattic/agent-skills@wp-block-themes` (install only)
- `coreyhaines31/marketingskills` (full set, including copywriting, marketing-psychology, content-strategy)
- `blader/humanizer`
- `anthropics/skills@frontend-design`

## AgenticSkills.io workflow skills (22 bundles)

Skills from https://agenticskills.io/workflows were installed; MCP servers were not. The queued `npx skills add` list was re-run at project scope (`-y --copy`); already-present skills were reinstalled in place. `seo-audit` now comes from `coreyhaines31/marketingskills` (SEO Content Sprint), not AgriciDaniel.

**Failed or renamed**

- `Auriti-Labs/geo-optimizer-skill` — repo has no `SKILL.md`
- `expo/skills@building-native-ui` — gone; installed `expo-native-ui` instead
- `expo/skills@expo-deployment` — gone; installed `eas-hosting` and `eas-app-stores`
- `trailofbits/skills@static-analysis` — name mismatch; installed `differential-review` plus the rest of the Trail of Bits skills set (includes Semgrep)
- `better-auth/skills@create-auth-skill` — skill is named `create-auth`
- Full Development Lifecycle bundle — 0 skills (MCP-only); skipped

Use design/motion/copy/SEO skills on this static site. Follow `AGENTS.md` and `.agents/product-marketing.md`. Three.js is used only as a lazy silver/pearl hero shader with a static fallback. Do not apply WordPress, Expo, Cloudflare, auth, Remotion, or programmatic SEO page factories unless a later task explicitly asks for them.

## AgenticSkills.io marketing-site bundles (this pass)

Installed at project scope; MCP servers skipped. Already-present skills were not reinstalled.

- Frontend Development: `vercel-react-best-practices`, `frontend-design`
- Distinctive UI Without a Mockup: `design-taste-frontend`, `emil-design-eng`, `animate` (Inspo MCP skipped)
- Design-to-Code (skills only): `frontend-design`, `figma-implement-design`, `vercel-react-best-practices` (Figma MCP skipped)
- SEO Content Sprint: `seo-audit`, `content-strategy`, `copywriting`, `schema` (`AgriciDaniel/claude-seo` already present)
- Programmatic SEO: skills present, **not used** (one-pager, no unique per-URL data)
- Founder Marketing Stack: `product-marketing`, `content-strategy`, `marketing-ideas`, `charlie947/social-media-skills` (`x-article-publisher` unused)
- Conversion Optimization Loop: `cro`, `copywriting`, `pricing` (`analytics` unused: no GA4 id)
- AI Search Visibility Stack: `seo-aeo-best-practices`, `schema`, `zubair-trabzada/geo-seo-claude` (`Auriti-Labs/geo-optimizer-skill` failed: no SKILL.md)
- Marketing & Growth Engine: `coreyhaines31/marketingskills`
- Disciplined Development: `obra/superpowers` (brainstorming, TDD, systematic-debugging, verification-before-completion, …)

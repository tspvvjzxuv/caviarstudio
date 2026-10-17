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

## Additional owner installs (2026-10-17)

Installed with `npx skills add … -y --copy` from skills.sh sources. Already-present skills were skipped.

| Request | Action | Source |
|---|---|---|
| MCP Builder | installed | `npx skills add anthropics/skills --skill mcp-builder -y --copy` ([skills.sh](https://www.skills.sh/anthropics/skills/mcp-builder), GitHub `anthropics/skills`) |
| Playwright | installed | `npx skills add microsoft/playwright-cli --skill playwright-cli -y --copy` ([skills.sh](https://www.skills.sh/microsoft/playwright-cli), 187.5K installs; official Playwright CLI skill). Runner-up: `currents-dev/playwright-best-practices-skill` at 94.9K |
| Front-End Design | skipped | already present: `anthropics/skills@frontend-design` |
| Code Review | skipped | already present: `getsentry/skills@code-review` |
| Refactor | installed | `npx skills add tartinerlabs/skills --skill refactor -y --copy` ([skills.sh](https://www.skills.sh/tartinerlabs/skills/refactor); most popular skill named `refactor`, 356 installs) |

## AgenticSkills.io — all 22 workflow bundles

Each bundle page on https://agenticskills.io/workflows was opened for the exact `npx skills add` commands. MCP servers were not installed. Already-present skills were skipped.

| Bundle | Skills installed | Status |
|---|---|---|
| The SEO Content Sprint | `seo-audit`, `content-strategy`, `copywriting`, `schema`, `AgriciDaniel/claude-seo` | present (skipped) |
| The Programmatic SEO Page Factory | `programmatic-seo`, `content-research-writer`, `schema` | present (skipped); unused on this one-pager |
| The Founder Marketing Stack | `product-marketing`, `charlie947/social-media-skills`, `marketing-ideas`, `content-strategy`, `x-article-publisher` | present (skipped); `x-article-publisher` unused |
| The Newsletter Engine | `email-marketing-bible`, `content-research-writer`, `copywriting` | present (skipped); unused |
| The Conversion Optimization Loop | `cro`, `copywriting`, `analytics`, `pricing` | present (skipped); `analytics` unused (no GA4 id) |
| The AI Search Visibility Stack | `seo-aeo-best-practices`, `schema`, `zubair-trabzada/geo-seo-claude` | present (skipped) |
| Auth Flow (Better Auth + shadcn + Resend) | `better-auth-best-practices`, `create-auth`, `shadcn`, `resend`, `frontend-design` | present (skipped); unused on this static site |
| Full-Stack SaaS | `vercel-react-best-practices`, `frontend-design`, `supabase-postgres-best-practices`, `better-auth-best-practices`, `deploy-to-vercel` | present (skipped); DB/auth unused |
| Disciplined Development | `brainstorming`, `using-superpowers`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `subagent-driven-development`, `using-git-worktrees` | present (skipped) |
| Frontend Development | `vercel-react-best-practices`, `frontend-design` | present (skipped) |
| Design-to-Code | `frontend-design`, `figma-implement-design`, `vercel-react-best-practices` | present (skipped); Figma MCP skipped |
| Distinctive UI Without a Mockup | `design-taste-frontend`, `emil-design-eng`, `animate` | present (skipped); Inspo MCP skipped |
| Mobile App Development | `vercel-react-native-skills`, `expo-native-ui`, `eas-hosting`, `eas-app-stores`, `ui-ux-pro-max` | present (skipped); unused |
| Indie Hacker MVP | `frontend-design`, `deploy-to-vercel` | present (skipped) |
| Database & Backend | `supabase-postgres-best-practices`, `better-auth-best-practices` | present (skipped); unused |
| Security Code Review | `differential-review`, `semgrep` (+ rest of Trail of Bits set), `code-review` | present (skipped); unused on this static site |
| Debug Production Issues | `sentry`, `systematic-debugging` | present (skipped); unused |
| DevOps & Monitoring | `deploy-to-vercel` | present (skipped); MCP skipped |
| Cloudflare Edge Stack | `vercel-react-best-practices`, `frontend-design`, `wrangler` | present (skipped); unused |
| Marketing & Growth Engine | `coreyhaines31/marketingskills` (full set) | present (skipped) |
| Document Creation Suite | `docx`, `pptx`, `xlsx`, `pdf` | present (skipped); unused |
| Full Development Lifecycle | none | MCP-only (0 skills); skipped |

**Failed on exact page commands**

- `Auriti-Labs/geo-optimizer-skill` — cloned; no `SKILL.md`
- `trailofbits/skills@static-analysis` and `trailofbits/skills/static-analysis` — no skill by that name; Semgrep + `differential-review` cover the same job
- `expo/skills@building-native-ui` — gone; `expo-native-ui` is installed
- `expo/skills@expo-deployment` — gone; `eas-hosting` + `eas-app-stores` are installed
- `better-auth/skills@create-auth-skill` — skill is named `create-auth` (installed)

Use design/motion/copy/SEO/conversion skills on this static site. Follow `AGENTS.md` and `.agents/product-marketing.md`. Three.js is used only as a lazy silver/pearl hero shader with a static fallback. Do not apply WordPress, Expo, Cloudflare, auth, Remotion, or programmatic SEO page factories unless a later task explicitly asks for them.

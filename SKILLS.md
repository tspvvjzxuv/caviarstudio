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

Use design/motion/copy/SEO skills on this static site. Three.js is used only as a lazy silver/pearl hero shader with a static fallback. Do not apply WordPress, Expo, Cloudflare, auth, or Remotion unless a later task explicitly asks for them.

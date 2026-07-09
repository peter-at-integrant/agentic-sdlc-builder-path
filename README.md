# Agentic SDLC Builder Path

**Live:** https://agentic-sdlc-builder-path.petersobhy.workers.dev

An interactive, open learning path for becoming an **Agentic SDLC builder** — ten hands-on modules covering skills, hooks, commands, rules, MCP, sub-agents, routines, plugins, AGENTS.md, and composition. Each module teaches on a four-part depth-review rubric (**why · when/not · quality · composition**), with a lab, a self-check, and a graded quiz. Finish by composing a ≥3-layer proof of concept in the built-in PoC Builder.

Free to run and host. Progress is stored locally in the browser (Phase 1); accounts + GitHub sync land in Phase 2.

## Tech

- **Vite + React + TypeScript** single-page app
- **react-router** for navigation, **react-markdown** for content, **Tailwind** for styling
- Fully static build → deploys to **Cloudflare Pages** (or any static host). No backend in Phase 1.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the built site
```

## Deploy to Cloudflare (free tier)

Deployed as a **Cloudflare Worker with static assets** (Cloudflare unified Pages
into Workers). Config lives in `wrangler.jsonc`, which serves `./dist` and uses
`not_found_handling: "single-page-application"` for client-side routing.

**Auto-deploy (current setup):** the repo is connected to Cloudflare Workers
Builds — every push to `main` builds (`npm run build`) and deploys automatically.

**Manual deploy from the CLI:**
```bash
npx wrangler login          # once; opens a browser
npm run deploy              # runs build + wrangler deploy
```

Requires **Node 20+** on the build (set `NODE_VERSION=20` in the Cloudflare
project if needed).

## Roadmap

- **Phase 1 (shipped):** interactive core — modules, labs, self-checks, graded quizzes, PoC Builder, local progress.
- **AI brainstorm — bring-your-own-key (shipped):** in the PoC Builder, paste your own Anthropic API key to have Claude invent agentic app ideas that exercise your selected layers. The key is stored only in your browser and calls Anthropic directly (`dangerouslyAllowBrowser`) — never sent to any server; no backend, no login, no cost to the site. Model selector (Opus 4.8 / Haiku 4.5); the SDK is code-split so it loads only on first generate.
- **Phase 2 (planned):** GitHub OAuth login + Cloudflare Pages Functions + D1 for cross-device synced progress.
- **Phase 3 (planned):** read-only GitHub repo linking — pick a practice repo, auto-detect `.claude/` artifacts to check sub-goals.

## License

- **Code:** MIT (`LICENSE`)
- **Learning content:** CC BY 4.0 (`LICENSE-CONTENT`)

Content is generic and vendor-neutral; Claude Code specifics are factual and verified against public documentation. Domain examples (DevOps, support, personal) are optional illustrations, never the only path.

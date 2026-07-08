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

- **Phase 1 (this):** interactive core — modules, labs, self-checks, graded quizzes, PoC Builder, local progress.
- **Phase 2:** GitHub OAuth login + Cloudflare Pages Functions + D1 for cross-device synced progress.
- **Phase 3:** read-only GitHub repo linking — pick a practice repo, auto-detect `.claude/` artifacts to check sub-goals.

## License

- **Code:** MIT (`LICENSE`)
- **Learning content:** CC BY 4.0 (`LICENSE-CONTENT`)

Content is generic and vendor-neutral; Claude Code specifics are factual and verified against public documentation. Domain examples (DevOps, support, personal) are optional illustrations, never the only path.

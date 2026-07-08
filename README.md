# Agentic SDLC Builder Path

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

## Deploy to Cloudflare Pages (free tier)

**Option A — Git integration (recommended):**
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → Pages → *Create* → *Connect to Git*.
3. Build command: `npm run build` · Output directory: `dist`.
4. Deploy. You get a free `*.pages.dev` URL.

**Option B — direct upload with Wrangler:**
```bash
npm run build
npx wrangler pages deploy dist --project-name agentic-sdlc-builder-path
```
(`npx wrangler login` first — run it yourself; it opens a browser.)

SPA routing is handled by `public/_redirects` (`/* /index.html 200`).

## Roadmap

- **Phase 1 (this):** interactive core — modules, labs, self-checks, graded quizzes, PoC Builder, local progress.
- **Phase 2:** GitHub OAuth login + Cloudflare Pages Functions + D1 for cross-device synced progress.
- **Phase 3:** read-only GitHub repo linking — pick a practice repo, auto-detect `.claude/` artifacts to check sub-goals.

## License

- **Code:** MIT (`LICENSE`)
- **Learning content:** CC BY 4.0 (`LICENSE-CONTENT`)

Content is generic and vendor-neutral; Claude Code specifics are factual and verified against public documentation. Domain examples (DevOps, support, personal) are optional illustrations, never the only path.

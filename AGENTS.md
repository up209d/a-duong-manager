# Project: a-duong-manager

Personal project (owner: Duc).

## Requirements (source of truth)

- Requirements live in the `requirement/` folder:
  - `requirement/requirement.md` — main requirements document
  - `requirement/app-screenshot/` — reference screenshots of the app
- **Read the requirement folder before any implementation work** (design, scaffolding,
  coding). Treat it as the source of truth; if code and requirements conflict, flag it.
- **Status: CONSUMED (2026-09-14).** Requirements read, understanding confirmed with
  Duc, all blocking decisions resolved (see docs/02-decisions.md). Phase 1 built.

## Planning Docs (read these first)

- `docs/01-understanding.md` — full requirement understanding: modules, screens,
  confirmed formulas, data model, scope in/out, tech stack, roadmap
- `docs/02-decisions.md` — decisions log (formulas, scope, stack). Append new
  confirmed decisions here with date
- `docs/03-open-questions.md` — open questions + working defaults. Check before
  assuming; move resolved items to 02-decisions.md

## Project Memory (do not lose)

- **Code scanning: always use codegraph FIRST.** This project has a CodeGraph index
  (`.codegraph/`, auto-syncs on file changes). Before grep/rg/find/read on code, use:
  - `codegraph explore "<area>"` — understand an area (source + call paths in one shot)
  - `codegraph query "<symbol>"` — find definitions
  - `codegraph node <symbol>` / `codegraph node -f <file>` — drill into one symbol/file
  - `codegraph callers <symbol>` / `codegraph callees <symbol>` — call graph
  - `codegraph impact <symbol>` — blast radius before editing
  - `codegraph affected <files>` — which tests to run after changes
  - `codegraph files` — project structure with symbol counts
  - Fallback to grep/read only when codegraph has no answer (e.g. non-code files, config, strings).
  - Skill with full reference: `.pi/skills/codegraph/SKILL.md`
- If the index is stale: `codegraph sync`. If a lock is stuck: `codegraph unlock .`

## Installed Skills (project-local, `.pi/skills/`)

| Skill | Use for |
|---|---|
| `codegraph` | Code scanning, call graphs, impact analysis (see above) |
| `design` | Umbrella: brand, tokens, logo/CIP, banners, icons, social photos, slides |
| `ui-ux-pro-max` | Design decisions: 67 styles, 161 palettes, 57 font pairings, 21 stacks |
| `ui-styling` | shadcn/ui + Tailwind + canvas visual design |
| `design-system` | Token architecture (primitive -> semantic -> component), component specs |
| `brand` | Voice, identity, messaging, asset management |
| `banner-design` | Multi-platform banner design (22 styles) |
| `slides` | Strategic HTML presentations with Chart.js |

Notes:
- `design`/`banner-design` reference optional skills NOT installed here
  (`ai-artist`, `ai-multimodal`, `chrome-devtools`, `frontend-design`).
  Fallbacks: pure HTML/CSS visuals, Playwright/Chrome headless for screenshots.
- AI generation in `design` (logo/icon/CIP) needs a Gemini API key in `.pi/skills/design/.env`.

## Environment

- macOS (Apple Silicon, homebrew), Node.js via homebrew
- codegraph CLI: `@colbymchenry/codegraph` (global npm)
- Agent harness: Pi coding agent (no MCP; CLI + skills pattern)

## Dev servers & tooling

- **Single address (use this): http://localhost:26261** - gateway (`gateway/server.mjs`,
  zero-dep node:http proxy). `/api/*` -> backend :26260, everything else -> web :26262.
  Supports websocket upgrades (Expo HMR) and production static mode (NODE_ENV=production
  serves `app/dist` after `npx expo export`). Tunnel this one port (e.g. `*.tunnel.aws.ducup.dev`).
- Backend API: **http://localhost:26260** - routes under `/api/v1/...` (CORS allows
  `*.tunnel.aws.ducup.dev` + localhost)
- Web dev server: **http://localhost:26262** (Expo)
- Dev orchestrator: `npm run dev` (starts api + web + gateway, prefixed logs, kills all on Ctrl-C)
- Brand assets: `brand/*.svg` -> `node tools/render-brand.mjs` renders PNGs into app/assets/images
- UI screenshots (Playwright): `node tools/screenshot.mjs [--url /route] [--mobile] [--wait ms]`
  saves to `tools/shots/` and reports JS console/page errors. **Use it to visually verify
  UI changes before declaring a task done** (view the PNG with the read tool).

## Conventions

- **Golden viewport: iPhone 16 Pro, 430x932 portrait.** Mobile-first: design and test
  every screen at this size first (Playwright --mobile). Desktop is secondary.
- Language: Vietnamese primary, English secondary (i18n in `app/src/i18n/`)
- Money: INTEGER VND (whole dong), formatted with `Intl.NumberFormat('vi-VN')`
- Color semantics: green (#059669) = profit / stock-in; red (#DC2626) = debt / loss / stock-out
- Code scanning: codegraph first (see Project Memory)
- No special Unicode characters in code/docs; use plain ASCII stand-ins (`->`, `+/-`, `...`).

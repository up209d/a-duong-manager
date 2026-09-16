# 02 - Decisions Log

Record of confirmed decisions. Newest at bottom. Each entry: date, decision, rationale.

| Date | Decision | Detail |
|---|---|---|
| 2026-09-14 | Project setup | Pi skills installed in `.pi/skills/`: codegraph + 7 UX/UI skills (design, ui-ux-pro-max, ui-styling, design-system, brand, banner-design, slides). Converted from Claude Code format to Pi format |
| 2026-09-14 | Code scanning tool | codegraph (colbymchenry/codegraph) CLI + Pi skill; index initialized, auto-sync on. Rule: codegraph FIRST, grep/read fallback only |
| 2026-09-14 | Requirements handling | `requirement/` folder is source of truth; do not act on it until Duc says ready (he said ready on 2026-09-14) |
| 2026-09-14 | Business formulas | All 5 inferred formulas confirmed correct by Duc (revenue, COGS, gross profit, net profit, debt calc). extra_fee (ship/packaging) COUNTS as revenue |
| 2026-09-14 | Feature scope | FULL set from reference screenshots EXCEPT multi-warehouse: multiple labeled selling prices, sub-units (don vi phu), invoice/receipt photo upload, debt management screen (thu no / tra no) |
| 2026-09-14 | Frontend architecture | Expo + react-native-web: ONE codebase running on web and native from day 1. Chosen over "plain React first" to avoid rework on the RN port (camera, UI components) |
| 2026-09-14 | Backend | Node.js + SQLite first, schema designed to migrate to another DB later |
| 2026-09-14 | Languages | Vietnamese primary, English secondary (i18n from the start) |
| 2026-09-14 | Auth / multi-user | NO auth, single shop, single user. Backend is a private API, no sessions, no per-user scoping |
| 2026-09-14 | App brand / name | **+Manage** — used in UI header, document titles, package naming (`+manage` where `+` is invalid, e.g. npm scope). No logo/brand assets yet - design later if wanted |
| 2026-09-14 | UI theme | **Option A - Slate + Stock Green** (light mode). Primary #334155, On-Primary #FFFFFF, Secondary #475569, Accent #059669, Background #F8FAFC, Foreground #0F172A, Card #FFFFFF, Muted #F2F3F4, Muted-FG #64748B, Border #E6E8EA, Destructive #DC2626, Ring #334155. Conventions: green = profit/stock-in, red = debt/loss/stock-out. Source: ui-ux-pro-max palette DB (Inventory & Stock Management) |
| 2026-09-14 | Dev ports | Web dev server: **26262** (app/package.json `web` script). Backend API: **26260** (server default PORT). App API base: http://localhost:26260 |
| 2026-09-14 | UI testing tooling | Playwright + Chromium installed at repo root (`tools/screenshot.mjs`) for app screenshots + JS error capture. Use after starting web dev server: `node tools/screenshot.mjs [--url /route] [--mobile]` |

## Pending decisions (see 03-open-questions.md)

- Currency display rules (VND decimals) — working default: whole dong, vi formatting

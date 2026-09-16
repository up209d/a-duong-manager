---
name: codegraph
description: Local code knowledge graph for fast project scanning. Use BEFORE grep/read when exploring an unfamiliar codebase, tracing call paths, finding symbol definitions, or analyzing blast radius of a change. Commands: explore, node, query, callers, callees, impact, affected, files, status. 100% local, pre-indexed, auto-syncs on file changes.
---

# CodeGraph

Local-first code intelligence (tree-sitter AST index in SQLite, `.codegraph/`).
Prefer codegraph over file crawling: one call returns the relevant source plus
call paths and dependencies, instead of many grep/read round-trips.

## When to Use

- Exploring an unfamiliar codebase or area ("how does X work?")
- Finding where a symbol is defined, who calls it, what it calls
- Assessing impact of a planned change (blast radius)
- Finding which tests are affected by changed files
- Getting the project file structure with symbol counts

## Setup (once per project)

```bash
codegraph init          # build initial index, starts auto-sync watcher
codegraph status        # verify: file count, symbol count, backend
```

Auto-sync is on by default: the index updates on every file change, nothing to re-run.
If the index is ever stale or a lock is stuck: `codegraph sync` / `codegraph unlock .`
Remove from a project: `codegraph uninit`

## Core Workflow

### 1. Explore an area (start here)

```bash
codegraph explore "auth login flow"        # relevant symbols' source + call paths in one shot
codegraph explore "payment retry" --max-files 5
```

### 2. Inspect a single symbol or file

```bash
codegraph node MyClass                      # symbol source + caller/callee trail
codegraph node -f src/server.ts             # file mode: line numbers + dependents
codegraph node -f src/server.ts --offset 40 --limit 60
codegraph node -f src/server.ts --symbols-only
```

### 3. Search symbols

```bash
codegraph query "validateToken"             # find definitions
codegraph query "retry" -k function -l 20   # filter by kind, limit results
```

### 4. Call graph

```bash
codegraph callers handleRequest             # who calls it
codegraph callees handleRequest             # what it calls
```

### 5. Change analysis

```bash
codegraph impact parseConfig                # blast radius of changing a symbol (depth 2)
codegraph impact parseConfig -d 3 -j
codegraph affected src/a.ts src/b.ts        # which test files are affected
codegraph affected --stdin -f "e2e/*.spec.ts"   # file list from stdin
```

### 6. Project structure

```bash
codegraph files                             # tree with language + symbol counts
codegraph files --filter src --max-depth 3
codegraph files --pattern "*.test.ts" --format flat
```

## Tips

- All commands accept `-p <path>` to target a different project (default: cwd).
- Add `-j` for JSON output when you need to parse results programmatically.
- `explore` is the highest-value command: use it first, then drill in with `node`/`callers`.
- Output is verbatim source (not summaries) - trust it, don't re-read the same files.
- If codegraph returns nothing, the symbol may not be indexed yet (new file) - run `codegraph sync`.

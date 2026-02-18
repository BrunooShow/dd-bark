# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

`dd-bark` is a CLI tool for interacting with the Datadog API, designed for AI agent usage. It outputs JSON to stdout and uses `--param=value` argument syntax. Requires `DATADOG_API_KEY` and `DATADOG_APP_KEY` environment variables.

## Build & Dev Commands

```bash
pnpm install          # install dependencies
pnpm build            # build to ./build/ (ESM bundle via tsup, adds shebang)
pnpm dev              # watch mode
```

There are no tests or linting configured.

## Architecture

Single-entrypoint CLI bundled by tsup into `build/cli.js` (ESM with `#!/usr/bin/env node` shebang).

**Entrypoint:** `src/cli.ts` — parses `process.argv`, dispatches to the matching command, and prints the result as JSON.

**Config (`src/config.ts`):** Lazy-initialized singleton that creates Datadog API client instances. Exports `api` object with lazy getters for each API domain (logs, metrics, monitors, incidents, dashboards, traces, hosts, downtimes, rum).

**Commands (`src/commands/`):** Each file exports an array of `Command` objects (defined in `src/utils.ts`). Every command has:
- `name` — the CLI subcommand name (e.g. `get-logs`, `list-incidents`)
- `description` — shown in help output
- `params` — array of `ParamDef` for help text generation
- `run(args)` — validates args with a Zod schema, calls the Datadog API, returns data

All commands are aggregated in `src/commands/index.ts` into `commandMap` (Map) and `commandList` (array).

**Adding a new command:** Create a Zod schema for parameters, define the `Command` object in the appropriate domain file under `src/commands/`, add the export to `src/commands/index.ts`.

## Agentic Layer Architecture

The repo uses a 4-layer pattern for composing agentic workflows on top of the `dd-bark` CLI:

```
Layer 4 — REUSABILITY     justfile (just bark-*)          one-liner entry points
Layer 3.5 — HOP           commands/bark/hop-investigate    playbook loader/executor
Layer 3 — ORCHESTRATION   commands/dd-audit, dd-correlate  fan-out, aggregate, orchestrate
Layer 2 — SCALE           agents/                          parallel workers
Layer 1 — CAPABILITY      skills/dd-bark/SKILL.md          raw dd-bark CLI access
```

**Skills (`skills/`):** Raw capability — teaches Claude Code how to use `dd-bark`. Auto-triggered by Datadog keywords.

**Agents (`agents/`):** Thin subagent wrappers designed for parallel fan-out. Each agent activates the dd-bark skill and follows a focused workflow:
- `sre-investigator` — deep cross-service investigation (heavy, 6-phase)
- `service-checker` — lightweight health check, returns HEALTHY/DEGRADED/CRITICAL
- `metric-analyzer` — metric trend analysis, returns NORMAL/TRENDING/ANOMALY
- `deploy-verifier` — pre/post deploy comparison, returns PASS/FAIL per check

**Commands (`commands/`):** Orchestration prompts that compose agents and dd-bark queries:
- `dd.md` — quick health check (single service)
- `dd-investigate.md` — deep investigation with codebase cross-reference
- `dd-report.md` — structured observability report
- `dd-audit.md` — multi-service parallel fan-out via `service-checker` agents
- `dd-post-deploy.md` — post-deploy verification with pre/post comparison
- `dd-correlate.md` — incident signal correlation with unified timeline

**HOP Commands (`commands/bark/`):** Higher-order prompts that load and execute playbook files:
- `hop-investigate.md` — loads a playbook from `playbooks/`, injects `{SERVICE}`, executes

**Playbooks (`playbooks/`):** Reusable investigation templates with `{SERVICE}` placeholders. Adding a new investigation = adding a `.md` file. No code changes needed.
- `high-error-rate.md`, `high-latency.md`, `service-degradation.md`

**Service Config (`ai_review/services.yaml`):** Defines services for `/dd-audit` multi-service sweep.

**Justfile:** Top-level entry points. All recipes use `just bark-*` naming. Run `just` to see available recipes.

## Key Conventions

- All command args are validated with Zod schemas; Zod errors are formatted for the user in `cli.ts`
- Time parameters use **epoch seconds** (not milliseconds) — conversion happens inside each command
- Default time window is 15 minutes (`fifteenMinAgo`/`nowSeconds` from `src/utils.ts`)
- `parseArgs` in `src/utils.ts` coerces flag values via `JSON.parse` fallback, so arrays/objects can be passed as JSON strings
- The Datadog incidents API operations are marked as unstable in `config.ts`
- `DATADOG_SITE`, `DATADOG_SUBDOMAIN`, and `DATADOG_STORAGE_TIER` are optional env vars for non-default Datadog configurations

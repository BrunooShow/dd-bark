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

## Key Conventions

- All command args are validated with Zod schemas; Zod errors are formatted for the user in `cli.ts`
- Time parameters use **epoch seconds** (not milliseconds) — conversion happens inside each command
- Default time window is 15 minutes (`fifteenMinAgo`/`nowSeconds` from `src/utils.ts`)
- `parseArgs` in `src/utils.ts` coerces flag values via `JSON.parse` fallback, so arrays/objects can be passed as JSON strings
- The Datadog incidents API operations are marked as unstable in `config.ts`
- `DATADOG_SITE`, `DATADOG_SUBDOMAIN`, and `DATADOG_STORAGE_TIER` are optional env vars for non-default Datadog configurations

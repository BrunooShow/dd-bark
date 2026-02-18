---
name: dd-audit
description: Multi-service health sweep — discovers services, fans out service-checker agents in parallel, aggregates results into a health matrix
user_invocable: true
argument: [service-config.yaml or blank for auto-discovery]
---

# Multi-Service Health Audit

Run a parallel health audit across multiple services.

## Variables

- `SERVICES_CONFIG`: `ai_review/services.yaml` — YAML file listing services to audit
- `AGENT_TIMEOUT`: `120000` (ms)

## Instructions

You are running a multi-service health sweep. You will check every service in parallel using lightweight agents and produce an aggregated health matrix.

## Workflow

### Phase 1: Discover Services

If `$ARGUMENTS` points to a YAML file, read it. Otherwise, read the default config at `ai_review/services.yaml`.

If no config file exists, auto-discover services:
```bash
dd-bark get-all-services --limit=200
```

Parse the service list. Each service entry may have:
- `name` (required) — the service name
- `critical` (optional) — boolean, whether this is a critical service
- `monitors` (optional) — monitor name patterns to check

### Phase 2: Spawn Agents

Create a team using TeamCreate named `dd-audit`.

For each service, create a task with TaskCreate, then spawn a `service-checker` agent via the Task tool — **launch all agents in a single message for true parallelism**.

Each agent receives this prompt:
```
Check the health of service: {service.name}

{if service.monitors}
Also check these specific monitors: {service.monitors}
{/if}

Return your structured health report.
```

Use `subagent_type: "general-purpose"` with `team_name: "dd-audit"` for each agent.

### Phase 3: Collect Results

Wait for all teammate messages (they are auto-delivered).
Parse each agent's report for the `RESULT:` line.
Mark each task as completed with TaskUpdate.

### Phase 4: Aggregate and Report

Shut down all teammates via SendMessage with `type: "shutdown_request"`.
Delete the team with TeamDelete.

Present the aggregated report:

```
## Multi-Service Health Audit

**Timestamp:** [current date/time]
**Services checked:** N
**Status:** {ALL HEALTHY | DEGRADED | CRITICAL ISSUES}

### Health Matrix
| # | Service | Status | Monitors | Errors | Top Error |
|---|---------|--------|----------|--------|-----------|
| 1 | service-a | HEALTHY | 0 alert | 2 | — |
| 2 | service-b | DEGRADED | 1 warn | 8 | timeout connecting to db |
| 3 | service-c | CRITICAL | 2 alert | 45 | 500 Internal Server Error |

### Critical Services
[List any critical services (from config) that are not HEALTHY]

### Summary
- **Healthy:** N services
- **Degraded:** N services
- **Critical:** N services

### Recommended Actions
[If any services are degraded or critical, suggest next steps — e.g., "Run `/dd-investigate service-c` for root cause analysis"]
```

## Guidelines

- If the services config is missing and auto-discovery returns no services, tell the user to create `ai_review/services.yaml` or pass a service list.
- Cap at 10 parallel agents to avoid overwhelming the system.
- If a service check times out, mark it as UNKNOWN in the matrix.

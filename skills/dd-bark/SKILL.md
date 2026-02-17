---
name: dd-bark
description: |
  Interact with Datadog using the dd-bark command-line tool.
  Use for fetching logs, metrics, traces, monitors, incidents, hosts, dashboards, downtimes, and RUM data.
  MANDATORY TRIGGERS: datadog, logs, monitors, incidents, traces, metrics, hosts, dashboards, downtimes, rum, apm, observability
---

# dd-bark

A CLI tool for interacting with the Datadog API. Use this instead of MCP tools when you need to query Datadog data.

## Prerequisites

The following environment variables must be set:
- `DATADOG_API_KEY` — Datadog API key (required)
- `DATADOG_APP_KEY` — Datadog application key (required)
- `DATADOG_SITE` — Datadog site, e.g. `datadoghq.eu` (optional, defaults to `datadoghq.com`)
- `DATADOG_SUBDOMAIN` — Subdomain for enterprise accounts (optional)
- `DATADOG_STORAGE_TIER` — Logs storage tier: `indexes`, `online-archives`, `flex` (optional)

## How to Use

Run commands via Bash:
```bash
dd-bark <command> [--param=value ...]
```

Output is always **JSON** on stdout. Errors go to stderr with exit code 1.

**Time range defaults:** Commands that accept `--from` and `--to` default to the **last 15 minutes** if omitted. You can override with epoch seconds.

**Passing arrays/objects:** Use JSON syntax: `--groupStates='["alert","warn"]'` or `--recurrence='{"type":"days","period":1}'`

---

## Available Commands

### Logs & Services
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-logs` | Search and retrieve logs | `--query`, `--from`, `--to`, `--limit` |
| `get-all-services` | Extract unique service names from logs | `--query`, `--from`, `--to`, `--limit` |

### Metrics & APM
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-metrics` | Query timeseries metric data | `--query` (required), `--from`, `--to` |
| `list-traces` | Get APM traces | `--query` (required), `--from`, `--to`, `--service`, `--operation`, `--limit` |

### Monitors & Incidents
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-monitors` | Get monitors and status summary | `--groupStates`, `--name`, `--tags` |
| `list-incidents` | List incidents | `--pageSize`, `--pageOffset` |
| `get-incident` | Get incident details | `--incidentId` (required) |

### Dashboards
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-dashboards` | List all dashboards | `--name`, `--tags` |
| `get-dashboard` | Get dashboard details | `--dashboardId` (required) |

### Hosts
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-hosts` | List hosts with filters | `--filter`, `--count`, `--sort_field`, `--sort_dir` |
| `get-active-hosts-count` | Total active host count | `--from` |
| `mute-host` | Mute a host | `--hostname` (required), `--message`, `--end`, `--override` |
| `unmute-host` | Unmute a host | `--hostname` (required) |

### Downtimes
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-downtimes` | List scheduled downtimes | `--currentOnly` |
| `schedule-downtime` | Schedule a downtime | `--scope` (required), `--start`, `--end`, `--message`, `--recurrence` |
| `cancel-downtime` | Cancel a downtime | `--downtimeId` (required) |

### RUM (Real User Monitoring)
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-rum-applications` | List RUM applications | _(none)_ |
| `get-rum-events` | Search RUM events | `--query`, `--from`, `--to`, `--limit` |
| `get-rum-grouped-event-count` | Group & count RUM events | `--query`, `--from`, `--to`, `--groupBy` |
| `get-rum-page-performance` | Page performance metrics | `--query`, `--from`, `--to`, `--metricNames` |
| `get-rum-page-waterfall` | Page waterfall data | `--applicationName` (required), `--sessionId` (required) |

---

## Common Workflows

### Quick Health Check
```bash
# Check monitors for alerts
dd-bark get-monitors --groupStates='["alert","warn"]'

# Check recent error logs
dd-bark get-logs --query="status:error"

# Check active incidents
dd-bark list-incidents --pageSize=5
```

### Investigate Errors for a Service
```bash
# Get error logs for a service
dd-bark get-logs --query="service:my-service status:error" --limit=50

# Get APM traces with errors
dd-bark list-traces --query="status:error" --service=my-service

# Check what services are active
dd-bark get-all-services
```

### Performance Analysis
```bash
# Query CPU metrics
dd-bark get-metrics --query="avg:system.cpu.user{*}"

# Get traces for a slow endpoint
dd-bark list-traces --query="resource_name:GET\\ /api/users" --service=web-app

# RUM page performance
dd-bark get-rum-page-performance --query="@view.url_path:/checkout"
```

### Custom Time Ranges
```bash
# Last hour (calculate epoch: now - 3600)
dd-bark get-logs --query="env:production" --from=$(($(date +%s) - 3600))

# Specific time window
dd-bark get-logs --query="service:api" --from=1700000000 --to=1700003600
```

---

## Tips

- Use `<command> --help` to see all parameters for any command
- All time params (`--from`, `--to`) are in **epoch seconds** — omit them for last 15 minutes
- The `--query` param uses Datadog query syntax (e.g. `service:web status:error env:production`)
- Output is JSON — pipe through `jq` for formatting if needed
- For monitors, the response includes a `summary` object with counts by state

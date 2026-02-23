---
name: dd-bark
description: |
  Interact with Datadog using the dd-bark command-line tool.
  Use for fetching logs, metrics, traces, monitors, incidents, hosts, dashboards, downtimes, and RUM data.
  MANDATORY TRIGGERS: datadog, logs, monitors, incidents, traces, metrics, hosts, dashboards, downtimes, rum, apm, observability, slo, synthetics, events, on-call, security, audit, containers, processes
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

### Events
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-events` | List events with query and time range | `--query`, `--from`, `--to`, `--limit`, `--sort` |
| `get-event` | Get a specific event by ID | `--eventId` (required) |
| `search-events` | Search events with complex query | `--query`, `--from`, `--to`, `--limit`, `--sort` |

### SLOs (Service Level Objectives)
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-slos` | List SLOs, filter by query or tags | `--query`, `--tags`, `--limit`, `--offset` |
| `get-slo` | Get SLO details | `--sloId` (required) |
| `get-slo-history` | Get SLO history with error budget | `--sloId` (required), `--from`, `--to` |

### Synthetics
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-synthetics` | List synthetic tests | `--pageSize`, `--pageNumber` |
| `get-synthetic-results` | Get latest test results | `--publicId` (required), `--type` (api/browser), `--from`, `--to` |
| `get-synthetic-test` | Get test configuration | `--publicId` (required) |

### Error Tracking
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-error-issues` | Search error tracking issues | `--query`, `--limit` |
| `get-error-issue` | Get error tracking issue details | `--issueId` (required) |

### On-Call
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-on-call-schedule` | Get on-call schedule | `--scheduleId` (required) |
| `get-on-call-user` | Get current on-call user for schedule | `--scheduleId` (required) |
| `get-team-on-call` | Get on-call users for a team | `--teamId` (required) |

### Service Catalog
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-service-definitions` | List service definitions | `--pageSize`, `--pageNumber` |
| `get-service-definition` | Get a service definition | `--serviceName` (required) |

### Containers & Processes
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-containers` | List containers with filtering | `--filterTags`, `--groupBy`, `--sort`, `--pageSize` |
| `list-processes` | List processes with search | `--search`, `--tags`, `--from`, `--to`, `--limit` |

### Tags
| Command | Description | Key Params |
|---------|-------------|------------|
| `get-host-tags` | Get tags for a host | `--hostName` (required) |
| `list-host-tags` | Get all tag-to-host mappings | `--source` |

### CI/CD Pipelines
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-ci-pipelines` | List CI pipeline events | `--query`, `--from`, `--to`, `--limit` |
| `search-ci-pipelines` | Search CI pipeline events | `--query`, `--from`, `--to`, `--limit` |

### Audit
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-audit-logs` | List audit logs | `--query`, `--from`, `--to`, `--limit`, `--sort` |

### Notebooks
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-notebooks` | List notebooks | `--query`, `--start`, `--count` |
| `get-notebook` | Get a notebook | `--notebookId` (required) |

### Security Monitoring
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-security-signals` | List security signals | `--query`, `--from`, `--to`, `--limit`, `--sort` |
| `list-security-rules` | List security rules | `--pageSize`, `--pageNumber`, `--query` |

### Service Scorecards
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-scorecard-rules` | List scorecard rules | `--pageSize`, `--pageOffset` |
| `list-scorecard-outcomes` | List scorecard outcomes | `--pageSize`, `--pageOffset` |

### DORA Metrics
| Command | Description | Key Params |
|---------|-------------|------------|
| `list-dora-deployments` | List DORA deployment events | `--from`, `--to`, `--limit` |
| `list-dora-failures` | List DORA failure events | `--from`, `--to`, `--limit` |

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

### SLO Investigation
```bash
# List SLOs for a service
dd-bark list-slos --query="my-service"

# Check SLO error budget
dd-bark get-slo-history --sloId=abc123

# Get error traces causing SLO breach
dd-bark list-traces --query="status:error" --service=my-service --limit=50

# Get error logs for correlation
dd-bark get-logs --query="service:my-service status:error" --limit=100
```

---

## Tips

- Use `<command> --help` to see all parameters for any command
- All time params (`--from`, `--to`) are in **epoch seconds** — omit them for last 15 minutes
- The `--query` param uses Datadog query syntax (e.g. `service:web status:error env:production`)
- Output is JSON — pipe through `jq` for formatting if needed
- For monitors, the response includes a `summary` object with counts by state

# dd-bark

CLI tool for interacting with the Datadog API — designed for AI agent usage.

All output is JSON to stdout, making it easy to pipe into other tools or consume programmatically.

## Claude Code Plugin

dd-bark is available as a [Claude Code](https://claude.ai/code) plugin.

### Install from GitHub

```
/plugin marketplace add BrunooShow/dd-bark
/plugin install dd-bark
```

### Local development

```bash
claude --plugin-dir /path/to/dd-bark
```

### What you get

| Command | Description |
|---|---|
| `/dd <service>` | Quick health check — monitors, errors, incidents |
| `/dd-investigate <service>` | Deep on-call investigation with root cause analysis |
| `/dd-report <service>` | Structured observability report for standups/reviews |
| `/dd-audit` | Multi-service health sweep — parallel checks across all services |
| `/dd-post-deploy <service>` | Post-deploy verification — compares pre/post error rates |
| `/dd-correlate <service>` | Incident signal correlation — unified timeline from all signals |
| `/bark:hop-investigate <svc> <playbook>` | Run a reusable investigation playbook |

Plus an auto-triggered skill that activates whenever you mention Datadog, logs, monitors, traces, etc.

## Install

```bash
npm install -g dd-bark
```

Or run directly with npx:

```bash
npx dd-bark <command> [--param=value ...]
```

## Setup

Set your Datadog credentials as environment variables:

```bash
export DATADOG_API_KEY="your-api-key"
export DATADOG_APP_KEY="your-app-key"
```

Optional environment variables:

| Variable | Description |
|---|---|
| `DATADOG_SITE` | Datadog site (e.g. `datadoghq.eu`, `us5.datadoghq.com`) |
| `DATADOG_SUBDOMAIN` | Subdomain for enterprise accounts |
| `DATADOG_STORAGE_TIER` | Logs storage tier: `indexes`, `online-archives`, `flex` |

## Usage

```bash
dd-bark <command> [--param=value ...]
dd-bark --help
dd-bark <command> --help
```

Parameters are passed as `--key=value`. Arrays and objects are passed as JSON:

```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --tags='["team:backend"]'
```

Time parameters use **epoch seconds**. Most time-based commands default to the last 15 minutes.

## Commands

### Logs

| Command | Description |
|---|---|
| `get-logs` | Search and retrieve logs |
| `get-all-services` | Extract all unique service names from logs |

```bash
dd-bark get-logs --query="service:web status:error" --limit=50
dd-bark get-all-services --query="env:production"
```

### Monitors

| Command | Description |
|---|---|
| `get-monitors` | Get monitors status with summary counts |

```bash
dd-bark get-monitors --groupStates='["alert","warn"]'
dd-bark get-monitors --name="CPU" --tags='["team:infra"]'
```

### Incidents

| Command | Description |
|---|---|
| `list-incidents` | List incidents with pagination |
| `get-incident` | Get a specific incident by ID |

```bash
dd-bark list-incidents --pageSize=20
dd-bark get-incident --incidentId="abc123"
```

### Metrics

| Command | Description |
|---|---|
| `get-metrics` | Query timeseries metric points |

```bash
dd-bark get-metrics --query="avg:system.cpu.user{*}"
dd-bark get-metrics --query="sum:trace.http.request{service:api}" --from=1700000000 --to=1700001000
```

### APM Traces

| Command | Description |
|---|---|
| `list-traces` | Search APM traces/spans |

```bash
dd-bark list-traces --query="service:api" --limit=50
dd-bark list-traces --query="*" --service=web --operation=http.request
```

### Dashboards

| Command | Description |
|---|---|
| `list-dashboards` | List dashboards, optionally filtered by name/tags |
| `get-dashboard` | Get full dashboard definition by ID |

```bash
dd-bark list-dashboards --name="production"
dd-bark get-dashboard --dashboardId="abc-def-ghi"
```

### Hosts

| Command | Description |
|---|---|
| `list-hosts` | List hosts with optional filtering and sorting |
| `get-active-hosts-count` | Get total active and up host counts |
| `mute-host` | Mute a host |
| `unmute-host` | Unmute a host |

```bash
dd-bark list-hosts --filter="web" --count=100
dd-bark get-active-hosts-count
dd-bark mute-host --hostname="web-01" --message="maintenance" --end=1700000000
dd-bark unmute-host --hostname="web-01"
```

### Downtimes

| Command | Description |
|---|---|
| `list-downtimes` | List scheduled downtimes |
| `schedule-downtime` | Schedule a new downtime |
| `cancel-downtime` | Cancel a scheduled downtime |

```bash
dd-bark list-downtimes --currentOnly
dd-bark schedule-downtime --scope="host:web-01" --end=1700000000 --message="deploy"
dd-bark cancel-downtime --downtimeId=123456
```

### RUM (Real User Monitoring)

| Command | Description |
|---|---|
| `get-rum-applications` | List all RUM applications |
| `get-rum-events` | Search RUM events |
| `get-rum-grouped-event-count` | Group and count RUM events by a dimension |
| `get-rum-page-performance` | Get page load performance metrics |
| `get-rum-page-waterfall` | Get page waterfall data for a session |

```bash
dd-bark get-rum-applications
dd-bark get-rum-events --query="@type:error" --limit=50
dd-bark get-rum-grouped-event-count --groupBy="@browser.name"
dd-bark get-rum-page-performance --query="@application.name:myapp"
dd-bark get-rum-page-waterfall --applicationName="myapp" --sessionId="sess-123"
```

## Agentic Workflows

dd-bark includes a layered agentic system for automating observability tasks with Claude Code.

### Quick Start with Justfile

If you have [just](https://github.com/casey/just) installed, all workflows are available as one-liners:

```bash
just                           # list all recipes
just bark payment-service      # quick health check
just bark-investigate auth-svc # deep investigation
just bark-audit                # multi-service health sweep
just bark-deploy api-gateway   # post-deploy verification
just bark-correlate web-app    # incident signal correlation
just bark-playbook api high-error-rate  # run investigation playbook
```

### Agents

Lightweight agents designed for parallel fan-out:

| Agent | Purpose |
|---|---|
| `@sre-investigator` | Deep cross-service investigation (6-phase playbook) |
| `@service-checker` | Fast HEALTHY/DEGRADED/CRITICAL check for one service |
| `@metric-analyzer` | Metric trend analysis — CPU, memory, latency, error rate |
| `@deploy-verifier` | Pre/post deploy comparison with PASS/FAIL checks |

### Investigation Playbooks

Reusable investigation templates in `playbooks/`. Run via the HOP pattern:

```bash
# Run a playbook against a service
just bark-playbook payment-service high-error-rate

# List available playbooks
just bark-playbooks
```

Available playbooks:
- `high-error-rate` — categorize errors, trace the path, check triggers
- `high-latency` — measure latency, identify slow ops, check resources
- `service-degradation` — full signal sweep, classify type, build timeline

Add your own by creating a `.md` file in `playbooks/` with `{SERVICE}` placeholders.

### Service Config

Define your services in `ai_review/services.yaml` for the multi-service audit:

```yaml
services:
  - name: api-gateway
    critical: true
    monitors: ["api-gateway-*"]
  - name: auth-service
    critical: true
```

### Composed Workflows

Higher-level recipes that chain multiple commands:

```bash
just bark-standup              # morning audit of all services
just bark-oncall api-gateway   # correlate signals → investigate root cause
just bark-shipit web-app       # verify deploy → auto-investigate if FAIL
just bark-deepdive auth-svc    # metrics + investigation + report combined
just bark-escalate payment-svc # cross-service investigation with SRE agent
```

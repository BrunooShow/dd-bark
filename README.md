# dd-bark

CLI tool for interacting with the Datadog API — designed for AI agent usage.

All output is JSON to stdout, making it easy to pipe into other tools or consume programmatically.

## Claude Code Plugin

dd-bark is available as a [Claude Code](https://claude.ai/code) plugin.

### Install from marketplace

```
/plugin install dd-bark@<marketplace-name>
```

### Install from GitHub

Add the repo as a marketplace source, then install:

```
/plugin marketplace add BrunooShow/dd-bark
/plugin install dd-bark@dd-bark
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

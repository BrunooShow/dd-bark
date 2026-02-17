---
name: dd-report
description: Generate a structured observability report for a service or topic
user_invocable: true
argument: <service name or topic>
---

# Datadog Observability Report

Generate a report for: **$ARGUMENTS**

## Instructions

You are generating a structured observability summary. This is useful for standups, post-deploy checks, or sharing status with the team.

### Step 1: Collect Data

Run these dd-bark commands in parallel:

1. **Error logs** — recent errors and their frequency:
   ```bash
   dd-bark get-logs --query="service:$ARGUMENTS status:error" --limit=50
   ```

2. **All recent logs** — to gauge overall volume:
   ```bash
   dd-bark get-logs --query="service:$ARGUMENTS" --limit=10
   ```

3. **APM traces** — performance and error traces:
   ```bash
   dd-bark list-traces --query="*" --service="$ARGUMENTS" --limit=30
   ```

4. **Monitor status** — current monitor health:
   ```bash
   dd-bark get-monitors --name="$ARGUMENTS"
   ```

5. **Host health** — infrastructure status:
   ```bash
   dd-bark list-hosts --filter="$ARGUMENTS"
   ```

6. **Active incidents**:
   ```bash
   dd-bark list-incidents --pageSize=5
   ```

Adapt queries based on what `$ARGUMENTS` describes. If it's a broad topic (e.g. "production", "checkout flow"), adjust filters accordingly.

### Step 2: Analyze

From the collected data, calculate/identify:
- **Error rate:** Count of error logs vs total, top recurring error messages
- **Performance:** Trace durations — look for p50/p95/p99 if enough data, slow endpoints
- **Host health:** Number of hosts, any with high load or issues
- **Monitor status:** Breakdown by state (OK, Alert, Warn, No Data)

### Step 3: Generate Report

```
## Observability Report: $ARGUMENTS

**Generated:** [current date/time]
**Time Window:** Last 15 minutes

### Error Summary
- **Error count:** N errors in window
- **Top errors:**
  1. `[error message]` — N occurrences
  2. `[error message]` — N occurrences

### Performance
- **Traces sampled:** N
- **Error traces:** N (X%)
- **Slow traces (>1s):** list any notably slow operations

### Host Health
- **Active hosts:** N
- **Status:** [summary of host health]

### Monitor Status
| State | Count |
|-------|-------|
| OK | N |
| Alert | N |
| Warn | N |
| No Data | N |

**Alerting monitors:** [list names if any]

### Active Incidents
[List or "None"]

### Overall Assessment
[One-paragraph assessment: is the service healthy? Any concerns? Trending better or worse?]
```

If data is unavailable for a section (e.g. no traces, no hosts matching), note it briefly and move on. Don't fail — report what you can.

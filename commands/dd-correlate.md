---
name: dd-correlate
description: Incident correlation — spawns parallel agents per signal type (logs, traces, metrics, monitors) and merges findings into a unified timeline
user_invocable: true
argument: <service name or incident description>
---

# Incident Correlation

Correlate signals for: **$ARGUMENTS**

## Instructions

You are correlating multiple Datadog signal types to build a unified incident timeline. Instead of querying sequentially, you fan out parallel investigations per signal type and merge the results.

### Phase 1: Fan Out Signal Gathering

Run ALL of these dd-bark commands in parallel using separate Bash calls:

**Signal 1 — Error Logs:**
```bash
dd-bark get-logs --query="service:$ARGUMENTS status:error" --limit=100
```

**Signal 2 — Warning Logs:**
```bash
dd-bark get-logs --query="service:$ARGUMENTS status:warn" --limit=50
```

**Signal 3 — APM Error Traces:**
```bash
dd-bark list-traces --query="status:error" --service="$ARGUMENTS" --limit=50
```

**Signal 4 — Monitors:**
```bash
dd-bark get-monitors --groupStates='["alert","warn","no data"]' --name="$ARGUMENTS"
```

**Signal 5 — Active Incidents:**
```bash
dd-bark list-incidents --pageSize=10
```

**Signal 6 — Host Health:**
```bash
dd-bark list-hosts --filter="$ARGUMENTS"
```

**Signal 7 — Key Metrics:**
```bash
dd-bark get-metrics --query="avg:system.cpu.user{service:$ARGUMENTS}"
```

```bash
dd-bark get-metrics --query="avg:trace.http.request.duration{service:$ARGUMENTS}"
```

Adapt queries if `$ARGUMENTS` is a description rather than a service name.

### Phase 2: Build Timeline

From all gathered data, construct a chronological timeline:

1. Extract timestamps from each signal (log timestamps, trace start times, monitor state changes)
2. Sort all events chronologically
3. Identify the **first signal** — what fired first?
4. Identify **propagation** — how did the issue spread across signal types?
5. Identify **current state** — what signals are still active?

### Phase 3: Correlate

Look for connections:
- **Log-Trace correlation:** Do error logs reference trace IDs that appear in APM data?
- **Monitor-Log correlation:** Did a monitor alert coincide with a log spike?
- **Host-Service correlation:** Are affected hosts the ones running the affected service?
- **Metric-Error correlation:** Did metric changes (CPU spike, latency increase) precede errors?

### Phase 4: Report

```
## Incident Correlation: $ARGUMENTS

### Timeline
| Time | Signal | Event |
|------|--------|-------|
| HH:MM:SS | metrics | CPU spike detected on host-X |
| HH:MM:SS | logs | First error: "connection timeout to database" |
| HH:MM:SS | traces | Endpoint GET /api/users failing (500) |
| HH:MM:SS | monitors | Monitor "API Error Rate" triggered alert |

### Signal Summary
| Signal | Status | Count/Detail |
|--------|--------|-------------|
| Error logs | N errors | Top: "error message" |
| Warn logs | N warnings | Top: "warning message" |
| Error traces | N failing | Top endpoint: /path |
| Monitors | N alerting, N warning | [names] |
| Incidents | N active | [titles] |
| Hosts | N hosts | [health summary] |
| CPU | X% | [trend] |
| Latency | Xms | [trend] |

### Correlations Found
1. [Description of correlation with evidence]
2. [Description of correlation with evidence]

### Root Cause Hypothesis
[Based on the timeline and correlations, what likely caused this?]

### Recommended Actions
1. Immediate: [mitigation]
2. Investigate: [what to look at next]
```

## Guidelines

- The timeline is the most valuable output. Build it carefully from actual timestamps.
- Not all signals will have data. Report what's available.
- If you can identify a clear causal chain (metric spike -> errors -> monitor alert), highlight it.
- Reference specific log messages, trace IDs, and metric values as evidence.

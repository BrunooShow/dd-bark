# High Error Rate Investigation

Investigate elevated error rates for **{SERVICE}**.

## Steps

### 1. Gather Error Data (run in parallel)

```bash
dd-bark get-logs --query="service:{SERVICE} status:error" --limit=100
```

```bash
dd-bark get-logs --query="service:{SERVICE} status:error" --limit=50 --from=$(($(date +%s) - 3600))
```

```bash
dd-bark list-traces --query="status:error" --service="{SERVICE}" --limit=50
```

```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --name="{SERVICE}"
```

### 2. Categorize Errors

From the error logs:
- Group by error message — what are the top 3-5 unique errors?
- Group by resource/endpoint — which endpoints are failing?
- Check the timeline — when did errors start? Sudden spike or gradual increase?

### 3. Trace the Error Path

From APM traces:
- Which operations are producing errors?
- What's the error trace duration vs normal?
- Are errors coming from downstream dependencies?

### 4. Check for Triggers

```bash
dd-bark get-metrics --query="avg:system.cpu.user{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

```bash
dd-bark get-metrics --query="avg:system.mem.used{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

Look for:
- Resource exhaustion (CPU/memory spike)
- Deployment timing (errors starting at a specific time)
- Dependency failures (errors mentioning downstream services)

### 5. Report

```
## High Error Rate: {SERVICE}

### Error Summary
- **Total errors (15 min):** N
- **Total errors (1 hour):** N
- **Trend:** increasing / decreasing / stable

### Top Errors
| # | Error Message | Count | First Seen |
|---|---------------|-------|------------|
| 1 | ... | N | HH:MM |
| 2 | ... | N | HH:MM |

### Affected Endpoints
| Endpoint | Error Count | Error Type |
|----------|-------------|------------|
| GET /api/... | N | 500 |

### Likely Cause
[Analysis based on error patterns, timing, and resource metrics]

### Actions
1. [Immediate mitigation]
2. [Fix to implement]
```

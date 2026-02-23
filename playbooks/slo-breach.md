# SLO Breach Investigation

Investigate SLO breaches for **{SERVICE}**.

## Steps

### 1. Discover & Triage SLOs (run in parallel)

```bash
dd-bark list-slos --query="{SERVICE}" --limit=50
```

For each SLO returned, check its history:
```bash
dd-bark get-slo-history --sloId=SLO_ID
```

Identify breaching SLOs: error budget < 0 or current value below target.

If no SLOs are breaching, report "{SERVICE} — all SLOs healthy" and stop.

### 2. Gather Error Signals (run in parallel)

```bash
dd-bark get-logs --query="service:{SERVICE} status:error" --limit=100
```

```bash
dd-bark list-traces --query="status:error" --service="{SERVICE}" --limit=50
```

```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --name="{SERVICE}"
```

```bash
dd-bark get-metrics --query="avg:trace.http.request.errors{service:{SERVICE}}.as_count()"
```

### 3. Identify Failing Endpoints

From error traces:
- Which endpoints/operations have the most errors?
- What error types? (5xx, timeout, connection refused)
- Are errors from {SERVICE} itself or downstream dependencies?

For top 3 failing endpoints, get detailed traces:
```bash
dd-bark list-traces --query="resource_name:ENDPOINT status:error" --service="{SERVICE}" --limit=50
```

### 4. Correlate with Logs

Search for specific error messages found in traces:
```bash
dd-bark get-logs --query="service:{SERVICE} \"ERROR_MESSAGE\"" --limit=50
```

If downstream services are implicated:
```bash
dd-bark get-logs --query="service:DOWNSTREAM status:error" --limit=50
```

Build timeline: when errors started, frequency, trend.

### 5. Report

```
## SLO Breach: {SERVICE}

### SLO Status
| SLO | Target | Current | Error Budget | Status |
|-----|--------|---------|--------------|--------|
| ... | ...    | ...     | ...          | BREACHING |

### Failing Resources
| Endpoint | Error Count | Error Type | Downstream |
|----------|-------------|------------|------------|
| GET /api/... | N | 500 | service-name |

### Error Timeline
- **First error:** HH:MM — "error message"
- **Current rate:** N errors/min
- **Trend:** increasing / stable / decreasing

### Root Cause
[Analysis: what's causing the SLO to breach, based on traces, logs, and metrics]

### Actions
1. **Immediate:** [mitigation — scale, restart, feature flag]
2. **Fix:** [code change needed]
3. **Prevention:** [monitoring, circuit breaker, etc.]
```

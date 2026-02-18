# High Latency Investigation

Investigate latency issues for **{SERVICE}**.

## Steps

### 1. Measure Current Latency (run in parallel)

```bash
dd-bark get-metrics --query="avg:trace.http.request.duration{service:{SERVICE}}"
```

```bash
dd-bark get-metrics --query="max:trace.http.request.duration{service:{SERVICE}}"
```

```bash
dd-bark list-traces --query="@duration:>1000000000" --service="{SERVICE}" --limit=30
```

```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --name="{SERVICE}"
```

Note: trace duration filter is in nanoseconds (1s = 1000000000ns).

### 2. Identify Slow Operations

From the traces:
- Which operations/endpoints are slowest?
- What's the distribution — all slow, or specific endpoints?
- Are slow traces also erroring, or just timing out?

### 3. Check Resource Bottlenecks (run in parallel)

```bash
dd-bark get-metrics --query="avg:system.cpu.user{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

```bash
dd-bark get-metrics --query="avg:system.mem.used{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

```bash
dd-bark get-metrics --query="avg:system.io.await{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

```bash
dd-bark list-hosts --filter="{SERVICE}"
```

### 4. Check Downstream Dependencies

```bash
dd-bark get-logs --query="service:{SERVICE} (timeout OR slow OR deadline OR context)" --limit=50
```

Look for:
- Timeout errors pointing to specific dependencies
- Connection pool exhaustion
- Database query slowness
- External API latency

### 5. Report

```
## High Latency: {SERVICE}

### Latency Summary
- **Avg latency:** Xms
- **Max latency:** Xms
- **Slow traces (>1s):** N in last 15 min

### Slowest Operations
| Operation | Avg Duration | Max Duration | Count |
|-----------|-------------|-------------|-------|
| GET /api/... | Xms | Xms | N |

### Resource Status
| Resource | Value | Status |
|----------|-------|--------|
| CPU | X% | OK/HIGH |
| Memory | X% | OK/HIGH |
| Disk I/O | Xms await | OK/HIGH |
| Host count | N | — |

### Bottleneck Analysis
[Where is the latency coming from? Internal processing, downstream deps, or resources?]

### Actions
1. [Immediate mitigation — e.g., scale up, restart, circuit break]
2. [Investigation — e.g., profile specific endpoint, check DB queries]
```

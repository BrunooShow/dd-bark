# Service Degradation Investigation

Investigate general degradation for **{SERVICE}**.

## Steps

### 1. Full Signal Sweep (run all in parallel)

```bash
dd-bark get-logs --query="service:{SERVICE} status:error" --limit=50
```

```bash
dd-bark get-logs --query="service:{SERVICE} status:warn" --limit=50
```

```bash
dd-bark list-traces --query="status:error" --service="{SERVICE}" --limit=30
```

```bash
dd-bark list-traces --query="*" --service="{SERVICE}" --limit=30
```

```bash
dd-bark get-monitors --groupStates='["alert","warn","no data"]' --name="{SERVICE}"
```

```bash
dd-bark list-incidents --pageSize=10
```

```bash
dd-bark list-hosts --filter="{SERVICE}"
```

```bash
dd-bark get-metrics --query="avg:system.cpu.user{service:{SERVICE}}" --from=$(($(date +%s) - 3600))
```

### 2. Classify the Degradation

Determine the type:
- **Error-driven:** High error rate but normal latency → focus on error analysis
- **Latency-driven:** High latency but low errors → focus on performance bottleneck
- **Resource-driven:** CPU/memory/disk exhaustion → focus on infrastructure
- **Dependency-driven:** Errors mentioning other services → focus on service mesh
- **Mixed:** Multiple signals → correlate timeline

### 3. Build a Timeline

From all collected data:
1. Find the earliest anomaly signal (first error, first metric spike, first monitor alert)
2. Track how it propagated
3. Identify what changed (deploy, traffic spike, dependency failure)

### 4. Check for Recent Changes

```bash
dd-bark get-logs --query="service:{SERVICE} (deploy OR release OR config OR restart)" --limit=20
```

Look for deployment markers, config changes, or service restarts that coincide with degradation.

### 5. Report

```
## Service Degradation: {SERVICE}

### Classification
**Type:** [Error-driven / Latency-driven / Resource-driven / Dependency-driven / Mixed]
**Severity:** [Minor / Moderate / Severe]
**Duration:** [Since when, estimated from timeline]

### Current State
| Signal | Status | Detail |
|--------|--------|--------|
| Errors | N/15min | Top: "message" |
| Latency | Xms avg | [normal/elevated] |
| Monitors | N alerting | [names] |
| Incidents | N active | [titles] |
| Hosts | N total | [health] |
| CPU | X% | [trend] |

### Timeline
| Time | Event |
|------|-------|
| HH:MM | [first signal] |
| HH:MM | [propagation] |
| HH:MM | [current state] |

### Root Cause Analysis
[What's driving the degradation, with evidence]

### Actions
1. **Immediate:** [mitigation — e.g., scale, rollback, toggle feature flag]
2. **Short-term:** [fix — e.g., patch, config change]
3. **Long-term:** [prevention — e.g., circuit breaker, better monitoring]
```

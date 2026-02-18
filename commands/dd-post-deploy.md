---
name: dd-post-deploy
description: Post-deploy verification — checks service health after a deployment by comparing pre/post metrics, error rates, and monitor status
user_invocable: true
argument: <service name> [deploy-time-epoch]
---

# Post-Deploy Verification

Verify deployment health for: **$ARGUMENTS**

## Instructions

You are verifying that a deployment is healthy. Parse `$ARGUMENTS` to extract:
- **Service name** — the first argument (required)
- **Deploy time** — epoch seconds if provided as second argument, otherwise assume 15 minutes ago

### Phase 1: Setup

Calculate time windows using Bash:
```bash
NOW=$(date +%s)
# If deploy time provided, use it; otherwise 15 min ago
DEPLOY_TIME=${provided_time:-$(($NOW - 900))}
DURATION=$(($NOW - $DEPLOY_TIME))
PRE_FROM=$(($DEPLOY_TIME - $DURATION))
```

### Phase 2: Gather Data (run all in parallel)

**Post-deploy window (deploy time to now):**

1. Error logs:
```bash
dd-bark get-logs --query="service:SERVICE status:error" --from=$DEPLOY_TIME --to=$NOW --limit=100
```

2. All logs (for volume):
```bash
dd-bark get-logs --query="service:SERVICE" --from=$DEPLOY_TIME --to=$NOW --limit=10
```

3. Error traces:
```bash
dd-bark list-traces --query="status:error" --service="SERVICE" --from=$DEPLOY_TIME --to=$NOW --limit=50
```

4. Monitor status:
```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --name="SERVICE"
```

**Pre-deploy window (baseline):**

5. Error logs:
```bash
dd-bark get-logs --query="service:SERVICE status:error" --from=$PRE_FROM --to=$DEPLOY_TIME --limit=100
```

6. Error traces:
```bash
dd-bark list-traces --query="status:error" --service="SERVICE" --from=$PRE_FROM --to=$DEPLOY_TIME --limit=50
```

### Phase 3: Compare and Evaluate

Run these verification checks:

| Check | PASS | FAIL |
|-------|------|------|
| Error rate | Post errors <= 1.5x pre errors | Post errors > 1.5x pre errors |
| New errors | No new error messages in post | New error messages appeared |
| Monitors | No monitors alerting | Any monitor in alert state |
| Error traces | Post error traces <= 1.5x pre | Post error traces > 1.5x pre |

### Phase 4: Report

```
## Post-Deploy Verification: SERVICE

**Deploy time:** [human-readable]
**Pre-window:** [time range]
**Post-window:** [time range]
**Verdict: PASS / FAIL**

### Checks
| # | Check | Pre | Post | Change | Status |
|---|-------|-----|------|--------|--------|
| 1 | Error count | N | N | +X% | PASS/FAIL |
| 2 | New error types | — | N new | — | PASS/FAIL |
| 3 | Monitor status | — | N alerting | — | PASS/FAIL |
| 4 | Error traces | N | N | +X% | PASS/FAIL |

### New Errors (if any)
[List error messages seen in post-window but not pre-window]

### Assessment
[Is this deploy safe? Should it be rolled back? Key evidence.]

### Next Steps
- If PASS: "Deploy looks healthy. Continue monitoring."
- If FAIL: "Consider rollback. Run `/dd-investigate SERVICE` for deeper analysis."
```

## Guidelines

- A single FAIL check doesn't always mean rollback — provide context (e.g., if pre-deploy already had errors).
- If pre-deploy window has zero errors and post has 1-2, that's normal noise — use judgment.
- Be precise with numbers, not vague.

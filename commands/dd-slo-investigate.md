---
name: dd-slo-investigate
description: SLO breach investigation — discovers breaching SLOs, traces root cause through APM/logs, cross-references codebase, and optionally proposes fixes
user_invocable: true
argument: <service-name-or-slo-id> [--deep]
---

# SLO Breach Investigation

Investigate SLO breaches for: **$ARGUMENTS**

## Instructions

You are investigating SLO breaches to find root causes and propose fixes. Follow this structured workflow.

### Parse Input

Parse `$ARGUMENTS`:
- If the value looks like an SLO ID (contains only hex characters and dashes, e.g. `abc123def456`), treat it as **SLO ID mode**
- Otherwise, treat it as **service name mode**
- Check if `--deep` appears in the arguments — if so, enable deep codebase analysis with code fix proposals

### Phase 1: SLO Discovery & Triage

**SLO ID mode:**
```bash
dd-bark get-slo --sloId=SLO_ID
dd-bark get-slo-history --sloId=SLO_ID
```

**Service name mode:**
```bash
dd-bark list-slos --query=SERVICE_NAME --limit=50
```
Then for each SLO returned:
```bash
dd-bark get-slo-history --sloId=EACH_SLO_ID
```

**Triage:** Identify breaching SLOs — those where:
- Error budget remaining is negative or near zero
- Current SLI value is below the target threshold
- Overall status indicates a breach

**Decision gate:**
- **0 breaching SLOs:** Report "All SLOs healthy for SERVICE" and stop
- **1 breaching SLO:** Continue inline with Phases 2-6
- **2+ breaching SLOs:** For each breaching SLO, spawn an `sre-investigator` agent via the Task tool (subagent_type: "dd-bark:sre-investigator"). Give each agent this context:
  ```
  Investigate SLO breach for service SERVICE_NAME.
  SLO: SLO_NAME (ID: SLO_ID)
  Type: metric-based / monitor-based
  Target: X%
  Current: Y%
  Error budget remaining: Z%

  Follow these steps:
  1. Query error traces: dd-bark list-traces --query="status:error" --service="SERVICE" --limit=50
  2. Query error logs: dd-bark get-logs --query="service:SERVICE status:error" --limit=100
  3. Check monitors: dd-bark get-monitors --groupStates='["alert","warn"]' --name="SERVICE"
  4. Identify failing endpoints and error patterns
  5. Cross-reference the local codebase (Grep for error messages, Read source files)
  6. Report: root cause, evidence, affected code, recommended fixes
  ```
  After all agents complete, aggregate their reports into a combined output (Phase 6 format).

### Phase 2: Identify Failing Resources

Run ALL of these in parallel:

**Alerting monitors:**
```bash
dd-bark get-monitors --groupStates='["alert","warn"]' --name="SERVICE_NAME"
```

**Error traces for the service:**
```bash
dd-bark list-traces --query="status:error" --service="SERVICE_NAME" --limit=50
```

**Error logs for the service:**
```bash
dd-bark get-logs --query="service:SERVICE_NAME status:error" --limit=100
```

**SLO underlying metric** (if metric-based SLO — extract the metric query from the SLO definition):
```bash
dd-bark get-metrics --query="SLO_METRIC_QUERY"
```

From the results, identify:
- Which endpoints/operations are failing (from traces)
- What error messages are occurring (from logs)
- Which monitors are alerting (from monitors)
- Whether the underlying metric shows anomalies

### Phase 3: Deep Trace Analysis

For each of the top 3 failing endpoints identified in Phase 2:

```bash
dd-bark list-traces --query="resource_name:ENDPOINT_NAME status:error" --service="SERVICE_NAME" --limit=50
```

Analyze each endpoint's error traces:
- **Error type:** What's the error? (500, timeout, connection refused, etc.)
- **Duration:** Are errors fast-fail or slow timeout?
- **Downstream calls:** Do traces show calls to other services that fail?
- **Pattern:** Same error repeating, or multiple different errors?

### Phase 4: Log Correlation

Search for the specific error messages found in traces:
```bash
dd-bark get-logs --query="service:SERVICE_NAME \"SPECIFIC_ERROR_MESSAGE\"" --limit=50
```

If downstream dependencies were identified in Phase 3:
```bash
dd-bark get-logs --query="service:DOWNSTREAM_SERVICE status:error" --limit=50
```

Build a timeline:
- When did the first error appear?
- What's the error frequency? Increasing, stable, or decreasing?
- Is there a pattern (e.g., errors every N seconds, or correlated with a specific event)?

### Phase 5: Codebase Cross-Reference

Search the local codebase for code related to the failures:

1. **Error messages** — Grep for the specific error strings found in logs/traces
2. **Endpoint handlers** — Grep for the failing endpoint route definitions (e.g., `/api/users`, `GET /checkout`)
3. **Downstream clients** — Grep for the downstream service names or connection strings
4. **Configuration** — Glob for config files that might control timeouts, pool sizes, retry policies

Read the relevant source files to understand the code path.

**If `--deep` is enabled:**
- Analyze the code for the root cause (missing error handling, wrong timeout, no retry, no circuit breaker, connection pool exhaustion, etc.)
- Propose specific code changes with file paths, line numbers, and code snippets
- Focus on: error handling, retry logic, timeout configuration, circuit breakers, connection pool settings, resource cleanup

**If `--deep` is NOT enabled:**
- List the relevant files and functions with a brief description of what each does
- Note which areas likely need attention based on the error patterns

### Phase 6: Report

Present your findings:

```
## SLO Breach Investigation: SERVICE_NAME

### SLO Status
| SLO | Type | Target | Current | Error Budget | Status |
|-----|------|--------|---------|--------------|--------|
| SLO_NAME | metric/monitor | X% | Y% | Z% remaining | BREACHING / HEALTHY |

### Root Cause
**Failing resource:** ENDPOINT → ERROR_TYPE
**Error pattern:** DESCRIPTION_OF_PATTERN
**Timeline:** Started Xh ago, N occurrences in last 15 min
**Downstream dependency:** SERVICE_NAME (if applicable)

### Evidence
**Traces:** N error traces sampled. Top failing endpoint: ENDPOINT (N errors). Error: ERROR_MESSAGE
**Logs:** N error logs in last 15 min. Top error: "ERROR_MESSAGE" (×COUNT)
**Monitors:** N alerting — MONITOR_NAMES

### Codebase Analysis
**Relevant files:**
- `path/to/file.ts:LINE` — DESCRIPTION
- `path/to/file.ts:LINE` — DESCRIPTION

### Proposed Fixes [only if --deep]
1. **FIX_TITLE**
   File: `path/to/file.ts:LINE`
   Change: DESCRIPTION
   ```
   CODE_SNIPPET
   ```

2. **FIX_TITLE**
   ...

### Recommended Actions
1. **Immediate:** MITIGATION_STEP
2. **Short-term:** FIX_TO_IMPLEMENT
3. **Long-term:** PREVENTION_MEASURE
```

## Guidelines

- Run independent queries in parallel for speed
- Focus on evidence — cite specific error messages, trace counts, and metric values
- The SLO is the starting point, but the investigation should follow the data wherever it leads
- If `--deep` mode is on, proposed fixes should be specific enough to implement (file path, line number, code)
- If the SLO type is monitor-based, focus on what's causing the monitor to alert
- If the SLO type is metric-based, focus on what's driving the metric below threshold

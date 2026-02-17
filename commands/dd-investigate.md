---
name: dd-investigate
description: Deep investigation of a service issue using Datadog signals and local codebase
user_invocable: true
argument: <service name or error description>
---

# Datadog Investigation

Investigate: **$ARGUMENTS**

## Instructions

You are an on-call engineer investigating an issue. Follow this structured workflow to identify the root cause.

### Phase 1: Gather Signals

Run these dd-bark commands in parallel to collect evidence:

1. **Error logs** — recent errors for the service/query:
   ```bash
   dd-bark get-logs --query="service:$ARGUMENTS status:error" --limit=50
   ```

2. **APM traces with errors** — find failing requests:
   ```bash
   dd-bark list-traces --query="status:error" --service="$ARGUMENTS" --limit=20
   ```

3. **Monitor status** — check what's alerting:
   ```bash
   dd-bark get-monitors --groupStates='["alert","warn","no data"]' --name="$ARGUMENTS"
   ```

4. **Active incidents** — any ongoing incidents:
   ```bash
   dd-bark list-incidents --pageSize=10
   ```

Adapt the queries based on what `$ARGUMENTS` describes. If it's an error message, search logs by that message. If it's a service name, use it as the service filter.

### Phase 2: Analyze & Correlate

Look at the data you collected:
- **Error patterns:** Are errors clustered? Same error message repeating? Same trace ID?
- **Timeline:** When did errors start? Is there a spike or steady stream?
- **Scope:** One service or multiple? One endpoint or many?
- **Monitors:** Which monitors triggered and when?

If the initial data suggests the issue spans multiple services, use the `sre-investigator` agent to do a broader cross-service investigation:
```
Use the Task tool with subagent_type="general-purpose" and team_name if applicable
```

### Phase 3: Cross-Reference with Code

Search the local codebase for relevant source files:
- Use Grep to find code related to error messages, failing endpoints, or service names
- Use Glob to find configuration files, route definitions, or error handlers
- Read relevant source files to understand the code path

### Phase 4: Report

Present your findings in this format:

```
## Investigation: $ARGUMENTS

### Summary
One-paragraph summary of what's happening.

### Evidence
- **Errors:** What errors are occurring, frequency, first seen
- **Traces:** Which endpoints/operations are failing
- **Monitors:** Which monitors are alerting
- **Incidents:** Related active incidents

### Root Cause Hypothesis
Your best assessment of what's causing the issue, with supporting evidence.

### Recommended Actions
1. Immediate steps to mitigate
2. Follow-up investigation or fixes needed
```

Be specific. Reference actual error messages, trace IDs, and monitor names from the data.

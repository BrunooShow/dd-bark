---
name: dd
description: Quick Datadog health check for a service or query
model: haiku
user_invocable: true
argument: <service name or query>
---

# Quick Datadog Health Check

Run a fast health check for: **$ARGUMENTS**

## Instructions

You are doing a quick health check. Be fast and concise. Run the following dd-bark commands in parallel using Bash, then summarize the results.

### Step 1: Gather data (run in parallel)

1. **Monitor status** — check for alerts/warnings related to the query:
   ```bash
   dd-bark get-monitors --groupStates='["alert","warn"]' --name="$ARGUMENTS"
   ```

2. **Recent error logs** — check for errors in the last 15 minutes:
   ```bash
   dd-bark get-logs --query="service:$ARGUMENTS status:error" --limit=10
   ```

3. **Active incidents** — check for ongoing incidents:
   ```bash
   dd-bark list-incidents --pageSize=5
   ```

Adapt the queries if `$ARGUMENTS` looks like a Datadog query rather than a service name (e.g. if it contains `status:` or `env:`).

### Step 2: Summarize

Present a concise health summary:

```
## <service> Health Check

**Status: ✅ Healthy / ⚠️ Degraded / 🔴 Critical**

**Monitors:** X alerting, Y warning, Z ok
**Errors (15 min):** N errors — [top error message if any]
**Incidents:** N active — [brief description if any]
```

Keep it short. If everything looks clean, say so in one line. If there are issues, highlight the most important ones.

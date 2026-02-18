---
name: hop-investigate
description: Higher-order prompt — loads a saved investigation playbook and executes it against a service. Decouples playbook definition from execution.
user_invocable: true
argument: <service-name> <playbook-name> [agent]
---

# HOP: Run Investigation Playbook

Execute a saved playbook against a service.

## Variables

- `SERVICE`: first argument from `$ARGUMENTS` (required)
- `PLAYBOOK`: second argument — name of playbook file without `.md` (required)
- `AGENT`: third argument — `sre` or `default` (optional, defaults to `default`)
- `PLAYBOOKS_DIR`: `playbooks/`

## Workflow

### Phase 1: Parse and Validate

Parse `$ARGUMENTS`:
1. Extract `SERVICE` (first word)
2. Extract `PLAYBOOK` (second word)
3. Extract `AGENT` (third word, if present)

If no arguments provided, list all available playbooks:
```
Use Glob to find all .md files in playbooks/
```
Then print the list and stop:
```
Available playbooks:
- high-error-rate — Investigate high error rate for a service
- high-latency — Investigate latency issues
- service-degradation — General service degradation investigation
[etc.]

Usage: /bark:hop-investigate <service> <playbook> [sre]
```

Validate that `playbooks/{PLAYBOOK}.md` exists. If not, show available playbooks and stop.

### Phase 2: Load Playbook

Read the playbook file:
```
Read playbooks/{PLAYBOOK}.md
```

The playbook contains investigation steps with `{SERVICE}` placeholders.

### Phase 3: Execute

Replace all `{SERVICE}` placeholders in the playbook with the actual service name.

**If AGENT is `sre`:**
Spawn an `sre-investigator` agent via the Task tool with the resolved playbook as the prompt. This is for complex, cross-service investigations.

**If AGENT is `default` (or omitted):**
Execute the playbook steps directly:
- Run all dd-bark commands from the playbook using Bash
- Run independent queries in parallel
- Follow the playbook's analysis instructions
- Generate the report as specified in the playbook

### Phase 4: Report

Return the playbook's report format, prefixed with:

```
## Playbook: {PLAYBOOK}
**Service:** {SERVICE}
**Agent:** {AGENT}
**Executed:** [timestamp]

---

[playbook report output]
```

## Guidelines

- Playbooks are reusable investigation templates. They should work for any service name.
- The HOP pattern means: this command doesn't know what investigation to run — it loads that from the playbook file.
- Adding a new investigation type = adding a new `.md` file in `playbooks/`. No code changes needed.

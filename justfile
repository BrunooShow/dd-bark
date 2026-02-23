# dd-bark justfile — agentic reusability layer
# Usage: just bark <service>    or    just <recipe> <args>
#
# Architecture:
#   Layer 1: Skill        → skills/dd-bark/SKILL.md (raw capability)
#   Layer 2: Agents       → agents/ (parallel workers)
#   Layer 3: Commands     → commands/ (orchestration)
#   Layer 4: Justfile     → this file (reusability entry points)

set dotenv-load

default_service := "my-service"

default:
    @just --list

# ─── Layer 1: Skill (Quick Access) ───────────────────────────

# Quick health check for a service
bark service=default_service:
    claude "/dd {{service}}"

# ─── Layer 2: Agents (Scale) ─────────────────────────────────

# Deep SRE investigation via agent
bark-sre service=default_service:
    claude "Use the @sre-investigator agent to investigate: {{service}}"

# Check a single service with the lightweight checker agent
bark-check service=default_service:
    claude "Use the @service-checker agent to check: {{service}}"

# Analyze metrics for a service
bark-metrics service=default_service:
    claude "Use the @metric-analyzer agent to analyze metrics for: {{service}}"

# ─── Layer 3: Commands (Orchestration) ────────────────────────

# Deep investigation with codebase cross-reference
bark-investigate service=default_service:
    claude "/dd-investigate {{service}}"

# Generate observability report
bark-report service=default_service:
    claude "/dd-report {{service}}"

# Multi-service health audit (parallel fan-out)
bark-audit config="":
    claude "/dd-audit {{config}}"

# Post-deploy verification
bark-deploy service=default_service deploy_time="":
    claude "/dd-post-deploy {{service}} {{deploy_time}}"

# Incident signal correlation
bark-correlate service=default_service:
    claude "/dd-correlate {{service}}"

# SLO breach investigation (with optional --deep for code fix proposals)
bark-slo service=default_service deep="":
    claude "/dd-slo-investigate {{service}} {{deep}}"

# ─── Layer 3.5: HOP (Higher-Order Prompts) ───────────────────

# Run an investigation playbook against a service
bark-playbook service=default_service playbook="high-error-rate" agent="default":
    claude "/bark:hop-investigate {{service}} {{playbook}} {{agent}}"

# List available playbooks
bark-playbooks:
    claude "/bark:hop-investigate"

# ─── Layer 4: Reusable Composed Workflows ─────────────────────

# Morning standup health sweep — audit all services, generate report
bark-standup:
    claude "/dd-audit"

# On-call first response — correlate signals then investigate
bark-oncall service=default_service:
    claude "First run /dd-correlate {{service}} to get a signal timeline, then based on the findings run /dd-investigate {{service}} for root cause analysis."

# Post-deploy full check — verify deploy then report if issues found
bark-shipit service=default_service deploy_time="":
    claude "Run /dd-post-deploy {{service}} {{deploy_time}}. If the verdict is FAIL, immediately run /dd-investigate {{service}} for root cause. If PASS, just confirm the deploy is healthy."

# Full service deep-dive — metrics + investigation + report
bark-deepdive service=default_service:
    claude "Use the @metric-analyzer agent for {{service}}, then run /dd-investigate {{service}}, then run /dd-report {{service}}. Present all findings as one combined report."

# Run playbook with SRE agent for complex cross-service issues
bark-escalate service=default_service playbook="service-degradation":
    claude "/bark:hop-investigate {{service}} {{playbook}} sre"

# SLO-driven investigation — check SLOs, investigate breaches, cross-ref code
bark-slo-deep service=default_service:
    claude "/dd-slo-investigate {{service}} --deep"

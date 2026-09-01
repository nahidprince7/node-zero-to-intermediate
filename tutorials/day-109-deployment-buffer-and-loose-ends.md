# Day 109 — Deployment Buffer and Loose Ends

> Review day: no new concepts. Use this session for real deployment variance and unresolved production blockers.

## Priority Order

1. data safety and migration correctness;
2. authentication/authorization and secret exposure;
3. application availability/readiness;
4. CI reproducibility;
5. documentation and polish.

## 0–15 Minutes — Triage Evidence

Collect failed CI run links, deployment events, health responses, sanitized logs with request IDs, migration status, image digest, and exact reproduction. Do not change several variables at once or paste credentials into issue notes.

## 15–45 Minutes — Diagnose

Common checks:

- container binds `0.0.0.0` and platform-provided port;
- runtime image contains compiled/generator/migration artifacts;
- production variables exist and parse correctly;
- database allows the host and connection limits are sane;
- migration marker matches the deployed code;
- trusted proxy, TLS forwarding, CORS, and health paths match the host;
- SIGTERM allows requests/connections to drain.

Fix the smallest verified cause, redeploy the same commit where possible, and rerun the smoke checklist.

## 45–60 Minutes — Close or Record

Every remaining item gets severity, owner, workaround, and next action. A deferred cosmetic issue can ship; unknown data-loss/auth risk cannot. Capture provider-specific lessons in the runbook while evidence is fresh.

## Completion Checklist

- [ ] CI is green for the deployed commit.
- [ ] Migration and database state are verified.
- [ ] Health, logs, TLS, and core journey work.
- [ ] No high-severity security/data issue remains.
- [ ] Deployment/runbook reflects actual behavior.
- [ ] Remaining debt is explicit rather than forgotten.


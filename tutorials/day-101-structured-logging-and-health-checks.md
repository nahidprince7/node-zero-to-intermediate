# Day 101 — Structured Logging and Health Checks

> Core lesson: about 90 minutes. Produce searchable operational events and health signals a platform can act on.

## Learning Objectives

- emit structured logs with request correlation;
- choose useful fields and redact secrets;
- distinguish liveness from readiness;
- expose bounded health checks with correct status.

## 0–30 Minutes — Structured Events

Use a Nest-compatible JSON logger. Each request should carry/generated request ID and log method, route template, status, duration, actor ID when known, and safe error classification. Avoid raw bodies and query strings containing credentials/search PII.

```json
{"level":"info","event":"http.completed","requestId":"...","method":"GET","route":"/posts/:slug","status":200,"durationMs":12}
```

Log once at the boundary rather than repeating the same exception at controller, service, repository, and filter. Redact authorization, cookie, password, token, database URL, and hashes. Use stable event names; logs are data, not prose dumps.

## 30–55 Minutes — Health Semantics

- liveness: process/event loop can respond; failure may restart it;
- readiness: instance can serve traffic, including required dependencies;
- startup: optional for slow initialization.

Use `@nestjs/terminus` or a small controlled endpoint. Readiness checks PostgreSQL with a short timeout. Do not make liveness depend on a temporary database outage or the platform may restart every healthy process and amplify failure.

## 55–75 Minutes — Contract

Return minimal non-sensitive JSON and 503 when not ready. Do not reveal hostnames, credentials, stack traces, or full dependency topology publicly. Configure deployment probes with timeouts and failure thresholds; test graceful shutdown removes readiness before termination.

## Practice

1. Correlate one failed request across logs.
2. Prove secrets are redacted recursively.
3. Stop PostgreSQL and compare live versus ready.
4. Simulate a slow health dependency and enforce timeout.
5. Document platform probe paths.

## Completion Checklist

- [ ] Logs are structured and correlated.
- [ ] Sensitive fields are redacted.
- [ ] Liveness and readiness have different meanings.
- [ ] Dependency checks are bounded.
- [ ] Shutdown and 503 behavior are verified.

## Official References

- [Nest logging](https://docs.nestjs.com/techniques/logger)
- [Nest health checks](https://docs.nestjs.com/recipes/terminus)


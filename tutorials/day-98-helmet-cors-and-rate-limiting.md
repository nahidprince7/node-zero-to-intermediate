# Day 98 — Helmet, CORS, and Rate Limiting

> Core lesson: about 90 minutes. Add layered HTTP hardening without breaking trusted clients.

## Learning Objectives

- set security headers with Helmet;
- configure an explicit CORS policy;
- rate-limit abuse-sensitive routes;
- behave correctly behind trusted proxies.

## 0–25 Minutes — Helmet

Install compatible versions and register Helmet early in bootstrap:

```ts
app.use(helmet());
```

Inspect response headers, understand any CSP/API documentation impact, and override defaults only for a specific reason. Headers reduce browser attack surface; they do not replace input validation, authorization, or TLS.

## 25–50 Minutes — CORS Is Browser Policy

Use an environment-derived allowlist, explicit methods/headers, and credentials only when needed:

```ts
app.enableCors({
  origin: ["https://app.example.com"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: false,
});
```

`*` cannot be combined safely with credentialed browser requests. CORS does not block curl/server-to-server attackers and is not authentication. Test allowed origin, denied origin, and preflight behavior.

## 50–75 Minutes — Rate Limits

Use `@nestjs/throttler` with stricter limits for login, registration, password reset, search, and comment creation. Return 429 consistently. In multi-instance production, in-memory counters diverge; use a shared store when required.

If deployed behind a proxy/load balancer, configure trusted proxy hops exactly so client IP resolution works and spoofed forwarding headers are not trusted. Prefer identity-based keys after authentication, with IP as another signal.

## Exercises

1. Inspect Helmet headers and Swagger behavior.
2. Test CORS preflight from allowed/denied origins.
3. Trigger 429 without slowing the whole suite.
4. Document proxy assumptions for the chosen host.
5. Decide route-specific limits and rationale.

## Completion Checklist

- [ ] Helmet runs early and headers are inspected.
- [ ] CORS uses an explicit environment-specific allowlist.
- [ ] Sensitive endpoints have appropriate limits.
- [ ] 429 behavior is tested.
- [ ] Proxy/IP trust assumptions are documented.

## Official References

- [Nest Helmet](https://docs.nestjs.com/security/helmet)
- [Nest CORS](https://docs.nestjs.com/security/cors)
- [Nest rate limiting](https://docs.nestjs.com/security/rate-limiting)


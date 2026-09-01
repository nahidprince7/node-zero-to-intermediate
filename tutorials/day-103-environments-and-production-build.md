# Day 103 — Development, Test, Production, and the Production Build

> Core lesson: about 90 minutes. Make environment differences explicit and prove the compiled artifact runs.

## Learning Objectives

- define environment-specific configuration without committed secrets;
- validate configuration at startup;
- produce and inspect a deterministic production build;
- run only runtime dependencies in production.

## 0–25 Minutes — Configuration Contract

Define required values and safe defaults: `NODE_ENV`, `PORT`, `DATABASE_URL`, JWT secret/issuer/audience, allowed origins, log level, proxy trust, and rate limits. Test configuration needs a dedicated database and predictable secrets; production has no fallback secrets.

Validate types/ranges/URLs on startup. Commit `.env.example` with names and harmless examples, not real values. Environment variables are strings; parse booleans/numbers explicitly.

## 25–50 Minutes — Build

```bash
npm ci
npm run lint
npm run test
npm run build
node dist/main.js
```

Inspect `dist/` and confirm imports, generated Prisma runtime/contract artifacts, migrations, and package module type work without TypeScript source execution. The start command should run compiled JavaScript, not a development watcher.

## 50–70 Minutes — Production Behavior

Use `NODE_ENV=production`, disable verbose errors/Swagger if policy requires, enable JSON logging and graceful shutdown, and verify trusted proxy/CORS settings. Install only production dependencies in the runtime image, while build tooling remains in the build stage.

## Practice

1. Start with each required variable missing and inspect the safe error.
2. Run compiled output against a disposable database.
3. Verify source maps/error stacks policy.
4. Compare `npm ci` and `npm install` roles.
5. Ensure development defaults cannot enter production silently.

## Completion Checklist

- [ ] Config schema fails fast without exposing values.
- [ ] `.env.example` documents all variables.
- [ ] Clean install, checks, and build succeed.
- [ ] `node dist/main.js` serves the API.
- [ ] Runtime artifact includes required Prisma/migration files.

## Official Reference

- [Nest configuration](https://docs.nestjs.com/techniques/configuration)


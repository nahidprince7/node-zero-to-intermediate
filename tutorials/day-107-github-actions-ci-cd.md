# Day 107 — CI/CD with GitHub Actions

> Core lesson: about 90–120 minutes. Run reproducible quality gates and database tests on every push and pull request.

## Learning Objectives

- build a least-privilege GitHub Actions workflow;
- cache/install dependencies reproducibly;
- run PostgreSQL-backed checks;
- keep deployment permissions and secrets separate from CI.

## 0–50 Minutes — CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-bookworm
        env:
          POSTGRES_USER: blog
          POSTGRES_PASSWORD: test_only
          POSTGRES_DB: blog_test
        ports: [5432:5432]
        options: >-
          --health-cmd "pg_isready -U blog -d blog_test"
          --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      DATABASE_URL: postgresql://blog:test_only@127.0.0.1:5432/blog_test
      NODE_ENV: test
      JWT_SECRET: ci-only-long-test-secret
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx prisma@latest migration check
      - run: npx prisma@latest db migrate --db "$DATABASE_URL"
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --runInBand
      - run: npm run test:e2e -- --runInBand
      - run: npm run build
```

Pin action major/SHA according to repository security policy and match Node/PostgreSQL with production. Test-only credentials are not production secrets.

## 50–75 Minutes — Trust Boundaries

Pull requests from forks must not receive deployment secrets. Keep deploy in a separate workflow/job protected by GitHub Environment approval. Grant only required permissions; prefer short-lived OIDC credentials over long-lived cloud keys when the host supports it.

Cancel superseded branch runs, set timeouts, upload useful test reports, and make required status checks protect `main`. Do not deploy if verify fails.

## Exercises

1. Push a deliberate lint/test/migration failure.
2. verify PostgreSQL health and migration logs;
3. inspect workflow permissions;
4. remove any unnecessary secret;
5. document required branch checks.

## Completion Checklist

- [ ] Clean checkout installs with `npm ci`.
- [ ] Migration, lint, types, tests, and build gate merges.
- [ ] Database tests use a service container.
- [ ] CI has read-only default permissions.
- [ ] Deployment credentials are isolated/protected.

## Official References

- [GitHub Actions Node.js](https://docs.github.com/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [PostgreSQL service containers](https://docs.github.com/actions/tutorials/use-containerized-services/create-postgresql-service-containers)


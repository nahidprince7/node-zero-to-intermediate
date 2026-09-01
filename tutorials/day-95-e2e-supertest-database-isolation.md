# Day 95 — E2E Setup: Supertest and Database Isolation

> Core lesson: about 90–120 minutes. Boot the real HTTP application and create a safe, repeatable E2E harness.

## Learning Objectives

- initialize Nest with the same global pipes/filters as production;
- send HTTP requests with Supertest;
- use a dedicated migrated test database;
- isolate data and close every resource.

## 0–25 Minutes — One App Configuration Function

Extract global setup from `main.ts`:

```ts
export function configureApp(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // filters, prefix, versioning, serialization
  return app;
}
```

Production bootstrap and tests both call it. Otherwise E2E may pass while real validation differs.

## 25–50 Minutes — Supertest Harness

```ts
beforeAll(async () => {
  assertSafeTestDatabase(process.env.DATABASE_URL);
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = configureApp(moduleRef.createNestApplication());
  await app.init();
});

afterAll(async () => app.close());

it("GET /health responds", () =>
  request(app.getHttpServer()).get("/health").expect(200));
```

Do not call `listen()`; Supertest uses the in-memory server. Capture the module/app handles and close them even after failures.

## 50–75 Minutes — Isolation

Apply migrations before the suite. Reset rows before each test or create unique per-test identities and clean afterward. Avoid relying on seed order or auto-increment values. Serial execution is simpler at first; parallel workers need separate schemas/databases.

## Practice

1. Test validation, 404 filter, and response envelope over HTTP.
2. Prove global configuration is shared.
3. Run twice with no duplicate failures.
4. Deliberately leave a handle open, diagnose it, then fix it.
5. Prove cleanup guard refuses the development database.

## Completion Checklist

- [ ] E2E boots the real `AppModule`.
- [ ] Production and test share global configuration.
- [ ] Test database is migrated and protected.
- [ ] Tests are repeatable and order-independent.
- [ ] App/database resources close cleanly.

## Official Reference

- [Nest E2E testing](https://docs.nestjs.com/fundamentals/testing#end-to-end-testing)

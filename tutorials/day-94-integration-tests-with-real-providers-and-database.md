# Day 94 — Integration Tests: Real Providers and Database

> Core lesson: about 90–120 minutes. Exercise Nest modules and Prisma repositories against an isolated PostgreSQL database.

## Learning Objectives

- define the boundary of an integration test;
- connect real providers to a dedicated test database;
- apply migrations and isolate test data;
- verify constraints, queries, mapping, and transactions.

## 0–20 Minutes — Test Boundary

Import the real feature module, repository adapter, database provider, and configuration. Call services directly rather than HTTP. Replace only external systems not under test (email, third-party API, real clock when needed).

Never point tests at development or production. Require a database name suffix such as `_test` and fail closed before cleanup if it does not match.

## 20–45 Minutes — Database Lifecycle

At suite setup, connect to the dedicated database and apply committed migrations. Before each test, clean tables in foreign-key-safe order or use a transaction strategy compatible with the application connection. Seed only data the test explicitly needs.

```ts
beforeAll(async () => {
  assertSafeTestDatabase(process.env.DATABASE_URL);
  moduleRef = await Test.createTestingModule({ imports: [PostsModule] }).compile();
  await moduleRef.init();
});

afterAll(async () => moduleRef.close());
```

Global transaction rollback is fast but can hide commit/concurrency behavior. Use explicit cleanup for transaction tests.

## 45–75 Minutes — What to Prove

Test unique slug/email constraints, foreign keys, relation includes, stable ordering, visibility filters, soft-delete defaults, tag replacement atomicity, publish transaction rollback, and mapping from storage errors to domain results.

## Exercises

1. Make a safety guard reject a non-test database URL.
2. Run the suite twice and in a different test order.
3. Trigger a real duplicate constraint.
4. Verify rollback leaves neither partial write.
5. Inspect open handles if Jest does not exit.

## Completion Checklist

- [ ] Integration tests use a dedicated database.
- [ ] Cleanup cannot target a non-test database.
- [ ] Real module/provider wiring is exercised.
- [ ] Constraints and transactions are proven.
- [ ] Suite order does not affect results.


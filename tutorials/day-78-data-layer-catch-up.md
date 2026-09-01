# Day 78 — Data Layer Catch-Up and Review

> Review day: no new concepts. Repair gaps and prove Days 66–77 from an empty database.

## Outcome

By the end, another developer can clone the project, migrate, seed, start Nest, and exercise the data API without manual database edits.

## 0–15 Minutes — Recall Without Notes

Draw users, posts, categories, tags, post-tags, and comments. Mark primary keys, foreign keys, unique constraints, null fields, and delete actions. Then explain contract → emit → migration plan → review → apply.

## 15–35 Minutes — Clean Rebuild Proof

Use a disposable database, never one containing valuable work.

1. create the empty database;
2. apply committed migrations in order;
3. run the seed twice;
4. inspect migration status and table constraints;
5. start the API and watch startup/shutdown behavior.

If this fails, fix migration or setup instructions instead of manually repairing the database.

## 35–55 Minutes — API Smoke Test

Run a `.http` collection covering:

- create/read/update/delete post;
- draft exclusion from public reads;
- unique slug conflict;
- category assignment and tag replacement;
- comment create/list/delete;
- invalid DTO, unknown parent, and invalid relation;
- a transaction rollback proof.

Record expected status codes beside every request.

## 55–60 Minutes — Debt List

Classify each issue as correctness, security, maintainability, or polish. Fix correctness/security first. Do not add auth early today; Days 79–84 introduce it in dependency order.

## Review Questions

1. Which constraints belong in PostgreSQL even if DTOs exist?
2. Who owns the database connection lifecycle?
3. Where are ORM errors translated?
4. Which operation requires a transaction and why?
5. Where could an N+1 query appear?
6. Can a relation prove authorization?

## Completion Checklist

- [ ] A disposable database rebuild works without manual SQL.
- [ ] The seed is repeatable.
- [ ] Every data endpoint has a smoke request.
- [ ] Failure paths return the consistent error shape.
- [ ] No controller directly queries Prisma.
- [ ] Remaining debt is written and prioritized.


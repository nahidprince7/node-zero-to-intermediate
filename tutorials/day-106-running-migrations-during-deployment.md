# Day 106 — Running Migrations During Deployment

> Core lesson: about 90 minutes. Apply reviewed schema changes once, before incompatible application traffic.

## Learning Objectives

- separate migration planning from production application;
- preview/check/apply Prisma 8 migrations in a deployment job;
- design backward-compatible expand/contract changes;
- recover forward without casual production resets.

## 0–25 Minutes — Deployment Rule

Development authors and reviews migrations. CI checks committed artifacts. Deployment supplies production credentials and applies already-reviewed migrations:

```bash
npx prisma@latest migration check
npx prisma@latest migration status --db "$DATABASE_URL"
npx prisma@latest db migrate --show --db "$DATABASE_URL"
npx prisma@latest db migrate --db "$DATABASE_URL"
npx prisma@latest db verify --db "$DATABASE_URL"
```

Do not plan/edit migrations, push schema, or reset in production. Never print the connection URL. Use the exact commands supported by the pinned Prisma 8 version.

## 25–55 Minutes — Expand and Contract

For a breaking column change across rolling instances:

1. expand: add nullable/new structure compatible with old code;
2. deploy code that writes/reads both as needed;
3. backfill in bounded, restartable batches;
4. verify completeness;
5. switch reads;
6. later contract: remove old structure.

Adding a required column with no safe default to a large populated table is not one blind step. Estimate locks/rewrite time and rehearse on staging-like data.

## 55–75 Minutes — Failure and Recovery

Run migrations as a single release job, not in every API replica. Prisma 8 serializes PostgreSQL applies, but ownership/visibility remain clearer with one job. If application deploy fails after a compatible migration, roll application back while schema remains compatible. Recover destructive/broken changes with a reviewed forward migration and restored backup only under an explicit recovery plan.

## Exercises

1. Rehearse pending migrations on a staging clone.
2. Design expand/contract for renaming `body`.
3. Interrupt and safely retry a disposable migration.
4. Write pre/post-deploy verification queries.
5. Define backup/restore owner and recovery objective.

## Completion Checklist

- [ ] CI checks migration artifacts offline.
- [ ] Deployment previews and applies committed migrations.
- [ ] Migration job runs before incompatible traffic.
- [ ] Breaking changes use expand/contract.
- [ ] Rollback/recovery avoids destructive improvisation.

## Official Reference

- [Applying a migration in Prisma 8](https://www.prisma.io/docs/orm/migrations/applying-a-migration)


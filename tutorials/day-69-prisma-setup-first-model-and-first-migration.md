# Day 69 — Prisma 8: Setup, First Model, and First Migration

> Core lesson: about 90–120 minutes. This lesson targets the current Prisma 8 contract workflow and requires Node 24 or newer.

## Learning Objectives

You will learn to:

- initialize Prisma 8 inside the existing Nest project;
- distinguish the authored contract, emitted artifacts, migration files, and database schema;
- model a first PostgreSQL table with PSL;
- plan, review, and apply a migration;
- connect the generated runtime and execute typed queries;
- avoid mixing Prisma 7 commands and client syntax into Prisma 8.

## 0–12 Minutes — Confirm Version and Database Isolation

Prisma 8 is a major redesign. Check prerequisites and record the actual version:

```bash
node --version
npx prisma@latest --version
```

Use Node 24 or newer. If a real project is intentionally pinned to supported Prisma 7, follow its versioned documentation instead of mixing the two workflows.

Day 67 created tables manually in database `blog`. Create an empty learning database so the first Prisma migration does not collide:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-68
docker compose exec db createdb -U blog blog_prisma
```

Use:

```text
DATABASE_URL=postgresql://blog:blog_dev_only@127.0.0.1:5432/blog_prisma
```

Creating a separate database preserves Day 67 work and gives the migration an honest empty starting point.

## 12–28 Minutes — Initialize Prisma 8

From the Nest project:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-54
npx prisma@latest orm init --yes --target postgres --authoring psl
```

Review every generated or modified file. The current scaffold includes Prisma configuration, a PSL contract, emitted/runtime support, scripts, and version-specific guidance. Keep its generated import paths and package versions together.

Set the ignored `.env` connection string. The CLI configuration may load `.env`, but application runtime code must also receive `DATABASE_URL`; do not assume CLI loading automatically configures every Node process.

Core Prisma 8 concepts:

```text
contract.prisma  -> source model you author
contract.json/.d.ts -> emitted machine/runtime artifacts
migration package -> reviewed change from one contract state to another
PostgreSQL schema -> actual tables, columns, keys, and constraints
```

## 28–42 Minutes — First PSL Model

In the generated contract path—normally `prisma/contract.prisma`—define:

```prisma
model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  displayName String   @map("display_name")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("app_user")
}
```

- model and field names shape the typed ORM API;
- `@@map` and `@map` choose physical SQL names;
- `@id`, `@unique`, defaults, and nullability become database intent;
- `String?` would be nullable; `String` is required.

Do not add every blog model at once. A small migration is easier to understand and review.

## 42–60 Minutes — Emit, Plan, Review, Apply

Emit the authored contract:

```bash
npx prisma@latest contract emit
```

Plan the first migration without changing the database:

```bash
npx prisma@latest migration plan --name init
```

Read the generated migration TypeScript, operation data, and DDL preview. Verify:

- table is `app_user`;
- ID is generated and primary;
- email is unique and required;
- mapped columns have expected names;
- timestamp type/default are acceptable.

Only then apply and advance the development database reference:

```bash
npx prisma@latest db migrate --advance-ref db
```

Check status and inspect PostgreSQL:

```bash
npx prisma@latest migration status
cd ../day-68
docker compose exec db psql -U blog -d blog_prisma -c '\d app_user'
```

Migration files are source-controlled history. Do not edit an already-applied shared migration casually; create a new planned change.

## 60–78 Minutes — First Typed Query

Use the generated `db` module. Create a temporary script in the Nest project:

```ts
import "dotenv/config";
import { db } from "./prisma/db.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const runtime = await db.connect({ url: databaseUrl });

try {
  const created = await db.orm.public.User.create({
    email: "learner@example.test",
    displayName: "Learner",
  });

  const users = await db.orm.public.User
    .select("id", "email", "displayName", "createdAt")
    .orderBy((user) => user.id.asc())
    .all();

  console.log({ created, users });
} finally {
  await runtime.close();
}
```

Run it with the project's TypeScript runner or generated script. Re-running creation triggers the database unique constraint; handle that deliberately rather than deleting the constraint.

Prisma 8 uses `.create({ field: value })`, not Prisma 7's `.create({ data: ... })`. Models are under the PostgreSQL schema namespace such as `db.orm.public.User`.

## 78–88 Minutes — Migration Mental Model

The development loop is:

```text
edit PSL contract
  -> contract emit
  -> migration plan
  -> review generated operations and SQL
  -> db migrate
  -> verify schema and query
```

Planning and applying are separate so schema changes are reviewable. A migration is not merely “synchronize whatever is in the file.” It is versioned intent for moving stored data and structure between known states.

Never reset a database containing valuable data just because a development command suggests it. Diagnose contract/history/database divergence first and obtain explicit authority for destructive recovery.

## Guided Practice — First Prisma Model

1. Verify Node and Prisma versions.
2. create the isolated `blog_prisma` database;
3. initialize Prisma 8 with PSL;
4. inspect all generated changes;
5. author and emit `User`;
6. plan and review the initial migration;
7. apply and inspect the actual table;
8. create/read a user through the typed ORM.

## Independent Exercises

1. Trigger and inspect a unique-email failure.
2. Add optional `bio`, then emit/plan a second migration.
3. Confirm the second plan is a delta, not full schema creation.
4. Compare model names with mapped SQL names.
5. Query only selected columns.
6. Update and delete one test record with explicit filters.
7. Inspect migration status and database table definition.
8. Explain four layers: source contract, emitted contract, migration, database.

## Common Mistakes and Debugging Advice

- Do not mix Prisma 7 and Prisma 8 commands or query shapes.
- Prisma 8 requires the documented Node version.
- Use an empty isolated database for an initial migration.
- Re-emit after changing the authored contract.
- Plan and read migrations before applying them.
- Keep the database reference current when planning deltas.
- Application runtime still needs its environment variables.
- Never expose the database URL in logs or screenshots.

## Review Questions

1. Why isolate `blog_prisma` from Day 67's tables?
2. What does contract emission produce?
3. How does migration planning differ from applying?
4. What do `@map` and `@@map` change?
5. Why review generated SQL?
6. Where are PostgreSQL ORM models namespaced?
7. How does Prisma 8 create syntax differ from Prisma 7?
8. Why preserve migration history?

## Completion Checklist

- [ ] Current Node and Prisma versions are recorded.
- [ ] Prisma uses an isolated PostgreSQL database.
- [ ] First contract emits successfully.
- [ ] Initial migration is reviewed and applied.
- [ ] Actual table and constraints are inspected.
- [ ] Typed create/select query succeeds.
- [ ] Second delta workflow is understood.
- [ ] All exercises and review questions are complete.

## Official References

- Prisma 8 overview: https://www.prisma.io/docs/orm
- Prisma 8 `orm init`: https://www.prisma.io/docs/cli/orm-init
- Prisma 8 PSL authoring: https://www.prisma.io/docs/orm/contract-authoring/psl-syntax
- Prisma 8 migrations: https://www.prisma.io/docs/orm/migrations/how-migrations-work

## What to Send for Review

Send version output, generated structure, contract, reviewed migration/DDL, table inspection, typed query output, second-delta explanation, exercises, and review answers. Next: **Day 70 — Relations in Prisma**.

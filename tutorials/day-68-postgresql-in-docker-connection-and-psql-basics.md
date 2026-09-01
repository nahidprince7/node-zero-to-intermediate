# Day 68 — PostgreSQL in Docker: Connection and `psql` Basics

> Core lesson: commonly 90–120 minutes. Container downloads, port conflicts, and platform setup can make this a two-session lesson.

## Learning Objectives

You will learn to:

- run a pinned PostgreSQL major version with Docker Compose;
- persist development data in a named volume;
- inspect container health and logs;
- connect with `psql` inside and outside the container;
- execute the Day 67 SQL safely;
- distinguish stopping a container from deleting its data.

## Prerequisites

Check tools without installing anything blindly:

```bash
docker --version
docker compose version
docker info
```

If Docker is missing or the daemon is unavailable, follow the official installation instructions for your operating system. Do not run unrelated privileged commands from an unverified tutorial.

## 0–20 Minutes — Compose a Development Database

Create `practice/day-68/compose.yaml`:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: blog_dev_only
      POSTGRES_DB: blog
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - blog_postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blog -d blog"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  blog_postgres_data:
```

The credentials are explicit throwaway local-development values. Do not reuse them in staging or production. Pinning a major version avoids silently crossing a database major upgrade when `latest` changes.

PostgreSQL 18's official image mounts persistent storage at `/var/lib/postgresql`; older image tutorials commonly show `/var/lib/postgresql/data`. Match the mount target to the pinned image's official documentation.

Binding to `127.0.0.1` keeps the host-published port local. Container/network/firewall configuration still deserves review on every platform.

## 20–35 Minutes — Start and Inspect

```bash
cd /home/nahid/Projects/Learning/app/practice/day-68
docker compose up -d
docker compose ps
docker compose logs db
```

Wait for healthy status. Follow new logs when diagnosing startup:

```bash
docker compose logs --follow db
```

Stop following with Ctrl+C; that does not stop the container.

If host port 5432 is occupied, identify the existing service before changing anything. You may map `127.0.0.1:5433:5432` and use host port 5433, or intentionally use the existing PostgreSQL instance.

## 35–50 Minutes — Connect with `psql`

Use the client already inside the image:

```bash
docker compose exec db psql -U blog -d blog
```

Useful `psql` commands:

```text
\conninfo
\l
\dn
\dt
\d app_user
\x
\q
```

Backslash commands are `psql` client commands, not SQL and do not need semicolons. SQL statements do.

Try:

```sql
SELECT current_database(), current_user, version();
SELECT now();
```

## 50–65 Minutes — Run the SQL File

From `practice/day-68`, stream Day 67's file to `psql`:

```bash
docker compose exec -T db psql \
  --set ON_ERROR_STOP=on \
  -U blog \
  -d blog \
  < ../day-67/blog.sql
```

`ON_ERROR_STOP` prevents the client from quietly continuing after an error. Re-running a file containing unconditional `CREATE TABLE` or fixed unique values will fail; decide whether a script is a one-time migration, an idempotent setup, or disposable seed data.

Inside `psql`, inspect tables and run the Day 67 queries. Predict results first.

## 65–78 Minutes — Connect the Application

For an app running on the host:

```text
DATABASE_URL=postgresql://blog:blog_dev_only@127.0.0.1:5432/blog
```

For an app container in the same Compose network, the host is the service name `db`, not `127.0.0.1`:

```text
postgresql://blog:blog_dev_only@db:5432/blog
```

Put the local URL in an ignored `.env`; keep a placeholder in `.env.example`. URL-encode credentials containing reserved URI characters.

Test host connectivity with an installed `psql` if available:

```bash
psql "postgresql://blog:blog_dev_only@127.0.0.1:5432/blog"
```

## 78–90 Minutes — Lifecycle and Data Safety

```bash
docker compose stop
docker compose start
docker compose down
```

These preserve the named volume. This command deletes it:

```bash
docker compose down --volumes
```

Use volume deletion only when you intentionally want to erase this development database and have confirmed the exact Compose project. It is not a normal stop command and is not a backup strategy.

The official image's initialization environment variables apply when the data directory is empty. Changing `POSTGRES_PASSWORD` in Compose does not rewrite an already-initialized volume's database password.

## Guided Practice — Working Local PostgreSQL

1. Start the pinned database and reach healthy state.
2. connect with container `psql`;
3. inspect connection, schemas, and tables;
4. execute Day 67 SQL with stop-on-error;
5. run CRUD and join queries;
6. stop/start and confirm persistence;
7. configure the Nest `DATABASE_URL` safely;
8. document the deliberate reset procedure without running it unnecessarily.

## Independent Exercises

1. Resolve a deliberate host-port conflict safely.
2. Compare host and Compose-network connection URLs.
3. Inspect table definitions with `\d`.
4. Run one transaction and roll it back.
5. Trigger a unique and foreign-key violation.
6. restart the container and verify rows persist.
7. change an initialization variable and explain why existing data is unchanged.
8. back up a small development database with `pg_dump` before testing restore later.

## Common Mistakes and Debugging Advice

- Verify the Docker daemon, not only the CLI binary.
- Wait for database readiness.
- Distinguish host ports from container ports.
- Inside Compose, connect to service name `db`.
- Keep real connection strings out of Git and logs.
- Initialization variables affect an empty data directory.
- `down --volumes` deletes development data.
- A persistent volume is not a backup.

## Review Questions

1. Why pin a PostgreSQL major version?
2. What does the health check prove?
3. How do SQL and `psql` commands differ?
4. Why use `ON_ERROR_STOP`?
5. Which hostname does a host app use? A sibling container?
6. What persists after `docker compose down`?
7. What does `down --volumes` remove?
8. Why do changed initialization variables not alter an existing cluster?

## Completion Checklist

- [ ] PostgreSQL container reaches healthy state.
- [ ] `psql` connects and inspects the database.
- [ ] Day 67 SQL executes successfully.
- [ ] CRUD, constraints, and joins are observed.
- [ ] Nest has a safe local connection URL.
- [ ] Stop/start persistence is confirmed.
- [ ] Destructive reset behavior is understood.
- [ ] All exercises and review questions are complete.

## Official References

- PostgreSQL Docker Official Image: https://hub.docker.com/_/postgres
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL `psql`: https://www.postgresql.org/docs/current/app-psql.html
- PostgreSQL connection strings: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING

## What to Send for Review

Send Compose file, healthy status, safe logs, `psql` output, Day 67 results, persistence test, connection configuration, exercises, and review answers. Next: **Day 69 — Prisma Setup, First Model, and First Migration**.

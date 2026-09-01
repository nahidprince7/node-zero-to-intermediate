# Day 105 — Docker Compose: API and PostgreSQL Together

> Core lesson: about 90–120 minutes. Run the application stack with service discovery, health checks, and persistent database data.

## Learning Objectives

- define API and PostgreSQL services;
- connect by Compose service name;
- persist database data in a named volume;
- wait for database health rather than mere process start.

## 0–45 Minutes — Compose File

```yaml
services:
  db:
    image: postgres:17-bookworm
    environment:
      POSTGRES_USER: blog
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: blog
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blog -d blog"]
      interval: 5s
      timeout: 3s
      retries: 10
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://blog:${POSTGRES_PASSWORD}@db:5432/blog
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:
```

Inside the API container, `localhost` means the API container; use hostname `db`. Pin compatible image versions. Do not commit real Compose override secrets.

## 45–70 Minutes — Operate the Stack

```bash
docker compose config
docker compose up --build
docker compose ps
docker compose logs api
docker compose down
```

`down` keeps named volumes; `down -v` deletes them and is destructive. Use the latter only for an explicitly disposable learning database after resolving the exact project/volume.

`depends_on: service_healthy` orders startup, but the application should still handle transient connection failure sensibly. Migrations are handled as a controlled deployment step on Day 106, not by every API replica racing at startup.

## Practice

1. Start from no containers and verify health transitions.
2. Restart API and prove rows persist.
3. stop/restart PostgreSQL and inspect readiness/logs;
4. inspect the Compose network and service DNS;
5. document safe backup/volume deletion commands.

## Completion Checklist

- [ ] `docker compose config` resolves safely.
- [ ] API connects through hostname `db`.
- [ ] PostgreSQL health gates API creation.
- [ ] Data survives normal `down`/`up`.
- [ ] Volume deletion risk is documented.

## Official Reference

- [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)

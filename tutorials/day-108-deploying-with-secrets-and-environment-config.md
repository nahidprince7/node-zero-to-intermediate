# Day 108 — Deploying to a Host

> Core lesson: about 90–120 minutes. Deploy the Dockerized API using managed secrets, database networking, probes, and verification.

## Learning Objectives

- evaluate a container host against application requirements;
- provision production configuration and PostgreSQL safely;
- deploy migration and API release steps;
- verify, observe, and roll back a release.

## 0–25 Minutes — Host Checklist

Choose a host that supports the Node 24 container, managed PostgreSQL or private database networking, TLS/custom domain, runtime secrets, one-off release jobs, health probes, logs, backups, and rollback. Record region, cost limits, sleep/scale behavior, connection limits, and data residency.

This tutorial is provider-neutral because dashboards and plans change. Follow the selected host's current official guide and do not paste production secrets into chat, Git, image layers, or screenshots.

## 25–55 Minutes — Provision and Release

1. create production PostgreSQL with backups and least-privilege app credentials;
2. configure `DATABASE_URL`, JWT secret/issuer/audience, CORS origins, proxy trust, log level, and port through secret/config management;
3. build the exact reviewed commit/image;
4. run Day 106 migration check/preview/apply as a release job;
5. deploy API instances only after success;
6. configure readiness/liveness and graceful termination;
7. attach TLS/domain and restrict database ingress.

Do not seed example users into production. Create the first admin through a controlled one-time mechanism with audit trail.

## 55–80 Minutes — Verify and Roll Back

Smoke-test health, Swagger policy, registration/login, public posts, authenticated author action, database persistence across restart, CORS, rate limit, logs, and secret redaction. Watch error rate/latency during rollout.

Rollback means deploy the previous compatible image; database rollback follows the migration recovery plan, not an automatic destructive reversal. Keep a release record: commit, image digest, migration marker, time, operator, and verification result.

## Exercises

1. Write the chosen host runbook with exact current UI/CLI steps.
2. rotate JWT/database credentials in staging;
3. simulate failed readiness and failed migration;
4. prove database is not publicly open;
5. perform one staging image rollback.

## Completion Checklist

- [ ] Production uses managed runtime secrets.
- [ ] Database networking/backups are configured.
- [ ] Migrations run as a controlled release step.
- [ ] TLS, probes, logs, and graceful shutdown work.
- [ ] Smoke test and compatible rollback are rehearsed.


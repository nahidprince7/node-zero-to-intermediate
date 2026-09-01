# Day 91 — Working Blog API Catch-Up

> Review day: no new concepts. Prove the complete feature set from registration through moderation.

## Learning Objectives

- rebuild the application from migrations and configuration;
- exercise the complete authorization and feature matrix;
- locate correctness, security, and operability gaps;
- freeze a stable baseline before production-quality work.

## 0–15 Minutes — Recall and Inventory

Without notes, draw the request lifecycle and database relationships. List public, reader, author, and admin capabilities. Compare your list with Swagger and the Day 49 resource plan.

## 15–35 Minutes — Disposable Rebuild

Create a disposable PostgreSQL database, apply committed migrations, seed it twice, start Nest, and verify graceful shutdown. Never use a valuable database for reset/rebuild practice. Record exact commands in the project README.

## 35–55 Minutes — Full Smoke Journey

Run a version-controlled `.http` collection:

1. register and log in reader, two authors, and admin;
2. create/edit/publish an owned post and reject cross-author editing;
3. assign category/tags and list with pagination/filter/sort/search;
4. create comments, enforce ownership, and moderate as admin;
5. verify drafts, hidden comments, hashes, and internal fields never leak;
6. verify invalid, unauthorized, forbidden, conflicting, and missing cases.

## 55–60 Minutes — Baseline

Write each defect with reproduction, expected/actual behavior, and severity. Fix correctness/security blockers before Day 92. Commit only a passing, reproducible baseline.

## Completion Checklist

- [ ] A new disposable database works without manual repair.
- [ ] Swagger and actual routes agree.
- [ ] The role/ownership matrix is proven.
- [ ] Every list is bounded and visibility-safe.
- [ ] Known debt is recorded and prioritized.
- [ ] The working blog API baseline is committed.


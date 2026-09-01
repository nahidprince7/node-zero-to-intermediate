# Day 102 — Full Codebase Refactor Pass

> Review day: no new features. Improve structure while the complete test suite protects behavior.

## Learning Objectives

- identify duplication, leakage, oversized units, and inconsistent boundaries;
- refactor in small verified steps;
- align naming and module ownership;
- delete dead code and document deliberate debt.

## 0–15 Minutes — Establish Safety

Run format, lint, type-check, unit, integration, E2E, build, migration check, and a smoke request. Record timings and current failures. Do not mix feature work into this pass.

## 15–45 Minutes — Audit by Boundary

Search for controllers importing Prisma, HTTP exceptions in repositories, database entities returned directly, duplicated authorization predicates, raw environment reads outside config, client-owned identity/state fields, `any`, unsafe assertions, unbounded lists, and secret-bearing logs.

Refactor one theme at a time:

1. rename/extract;
2. run nearest fast tests;
3. run broader suite;
4. commit a coherent change.

Prefer boring explicit code over abstraction that only reduces line count. Keep repositories shaped around use cases, not a generic CRUD base class.

## 45–60 Minutes — Architecture Map

Update the README/module map showing request → controller → service/policy → repository → Prisma/PostgreSQL, plus auth guards, filters, logging, and configuration. Document exceptions to the rule and why they exist.

## Completion Checklist

- [ ] Baseline and final quality commands pass.
- [ ] No persistence records leak directly to HTTP.
- [ ] Authorization policies have one clear home.
- [ ] Environment/config access is centralized.
- [ ] Dead code and stale TODOs are removed.
- [ ] Remaining debt has owner/reason/priority.


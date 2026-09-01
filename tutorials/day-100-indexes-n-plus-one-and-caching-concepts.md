# Day 100 — Indexes, N+1 Queries, and Caching Concepts

> Core lesson: about 90–120 minutes. Measure database work, fix query shape, and cache only with an invalidation plan.

## Learning Objectives

- design indexes from real filter/order/join patterns;
- read basic `EXPLAIN (ANALYZE, BUFFERS)` output;
- detect and remove N+1 queries;
- reason about cache keys, staleness, and invalidation.

## 0–30 Minutes — Index for Queries

Inventory hot queries: published feed ordered by time/ID, posts by author/status, comments by post/time, taxonomy links, unique email/slug. Foreign keys are not automatically indexed in PostgreSQL. Add reviewed contract indexes matching leading filter and order columns.

Use realistic data and `EXPLAIN (ANALYZE, BUFFERS)` in a disposable environment. A sequential scan is not automatically bad on a small table; measure rows, estimates, sort, and buffers. Every index costs storage and write/update work.

## 30–55 Minutes — N+1

Enable safe query timing/count instrumentation. A loop loading each post's author/tags creates 1 + N queries. Replace it with a bounded include/join, batch by IDs, or a loader. Avoid the opposite mistake: one enormous cartesian include returning duplicated/unbounded data.

Write an integration test or performance assertion that counts queries for a representative page so N does not silently return.

## 55–80 Minutes — Cache Concepts

Cache only data expensive enough and stable enough to justify complexity. Define:

```text
key + value shape + TTL + owner + invalidation events + stale behavior
```

Good first candidate: public post detail by slug. Invalidate on edit, publish/unpublish, delete, and relevant author/category/tag changes. Per-process memory cache does not coordinate multiple instances; a distributed cache adds operational cost and belongs to the advanced phase.

Never cache authorization decisions or private responses under shared public keys. Prevent cache stampedes if a popular key expires.

## Exercises

1. Explain plans before/after one useful index.
2. Count queries for a 20-post response.
3. Remove one N+1 without unbounded includes.
4. Write a cache invalidation table.
5. Identify data that should not be cached.

## Completion Checklist

- [ ] Indexes map to measured query patterns.
- [ ] Query plans are captured with realistic data.
- [ ] A representative N+1 is removed and guarded.
- [ ] Cache proposal includes invalidation and audience safety.
- [ ] No cache is added merely because caching exists.

## Official References

- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [Nest caching](https://docs.nestjs.com/techniques/caching)

# Day 89 — Search Basics

> Core lesson: about 90 minutes. Build a safe first search and know when to move to PostgreSQL full-text search.

## Learning Objectives

- define searchable fields and visibility rules;
- normalize and validate a query;
- compare substring search with PostgreSQL full-text search;
- measure before adding indexes or external search systems.

## 0–20 Minutes — Search Contract

```text
GET /posts/search?q=dependency+injection&limit=20
```

Trim the query, collapse whitespace, enforce a minimum (for example 2) and maximum (for example 100), cap results, and return only published/scheduled-due content. Search title and excerpt first; searching full bodies may be slower and produce noisy relevance.

## 20–40 Minutes — Simple Substring Search

For a small learning dataset, combine case-insensitive title/excerpt predicates with OR. Parameterized ORM predicates protect values from SQL injection, but validation and limits are still required. Escape wildcard semantics if the API promises literal matching.

Substring search is easy but `%term%` often cannot use a normal B-tree index. Do not claim scalability based on a tiny seed database.

## 40–65 Minutes — PostgreSQL Full-Text Direction

PostgreSQL can turn documents into `tsvector`, queries into `tsquery`, rank matches, and accelerate them with a GIN index. A production migration might create a generated/search vector or maintained expression index over weighted title and body fields. Prisma 8 support and generated APIs are version-specific; use a reviewed parameterized SQL boundary when the ORM cannot express the indexed query.

Never interpolate `q` into raw SQL. Bind it as a parameter. Keep public visibility in the same query, and return snippets/highlights as derived response fields rather than modified stored content.

## 65–80 Minutes — Measure

Seed enough data to compare substring and full-text plans with `EXPLAIN (ANALYZE, BUFFERS)` in a disposable environment. Measure latency and rows examined. External search (OpenSearch/Meilisearch/etc.) adds synchronization and operations; it is not Day 89's default.

## Practice

1. Test empty, too-short, too-long, Unicode, punctuation, and no-result queries.
2. Confirm drafts never match publicly.
3. Compare AND versus OR word semantics.
4. Add deterministic tie-breaking after relevance.
5. Write the threshold that would justify full-text or external search.

## Completion Checklist

- [ ] Query length and result count are bounded.
- [ ] Search never bypasses publication visibility.
- [ ] Values are parameterized, including raw SQL paths.
- [ ] Result ordering is deterministic.
- [ ] Performance choices are based on query plans.

## Official References

- [PostgreSQL full-text search](https://www.postgresql.org/docs/current/textsearch.html)
- [Prisma indexes](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes)


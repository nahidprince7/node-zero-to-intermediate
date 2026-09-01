# Day 88 — Filtering and Sorting

> Core lesson: about 75–90 minutes. Turn query strings into allowlisted, typed database predicates.

## Learning Objectives

- validate optional filter parameters;
- allow only known sort fields and directions;
- compose visibility, ownership, taxonomy, and date predicates;
- preserve stable pagination while filtering.

## 0–20 Minutes — Public Query Contract

Support a small explicit contract:

```text
GET /posts?category=backend&tag=nestjs&authorId=7
           &publishedFrom=2026-01-01T00:00:00Z
           &sort=publishedAt&direction=desc
```

Create enums for accepted sort/direction values, coerce numeric IDs deliberately, validate offset-aware dates, and reject unknown/invalid values consistently. Never pass arbitrary query keys or field names to the ORM.

## 20–45 Minutes — Compose Predicates

Start with the non-negotiable public visibility predicate, then add optional filters. This ordering is conceptual: clients must never override `status = PUBLISHED`.

```ts
const filters = {
  status: "PUBLISHED",
  ...(authorId ? { authorId } : {}),
  ...(categoryId ? { categoryId } : {}),
};
```

Use relation-existence queries for tags through `PostTag`. Define whether multiple tags mean ANY or ALL; this course uses ALL only when explicitly requested because it is more expensive and semantically different.

## 45–65 Minutes — Sort Allowlist

Map API values to known expressions:

```ts
const sorters = {
  publishedAt: (p: PostOrder) => p.publishedAt,
  title: (p: PostOrder) => p.title,
} as const;
```

Always append `id` as a deterministic tiebreaker. Cursor pagination works only when cursor fields match the chosen order, so use a cursor schema per sort or restrict cursor feeds to one stable sort.

## Practice

1. Combine author, category, tag, and date-range filters.
2. Prove drafts never appear under any parameter combination.
3. Reject an attempted sort field such as `passwordHash`.
4. Test equal primary sort values.
5. Inspect SQL/query plans for the most common combinations.

## Completion Checklist

- [ ] Query parameters are transformed and validated.
- [ ] Visibility cannot be overridden by clients.
- [ ] Filter and sort fields are allowlisted.
- [ ] Every sort has a stable tiebreaker.
- [ ] Pagination contract remains valid under filters.


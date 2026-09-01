# Day 87 — Pagination

> Core lesson: about 90 minutes. Bound every collection and choose offset or cursor pagination intentionally.

## Learning Objectives

- implement validated page/limit pagination;
- explain the cost and consistency limits of offsets;
- build stable cursor pagination with a unique tiebreaker;
- return navigation metadata without expensive surprises.

## 0–25 Minutes — Offset Pagination

```ts
export class PageQueryDto {
  @Type(() => Number) @IsInt() @Min(1) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
```

Compute `skip = (page - 1) * limit`, use `.skip(skip).take(limit)`, and sort deterministically by `createdAt DESC, id DESC`. Return `items` plus `page`, `limit`, and optionally `total`. A total count is another query and may be expensive; do not promise it automatically.

Offset is simple and supports jumping to page N, but deep offsets make PostgreSQL walk discarded rows and concurrent inserts can shift boundaries.

## 25–55 Minutes — Cursor Pagination

For feeds, encode the last row's `(createdAt, id)` as an opaque cursor. Prisma 8 supports stable composite cursor continuation when the sort and cursor share both fields:

```ts
const items = await db.orm.public.Post
  .where({ status: "PUBLISHED" })
  .orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()])
  .cursor({ createdAt: cursor.createdAt, id: cursor.id })
  .take(limit + 1)
  .all();
```

Fetch `limit + 1` to determine `hasNextPage`, return only `limit`, and encode the last returned row as `nextCursor`. Validate and sign/version cursors if clients must not alter them. `createdAt` alone is not unique and can skip/repeat tied records.

## 55–75 Minutes — Compose Correctly

The cursor belongs to one filter/sort contract. Changing filters while reusing it is invalid; include query version/filter fingerprint in the cursor or reject misuse. Add indexes that match common visibility/filter/order patterns and confirm with query plans later.

## Practice

1. Test default, minimum, maximum, zero, negative, and nonnumeric limits.
2. Insert 25 rows sharing one timestamp and traverse them without duplicates.
3. Compare a deep offset query with a cursor query.
4. Test empty and final pages.
5. Ensure drafts never affect the public cursor feed.

## Completion Checklist

- [ ] Every list has a server-enforced maximum.
- [ ] Offset responses have deterministic sorting.
- [ ] Cursor sorting includes a unique tiebreaker.
- [ ] Boundary inserts do not cause duplicates in cursor traversal.
- [ ] Metadata cost and cursor validity are documented.

## Official Reference

- [Prisma 8 reading data and pagination](https://www.prisma.io/docs/orm/fundamentals/reading-data)


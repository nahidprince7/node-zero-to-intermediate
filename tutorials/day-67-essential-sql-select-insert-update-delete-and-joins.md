# Day 67 — Essential SQL: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and `JOIN`

> Core lesson: about 60–90 minutes. Write and predict SQL before an ORM generates it for you.

## Learning Objectives

You will learn to:

- create and query a small relational dataset;
- filter, sort, and limit results;
- insert, update, and delete rows safely;
- join related tables;
- handle null correctly;
- explain parameterized queries and SQL injection prevention.

## Setup

Create `practice/day-67/blog.sql`. You can write it today and execute it in PostgreSQL on Day 68.

Use this small schema:

```sql
CREATE TABLE app_user (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL
);

CREATE TABLE post (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id integer NOT NULL REFERENCES app_user(id),
  title text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz
);
```

End SQL statements with semicolons. SQL keywords are conventionally uppercase for readability but are not generally case-sensitive; quoted identifiers are a separate feature best avoided unless needed.

## 0–15 Minutes — Insert Rows

```sql
INSERT INTO app_user (email, display_name)
VALUES
  ('mina@example.test', 'Mina'),
  ('rahim@example.test', 'Rahim')
RETURNING id, email, display_name;
```

Insert related posts using known IDs only after checking returned values:

```sql
INSERT INTO post (author_id, title, published, published_at)
VALUES
  (1, 'Learning SQL', true, now()),
  (1, 'Draft Relations', false, NULL),
  (2, 'PostgreSQL Setup', true, now())
RETURNING *;
```

List columns explicitly. `RETURNING` retrieves inserted/changed/deleted rows without a separate lookup.

Production code must bind values as parameters rather than interpolate strings. Literal values here make the learning file readable; they are not a pattern for untrusted application input.

## 15–30 Minutes — Select, Filter, Sort

```sql
SELECT id, title, published
FROM post
WHERE published = true
ORDER BY published_at DESC, id DESC
LIMIT 20;
```

Important clauses:

- `SELECT` chooses expressions/columns;
- `FROM` chooses source relations;
- `WHERE` filters rows;
- `ORDER BY` makes order explicit;
- `LIMIT` bounds result count;
- `OFFSET` can skip rows, though large offsets later become inefficient.

Without `ORDER BY`, row order is not guaranteed. Do not assume insertion or primary-key order.

Combine conditions explicitly:

```sql
SELECT id, title
FROM post
WHERE author_id = 1
  AND published = false;
```

Use parentheses when mixing `AND` and `OR` so precedence is obvious.

## 30–40 Minutes — Null Semantics

This is wrong:

```sql
WHERE published_at = NULL
```

Use:

```sql
SELECT id, title
FROM post
WHERE published_at IS NULL;
```

Null means unknown/missing/not applicable and participates in three-valued SQL logic. Use `IS NULL` and `IS NOT NULL`. Consider whether a column should permit null before writing queries around it.

## 40–52 Minutes — Update and Delete Safely

```sql
UPDATE post
SET
  published = true,
  published_at = now()
WHERE id = 2
RETURNING id, title, published, published_at;
```

```sql
DELETE FROM post
WHERE id = 2
RETURNING id, title;
```

Before executing a destructive statement manually, write a `SELECT` with the same `WHERE` and verify the target. Omitting `WHERE` changes or deletes every row.

Application code should also check affected-row count to distinguish success from a missing target.

## 52–67 Minutes — Join Related Data

An inner join returns posts with matching authors:

```sql
SELECT
  p.id,
  p.title,
  u.id AS author_id,
  u.display_name AS author_name
FROM post AS p
INNER JOIN app_user AS u ON u.id = p.author_id
WHERE p.published = true
ORDER BY p.id;
```

A left join retains every row from the left side even when no right-side match exists. This is useful for optional relations:

```sql
SELECT p.title, c.name AS category_name
FROM post AS p
LEFT JOIN category AS c ON c.id = p.category_id;
```

Use aliases to disambiguate repeated column names. A join condition defines how rows relate; forgetting or writing the wrong condition can multiply rows unexpectedly.

Many-to-many traversal joins through the relationship table:

```sql
SELECT p.title, t.name AS tag_name
FROM post AS p
JOIN post_tag AS pt ON pt.post_id = p.id
JOIN tag AS t ON t.id = pt.tag_id
ORDER BY p.id, t.name;
```

One post appears once per matching tag. The application must understand that row shape when building nested representations.

## 67–78 Minutes — Parameterized Queries

Unsafe construction:

```ts
const sql = `SELECT * FROM post WHERE title = '${userInput}'`;
```

Conceptual PostgreSQL parameter binding:

```ts
const text = "SELECT id, title FROM post WHERE title = $1";
const values = [userInput];
```

The driver sends SQL structure separately from values, preventing input from becoming executable SQL syntax. Prisma will generate parameterized queries for normal ORM operations.

Parameters represent values, not arbitrary column names or sort directions. For dynamic sorting, map an allowed API value to a known SQL fragment rather than interpolating raw input.

## Guided Practice — Blog Query File

Write and later execute queries that:

1. insert two users and four posts;
2. list published posts newest first;
3. list one author's drafts;
4. find posts with no publication timestamp;
5. publish one draft and return it;
6. join posts with author names;
7. join posts through tags;
8. delete exactly one known draft and return it.

Predict each result before running it.

## Independent Exercises

1. Select only needed columns instead of `*`.
2. Combine `AND`, `OR`, and parentheses.
3. Test `IS NULL` versus `= NULL`.
4. Add deterministic secondary ordering.
5. Preview an update target with SELECT.
6. Compare inner and left joins with an optional category.
7. Explain duplicate-looking many-to-many rows.
8. Convert an unsafe interpolated query to parameters.

## Common Mistakes and Debugging Advice

- Never assume row order without `ORDER BY`.
- Use `IS NULL`, not equality with null.
- Preview destructive targets and include `WHERE`.
- Check affected-row counts.
- Qualify ambiguous joined columns.
- Verify every join condition.
- Bind untrusted values as parameters.
- Allowlist dynamic identifiers and directions.

## Review Questions

1. What does `RETURNING` avoid?
2. Why list insert/select columns explicitly?
3. Why is row order otherwise unspecified?
4. How does SQL null differ from false?
5. How do inner and left joins differ?
6. Why can a many-to-many join repeat post columns?
7. What does parameter binding separate?
8. Why cannot a value parameter safely choose a column name?

## Completion Checklist

- [ ] CRUD statements are written and predicted.
- [ ] Filtering and deterministic ordering work.
- [ ] Null is handled correctly.
- [ ] Updates/deletes have verified targets.
- [ ] One-to-many and many-to-many joins are understood.
- [ ] Parameterization is explained accurately.
- [ ] All exercises and review questions are complete.

## Official References

- PostgreSQL queries: https://www.postgresql.org/docs/current/queries.html
- PostgreSQL data manipulation: https://www.postgresql.org/docs/current/dml.html
- PostgreSQL table expressions and joins: https://www.postgresql.org/docs/current/queries-table-expressions.html

## What to Send for Review

Send `blog.sql`, predicted and actual results after Day 68, safe-write workflow, join explanations, parameterization example, exercises, and review answers. Next: **Day 68 — PostgreSQL in Docker and `psql`**.

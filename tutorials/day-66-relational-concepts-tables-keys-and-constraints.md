# Day 66 — Relational Concepts: Tables, Keys, and Constraints

> Core lesson: about 60–90 minutes. Model blog data so the database can protect relationships and invariants—not merely store JSON-shaped objects.

## Learning Objectives

You will learn to:

- distinguish tables, rows, columns, and schemas;
- use primary, foreign, and unique keys;
- model one-to-one, one-to-many, and many-to-many relationships;
- apply nullability, checks, defaults, and referential actions;
- explain normalization at a practical level;
- sketch the blog's relational model.

## 0–15 Minutes — Tables and Rows

A relational database organizes data into relations commonly represented as tables:

```text
post
┌────┬──────────────┬──────────┬───────────┐
│ id │ title        │ author_id│ published │
├────┼──────────────┼──────────┼───────────┤
│  1 │ Node Streams │        7 │ true      │
└────┴──────────────┴──────────┴───────────┘
```

- a table represents a kind of fact/entity;
- a row represents one record;
- a column has a name and database type;
- a database schema is a namespace/structure, not the same thing as a JSON Schema or Prisma schema file.

Choose types that express the data: integer identifiers, text, Boolean, timestamps, and so on. A database type and constraint make invalid states harder to store.

## 15–30 Minutes — Keys and Constraints

```sql
CREATE TABLE app_user (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- primary key uniquely identifies each row and is not null;
- unique constraint prevents duplicate candidate values;
- `NOT NULL` requires a value;
- default supplies a value when omitted;
- `CHECK` can enforce a row-local condition;
- foreign key requires a referenced row.

Application validation gives friendly feedback, but constraints protect data across every writer and concurrent request.

## 30–45 Minutes — Foreign Keys and Cardinality

One user can author many posts; each post has one author:

```sql
CREATE TABLE post (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id integer NOT NULL REFERENCES app_user(id),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

The foreign key lives on the many side (`post.author_id`). It prevents a post from referencing a nonexistent user.

One-to-one uses a foreign key plus uniqueness. For example, a user profile table can make `user_id` both foreign and unique.

## 45–58 Minutes — Many-to-Many

Posts and tags need a join table:

```sql
CREATE TABLE tag (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE
);

CREATE TABLE post_tag (
  post_id integer NOT NULL REFERENCES post(id) ON DELETE CASCADE,
  tag_id integer NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

The composite primary key prevents the same tag assignment twice. The join row can later gain metadata such as `assigned_at` or `assigned_by`.

`ON DELETE CASCADE` is a consequential policy: deleting a post removes its tag links, not the tag records. Choose referential actions deliberately; cascading user deletion through every post may be unacceptable.

## 58–70 Minutes — Practical Normalization

Avoid storing repeated tag names in a comma-separated post column. Separate tables reduce duplication and let constraints govern identity.

Practical normalization asks:

- does each column hold one value for this model?
- is the fact stored in one authoritative place?
- can updating one fact require inconsistent changes in several rows?
- does a relationship deserve its own table?

Do not normalize mechanically into dozens of tables without considering access patterns and ownership. Start with clear facts and integrity; optimize later from measured needs.

## 70–80 Minutes — Null and Time

Null represents missing/unknown/not-applicable—not an empty string or zero. Define nullability intentionally:

```text
post.published_at nullable while draft
post.category_id nullable if uncategorized is allowed
comment.deleted_at nullable until soft deletion
```

Use timestamp-with-time-zone semantics for stored instants in PostgreSQL (`timestamptz`) and exchange ISO 8601 UTC strings through the API. Day 86 covers date/time behavior deeply.

## Guided Practice — Blog ER Sketch

Draw users, posts, comments, categories, tags, and post-tag links. For each table specify:

1. primary key;
2. required and nullable columns;
3. unique constraints;
4. foreign keys;
5. relationship cardinality;
6. delete/update policy;
7. at least one invariant the database enforces;
8. one rule that still belongs in application authorization.

## Independent Exercises

1. Model a one-to-one user profile.
2. Explain why foreign keys live on the many side.
3. Prevent duplicate tag assignment.
4. Choose a category deletion policy.
5. Compare null, empty text, and a missing row.
6. Normalize a post column containing comma-separated tags.
7. Identify a useful CHECK constraint.
8. Separate database integrity from ownership authorization.

## Common Mistakes and Debugging Advice

- A primary key identifies rows; a foreign key preserves references.
- Uniqueness belongs in the database as well as validation.
- Many-to-many relationships require relationship storage.
- Nullability is a domain decision.
- Cascades can delete far more than expected.
- Do not encode lists as comma-separated text.
- Schema has different meanings in different tools.
- Constraints complement—not replace—application rules.

## Review Questions

1. What do tables, rows, and columns represent?
2. How do primary and foreign keys differ?
3. How is one-to-one enforced?
4. Where does a one-to-many foreign key live?
5. Why use a composite key on `post_tag`?
6. What does referential action control?
7. What problem does normalization reduce?
8. Which rules cannot a basic database constraint decide?

## Completion Checklist

- [ ] Relational vocabulary is understood.
- [ ] Key and constraint purposes are clear.
- [ ] Three cardinality types are modeled.
- [ ] Blog join tables and uniqueness are designed.
- [ ] Nullability and delete policies are explicit.
- [ ] Complete blog ER sketch is produced.
- [ ] All exercises and review questions are complete.

## Official References

- PostgreSQL data definition: https://www.postgresql.org/docs/current/ddl.html
- PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL identity columns: https://www.postgresql.org/docs/current/ddl-identity-columns.html

## What to Send for Review

Send the ER sketch, table/constraint notes, referential-action decisions, normalization exercise, application-rule distinction, and review answers. Next: **Day 67 — Essential SQL**.

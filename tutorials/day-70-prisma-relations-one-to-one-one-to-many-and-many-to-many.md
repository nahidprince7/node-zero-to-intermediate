# Day 70 — Prisma Relations: One-to-One, One-to-Many, and Many-to-Many

> Core lesson: about 90 minutes. Express relational ownership in the Prisma 8 contract, migrate it, and traverse relations without N+1 loops.

## Learning Objectives

You will learn to:

- distinguish relation fields from stored foreign-key fields;
- model one-to-one and one-to-many ownership;
- model Prisma 8 many-to-many relations with an explicit junction model;
- migrate and inspect foreign keys and uniqueness;
- create and query related records;
- avoid unbounded includes and N+1 query patterns.

## 0–15 Minutes — Relation and Scalar Fields

In Prisma PSL:

```prisma
model Post {
  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}
```

`authorId` is a scalar field stored as a PostgreSQL foreign-key column. `author` is a relation field used by the ORM to navigate; it is not another database column.

The side declaring `fields: [...]` owns the foreign key. Required versus optional scalar/relation fields determine whether the relation can be missing.

## 15–35 Minutes — Blog Relations Contract

Expand `prisma/contract.prisma`:

```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  displayName String    @map("display_name")
  createdAt   DateTime  @default(now()) @map("created_at")
  posts       Post[]
  comments    Comment[]

  @@map("app_user")
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String
  userId Int    @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id])

  @@map("profile")
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  published Boolean   @default(false)
  createdAt DateTime  @default(now()) @map("created_at")
  authorId  Int       @map("author_id")
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  tags      PostTag[]

  @@map("post")
}

model Comment {
  id        Int      @id @default(autoincrement())
  body      String
  postId    Int      @map("post_id")
  authorId  Int      @map("author_id")
  post      Post     @relation(fields: [postId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  @@map("comment")
}

model Tag {
  id    Int       @id @default(autoincrement())
  name  String    @unique
  posts PostTag[]

  @@map("tag")
}

model PostTag {
  postId  Int      @map("post_id")
  tagId   Int      @map("tag_id")
  addedAt DateTime @default(now()) @map("added_at")
  post    Post     @relation(fields: [postId], references: [id])
  tag     Tag      @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
  @@map("post_tag")
}
```

Current Prisma 8 requires an explicit junction model for this many-to-many workflow. The join model also gives `addedAt` a natural home.

The one-to-one relation is enforced by `Profile.userId @unique`. Current Prisma 8 queries that relation from the foreign-key-owning `Profile` side; do not copy an older mirror-field example without checking versioned support.

## 35–50 Minutes — Emit and Migrate

```bash
npx prisma@latest contract emit
npx prisma@latest migration plan --name add_blog_relations
npx prisma@latest db migrate --advance-ref db
```

Review before applying. Confirm the DDL contains:

- foreign keys on post, comment, profile, and post-tag;
- unique constraint on `profile.user_id`;
- composite primary key on `(post_id, tag_id)`;
- expected required/null columns;
- acceptable referential actions.

Prisma defaults are not a substitute for deciding deletion behavior. Later migrations can add explicit referential actions after the blog's deletion policy is finalized.

## 50–65 Minutes — Create Related Rows

```ts
const user = await db.orm.public.User.create({
  email: "author@example.test",
  displayName: "Author",
});

const post = await db.orm.public.Post.create({
  title: "Prisma Relations",
  published: true,
  authorId: user.id,
});

const tag = await db.orm.public.Tag.create({ name: "prisma" });

await db.orm.public.PostTag.create({
  postId: post.id,
  tagId: tag.id,
});
```

The foreign key connects records. Attempting to create a post with a nonexistent author must fail. Attempting the same post-tag pair twice must fail because of the composite primary key.

These sequential writes are suitable for observing relations. When several writes form one atomic use case, Day 75's transaction lesson will ensure all commit or all roll back.

## 65–78 Minutes — Include Relations

One-to-many in either direction:

```ts
const usersWithPosts = await db.orm.public.User
  .include("posts")
  .all();

const postsWithAuthors = await db.orm.public.Post
  .include("author")
  .all();
```

One-to-one from the owning side:

```ts
const profile = await db.orm.public.Profile
  .where({ userId: user.id })
  .include("user")
  .first();
```

Many-to-many through link rows:

```ts
const postsWithTags = await db.orm.public.Post
  .include("tags", (postTags) => postTags.include("tag"))
  .all();

const tagNames = postsWithTags[0]?.tags.map((link) => link.tag.name) ?? [];
```

Shape nested results with select/filter/order/take callbacks. Do not include every relation automatically; responses become large and can reveal fields clients should not see.

## 78–88 Minutes — N+1 and Ownership

Avoid:

```ts
const users = await db.orm.public.User.all();
for (const user of users) {
  await db.orm.public.Post.where({ authorId: user.id }).all();
}
```

That performs one initial query plus one per user. Use a relation include when the response needs users with posts:

```ts
const users = await db.orm.public.User
  .include("posts", (posts) => posts.take(5))
  .all();
```

Relation existence does not authorize access. A foreign key proves a post has an author; a guard/service must decide whether the current caller may edit it.

## Guided Practice — Complete Relation Proof

1. Model all three cardinalities.
2. emit and review the relation migration;
3. inspect PostgreSQL constraints;
4. create a user, profile, post, comment, tag, and link;
5. trigger foreign-key, unique, and composite-key failures;
6. query each relation direction currently supported;
7. shape a post-with-author-and-tags response;
8. replace one N+1 loop with an include.

## Independent Exercises

1. Make post category optional and model category-to-post one-to-many.
2. Query one author with only their newest five posts.
3. Query published posts with authors.
4. Add two tags and prevent duplicate assignment.
5. Remove a link row without deleting either resource.
6. Decide referential actions for post/comment deletion.
7. Compare relation fields with scalar foreign-key fields.
8. Explain the current Prisma 8 one-to-one and many-to-many limitations.

## Common Mistakes and Debugging Advice

- The relation field is not a duplicate database column.
- Foreign keys belong on the dependent/many side.
- One-to-one requires uniqueness on the foreign key.
- Prisma 8 many-to-many uses an explicit junction model here.
- Re-emit before planning a migration.
- Review foreign keys, uniqueness, and delete behavior.
- Avoid unbounded includes and N+1 loops.
- Database relationships do not enforce authorization.

## Review Questions

1. How do relation and scalar fields differ?
2. Which side owns a one-to-many foreign key?
3. What turns a relation into one-to-one?
4. Why use a junction model?
5. What does the composite key prevent?
6. How does `include` affect result shape?
7. What is the N+1 query pattern?
8. Why is relationship integrity not ownership authorization?

## Completion Checklist

- [ ] One-to-one, one-to-many, and many-to-many are modeled.
- [ ] Migration constraints are reviewed and applied.
- [ ] Related records are created successfully.
- [ ] Integrity violations are demonstrated.
- [ ] Includes return controlled nested shapes.
- [ ] One N+1 pattern is removed.
- [ ] All exercises and review questions are complete.

## Official References

- Prisma 8 relational modeling: https://www.prisma.io/docs/orm/v8/data-modeling/relational-databases
- Prisma 8 relations and joins: https://www.prisma.io/docs/orm/v8/fundamentals/relations-and-joins
- Prisma 8 writing data: https://www.prisma.io/docs/orm/v8/fundamentals/writing-data
- PostgreSQL foreign keys: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK

## What to Send for Review

Send contract, reviewed migration, database constraint output, related write/query output, deliberate integrity failures, N+1 replacement, exercises, and review answers. Next: **Day 71 — Full Blog Schema, Migration, and Seed**.

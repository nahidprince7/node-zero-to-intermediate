# Day 71 — Blog Milestone: Full Schema, Migration, and Seed Data

> Core lesson: about 90–120 minutes. Turn the relation experiments into the database contract for the complete blog.

## Learning Objectives

- model users, posts, categories, tags, comments, and explicit post-tag links;
- encode uniqueness, nullability, defaults, timestamps, and referential actions deliberately;
- plan and review a migration before applying it;
- write a repeatable seed instead of a one-off data dump.

## 0–20 Minutes — Finalize the Contract

Keep Day 70's relations and add the fields the API will need:

```prisma
enum Role {
  READER
  AUTHOR
  ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
}

model User {
  id Int @id @default(autoincrement())
  email String @unique
  passwordHash String @map("password_hash")
  displayName String @map("display_name")
  role Role @default(READER)
  posts Post[]
  comments Comment[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("app_user")
}

model Post {
  id Int @id @default(autoincrement())
  title String
  slug String @unique
  excerpt String?
  body String
  status PostStatus @default(DRAFT)
  authorId Int @map("author_id")
  categoryId Int? @map("category_id")
  author User @relation(fields: [authorId], references: [id], onDelete: Restrict)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  comments Comment[]
  tags PostTag[]
  publishedAt DateTime? @map("published_at")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@index([authorId, status])
  @@map("post")
}

model Category {
  id Int @id @default(autoincrement())
  name String
  slug String @unique
  posts Post[]
  @@map("category")
}

model Tag {
  id Int @id @default(autoincrement())
  name String @unique
  posts PostTag[]
  @@map("tag")
}

model PostTag {
  postId Int @map("post_id")
  tagId Int @map("tag_id")
  addedAt DateTime @default(now()) @map("added_at")
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([postId, tagId])
  @@map("post_tag")
}

model Comment {
  id Int @id @default(autoincrement())
  body String
  postId Int @map("post_id")
  authorId Int @map("author_id")
  post Post @relation(fields: [postId], references: [id], onDelete: Restrict)
  author User @relation(fields: [authorId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@index([postId, createdAt])
  @@map("comment")
}
```

This is the Day 71 baseline. Day 86 adds scheduling fields and Day 90 adds moderation state through new migrations; do not edit this already-applied migration later.

## 20–40 Minutes — Decide Integrity Rules

Write the decisions before migrating:

- deleting an author with posts is restricted;
- deleting a post cascades its post-tag links;
- categories are optional, so deleting one may set `categoryId` to null;
- comments will be soft-deleted on Day 90, not cascaded casually;
- emails and slugs are globally unique;
- `publishedAt` is nullable because drafts are not published.

Database constraints protect all writers, not only this Nest app. DTO validation improves messages but cannot replace them.

## 40–60 Minutes — Plan and Inspect

```bash
npx prisma@latest contract emit
npx prisma@latest migration plan --name full_blog_schema
```

Inspect the migration for table names, enums, foreign keys, unique indexes, ordinary indexes, nullability, and delete actions. Applying a migration without reading it is not a review process.

```bash
npx prisma@latest db migrate --advance-ref db
npx prisma@latest migration status
```

## 60–85 Minutes — A Repeatable Seed

Create `prisma/seed.ts`. Use stable unique identifiers and create-or-update behavior where the generated Prisma 8 API supports it:

```ts
const adminEmail = "admin@example.test";
const existing = await db.orm.public.User.where({ email: adminEmail }).first();

if (!existing) {
  await db.orm.public.User.create({
    email: adminEmail,
    passwordHash: "development-placeholder-not-a-real-password",
    displayName: "Admin",
    role: "ADMIN",
  });
}
```

Seed two authors, three categories, several tags, draft/published posts, and comments. Never put production credentials or real personal data in a seed. Day 79 will replace placeholder hashes with a real hashing flow.

## Practice and Proof

1. Run the seed twice; the second run must not duplicate records.
2. Count every table and inspect representative joins.
3. Trigger duplicate slug and invalid foreign-key failures.
4. Delete a disposable post and verify its link-row behavior.
5. Draw the schema and label every foreign-key owner.

## Review Questions

1. Why can validation not replace database constraints?
2. Which fields distinguish a draft from a published post?
3. Why is seed idempotency useful?
4. Which deletion rules would cause data loss?
5. Why index common filter combinations?

## Completion Checklist

- [ ] The complete contract emits successfully.
- [ ] The reviewed migration applies cleanly.
- [ ] Seed data covers the main relationships and states.
- [ ] Running the seed twice is safe.
- [ ] Constraints and referential actions are verified in PostgreSQL.

## Official References

- [Prisma schema reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [Prisma seeding](https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding)

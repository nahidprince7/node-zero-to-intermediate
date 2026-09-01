# Day 74 — Posts: Update, Delete, and Unique Slugs

> Core lesson: about 75–90 minutes. Complete post CRUD while treating slugs as durable identifiers.

## Learning Objectives

- apply partial updates without accepting protected fields;
- generate deterministic, URL-safe slugs;
- resolve collisions safely under concurrency;
- distinguish not found, conflict, and successful deletion.

## 0–20 Minutes — Update DTOs

Use `PartialType(CreatePostDto)` only if every inherited field is truly updateable. Never accept `authorId`, timestamps, or role/state transitions through a generic DTO.

```ts
export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

Load the record, fail with 404 if absent, then update only defined properties. An empty object should either be rejected explicitly or documented as a no-op.

## 20–40 Minutes — Slug Policy

Normalize lowercase text, replace runs of non-alphanumeric characters with `-`, trim separators, and reject an empty result. Decide whether a title edit changes the slug. This course changes it only when `title` changes; a production site may preserve old slugs in a redirect table.

```ts
export function slugify(title: string): string {
  return title.normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

Try `base`, then `base-2`, `base-3`, with a small maximum. The database unique constraint is the final concurrency-safe judge. Catch its typed constraint error and retry or return 409; a prior `find` alone has a race.

## 40–60 Minutes — Delete Semantics

```ts
@Delete(":id")
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param("id", ParseIntPipe) id: number) {
  await this.postsService.remove(id);
}
```

A 204 response has no body. Verify link rows follow the Day 71 referential policy. Do not accidentally delete the author, category, or tags.

## 60–75 Minutes — Verification Matrix

Test: partial edit, title edit and new slug, collision, unknown ID, delete, repeated delete, invalid ID, and cascade behavior. Send two simultaneous creations with the same title to prove the constraint still holds.

## Exercises

1. Make `slugify` pass punctuation, whitespace, and Unicode cases.
2. Return 409 after exhausting slug suffix attempts.
3. Decide whether clients update by ID or slug and explain why.
4. Reject empty updates.
5. Add a future `PostSlugHistory` design without implementing it.

## Completion Checklist

- [ ] Only allowed fields can change.
- [ ] Slug generation is pure and tested.
- [ ] Database uniqueness handles concurrent collisions.
- [ ] Delete returns 204 with no body.
- [ ] Related-resource deletion behavior is verified.


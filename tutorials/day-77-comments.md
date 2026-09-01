# Day 77 — Comments

> Core lesson: about 75–90 minutes. Implement comments as a child resource with author identity and post-state rules.

## Learning Objectives

- model nested comment routes;
- validate comment content and parent visibility;
- avoid trusting client-supplied author/post IDs;
- choose stable ordering and bounded list responses.

## 0–20 Minutes — Nested Contract

```text
POST   /posts/:postId/comments
GET    /posts/:postId/comments
PATCH  /comments/:commentId
DELETE /comments/:commentId
```

`postId` comes from the URL and `authorId` comes from authenticated identity (use a seeded stand-in until Day 82). The body contains only comment content.

```ts
export class CreateCommentDto {
  @IsString() @Length(1, 2000)
  body!: string;
}
```

Trim content and reject whitespace-only input. Decide whether comments are allowed only on published posts; this course says yes.

## 20–45 Minutes — Create and List

The service loads the published post, then creates the comment using server-owned IDs. A missing or draft post returns 404 to a public caller so private state is not disclosed.

List oldest-first for conversational reading, with ID as a deterministic tiebreaker. Select comment ID, body, timestamps, and safe author fields. Add a hard temporary limit of 50; Day 87 will introduce pagination.

## 45–65 Minutes — Edit and Delete Policy

Today implement record mechanics and leave a clear `TODO(day-84)` for ownership. Do not pretend that knowing an author ID is authorization. Return 404 for an absent comment and 204 for successful hard deletion; Day 90 replaces this with moderation-aware soft deletion.

## Practice

1. Create comments for a published and a draft post.
2. Prove body `"   "` is rejected.
3. Return controlled author information without email or password hash.
4. Verify deterministic order for equal timestamps.
5. Delete a disposable post and observe the chosen comment referential rule.

## Review Questions

1. Why should author ID not come from the body?
2. Why can a draft post return 404 rather than 403?
3. Which layer decides whether comments are allowed?
4. Why is an unbounded comment list dangerous?

## Completion Checklist

- [ ] Nested routes use the URL parent ID.
- [ ] Server identity supplies the author ID.
- [ ] Only published posts accept public comments.
- [ ] Lists are safe, stable, and bounded.
- [ ] Ownership work is explicitly deferred to Day 84.


# Day 75 — Database Errors and Transactions

> Core lesson: about 90 minutes. Translate expected storage failures and make multi-write use cases atomic.

## Learning Objectives

- classify unique, foreign-key, not-found, and unexpected failures;
- map storage errors at a stable application boundary;
- use a transaction when several writes form one use case;
- preserve useful logs without leaking internals.

## 0–20 Minutes — Errors Have Different Audiences

The client needs a stable status, message, and optional field details. Logs need the original error, constraint/code, request context, and stack. Do not send raw driver messages or SQL to clients.

Suggested mapping:

| Condition | HTTP | Meaning |
|---|---:|---|
| unique slug/email | 409 | resource conflicts with existing state |
| missing referenced row | 400 or 404 | invalid relation, chosen by endpoint contract |
| target absent | 404 | requested resource does not exist |
| unknown database failure | 500 | log details, return generic message |

Prisma 8 has a revised error taxonomy. Narrow against the error types/codes exported by the generated version; do not blindly copy Prisma 7 `P2002` examples into a Prisma 8 project.

## 20–40 Minutes — Translate Once

Create domain errors such as `DuplicateSlugError` and `ReferencedCategoryNotFoundError` in the repository adapter. Map those to Nest exceptions in the service or a dedicated filter. Avoid string-matching human-readable driver messages.

```ts
try {
  return await this.repo.create(input);
} catch (error: unknown) {
  if (isUniqueConstraint(error, "post_slug_key")) {
    throw new ConflictException("Slug already exists");
  }
  throw error;
}
```

Keep the type guard next to the installed Prisma adapter because its exact shape is version-specific.

## 40–65 Minutes — Transaction Boundary

Publishing a post and writing an audit event must either both happen or neither happen:

```ts
return db.transaction(async (tx) => {
  const post = await tx.orm.public.Post
    .where({ id: postId })
    .update({ status: "PUBLISHED", publishedAt: new Date() });

  await tx.orm.public.AuditEvent.create({
    actorId, action: "POST_PUBLISHED", entityId: post.id,
  });

  return post;
});
```

Use the transaction API emitted by your Prisma 8 scaffold. Keep callbacks short: no email, HTTP call, user input wait, or heavy computation while holding database resources.

## 65–80 Minutes — Rollback Proof

Temporarily make the second write fail. Verify the first write is absent after rollback. Then verify success commits both. Consider retry only for documented transient conflicts, with a strict attempt limit; never retry validation failures.

## Exercises

1. Map duplicate email and slug separately.
2. Trigger a foreign-key failure and inspect server logs versus response.
3. Prove rollback with a failing second write.
4. Explain why two sequential awaited writes are not atomic.
5. Identify one operation that does not need a transaction.

## Completion Checklist

- [ ] Expected constraint failures return stable HTTP responses.
- [ ] Unexpected errors retain their stack in logs.
- [ ] Client responses expose no SQL or connection details.
- [ ] A two-write transaction commits and rolls back correctly.
- [ ] External network work stays outside the transaction.

## Official References

- [Prisma 8 transactions](https://www.prisma.io/docs/orm/fundamentals/transactions)
- [Prisma 8 error reference](https://www.prisma.io/docs/orm/reference/error-reference)

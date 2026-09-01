# Day 85 — Drafts and Publishing

> Core lesson: about 75–90 minutes. Model publishing as an explicit state transition, not a freely editable boolean.

## Learning Objectives

- separate content edits from publication commands;
- validate allowed state transitions;
- enforce draft visibility by identity and role;
- set publication timestamps consistently.

## 0–20 Minutes — State, Not Checkbox

Use `DRAFT` and `PUBLISHED` states. Create posts as drafts. Expose commands such as:

```text
POST /posts/:id/publish
POST /posts/:id/unpublish
```

Do not allow `status` or `publishedAt` in `UpdatePostDto`. Command endpoints make authorization, validation, audit, and side effects explicit.

## 20–45 Minutes — Transition Rules

```text
DRAFT -> PUBLISHED: owner author or admin; require valid title/body/slug
PUBLISHED -> DRAFT: owner author or admin; clear or preserve publishedAt by policy
PUBLISHED -> PUBLISHED: idempotent success or 409, choose and document
```

This course preserves the first `publishedAt` when republishing only if product semantics mean “original publication”; otherwise set a new value. Write the choice in tests. Perform status and timestamp update atomically.

## 45–65 Minutes — Visibility Queries

Anonymous/readers see published posts only. Authors see published posts plus their own drafts. Admins may see all. Put these predicates in named repository methods or policy-aware query builders so one forgotten controller does not leak drafts.

Publishing scheduled for the future belongs to Day 86. A future `publishedAt` must not become publicly visible just because status says published.

## Practice

1. Publish an owned complete draft.
2. reject publishing another author's draft;
3. reject an incomplete draft;
4. test public, owner, other author, and admin list visibility;
5. test repeated publish/unpublish according to your contract.

## Completion Checklist

- [ ] Generic updates cannot change publication state.
- [ ] Allowed transitions and idempotency are documented.
- [ ] Publishing writes status and timestamp atomically.
- [ ] Draft visibility follows identity and role.
- [ ] State transition tests cover forbidden users and invalid content.

# Day 84 — Ownership Rules: Secure the Blog

> Blog milestone: about 90 minutes. Enforce resource-level authorization for post and comment mutations.

## Learning Objectives

- evaluate ownership using trusted identity and stored records;
- prevent IDOR/BOLA vulnerabilities;
- centralize policy decisions;
- prove the blog's full authorization matrix.

## 0–20 Minutes — Load Before Decide

Never accept `authorId` as proof. Load the target by ID, then compare its stored owner with `principal.id`.

```ts
function canEditPost(user: AuthPrincipal, post: { authorId: number }) {
  return user.role === "ADMIN" ||
    (user.role === "AUTHOR" && user.id === post.authorId);
}
```

Keep pure policy functions easy to unit-test. The service orchestrates load → policy → mutation. The repository merely reads/writes.

## 20–45 Minutes — Information Disclosure

Choose absent-versus-forbidden behavior deliberately. For a private resource, returning 404 for both may avoid confirming its existence. For a visible published post that a reader cannot edit, 403 is understandable. Stay consistent and document the contract.

Race-safe mutation may include owner criteria in the update/delete query, not only in a prior read. Otherwise ownership/state could change between check and write. A transaction or conditional mutation closes that gap.

## 45–70 Minutes — Apply the Policies

- authors create posts only for themselves;
- authors update/delete only their own posts;
- admins can update/delete any post;
- comment authors edit/delete their own comments;
- admins can moderate any comment;
- roles and ownership come from trusted server state;
- public/draft visibility is enforced on reads too.

Search every write endpoint for client-controlled owner IDs and every read endpoint for unintended private fields.

## 70–85 Minutes — Security Matrix Tests

Create two authors, one reader, one admin, and posts/comments owned by each author. For every endpoint test owner, different same-role user, reader, admin, anonymous, missing resource, and changed owner ID in the body. These are security tests, not optional polish.

## Completion Checklist

- [ ] Every mutation has an explicit role/ownership rule.
- [ ] Owner identity comes from JWT plus stored data.
- [ ] Cross-author edits and deletes fail.
- [ ] Admin override behaves exactly as documented.
- [ ] Read visibility and response fields are audited.
- [ ] The full matrix is covered by automated tests.

## Official Reference

- [OWASP API1: Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)


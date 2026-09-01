# Day 49 — Blog Milestone: Design Resources and Endpoints

> Design lesson: about 60–90 minutes. Produce the contract that later NestJS, Prisma, authentication, and tests will implement.

## Learning Objectives

You will learn to:

- define the blog's resource boundaries;
- map relationships among users, posts, comments, categories, and tags;
- write a coherent endpoint catalog;
- state ownership and authorization rules before implementing auth;
- define draft and publication visibility;
- record open decisions instead of burying assumptions in code.

## 0–15 Minutes — Resource Map

Start with these resources:

```text
User 1 ─── * Post
User 1 ─── * Comment
Post 1 ─── * Comment
Category 1 ─── * Post
Post * ─── * Tag
```

Course decisions:

- a post has exactly one author;
- a post may have one category initially;
- a post may have many tags;
- a comment belongs to one post and one user;
- categories and tags are addressable resources;
- posts have numeric internal IDs and unique public slugs;
- deletion and moderation details are refined on Day 90.

Do not design database join tables into public URLs. The API represents domain relationships; Prisma models storage later.

## 15–30 Minutes — Core Representations

Draft public shapes, not database rows:

```ts
interface UserSummary {
  id: number;
  displayName: string;
}

interface PostRepresentation {
  id: number;
  slug: string;
  title: string;
  body: string;
  status: "draft" | "published";
  author: UserSummary;
  category: { id: number; name: string; slug: string } | null;
  tags: Array<{ id: number; name: string; slug: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
```

Never expose password hashes, refresh tokens, internal moderation notes, or unrelated user fields. Summary representations can avoid embedding full resources recursively.

Use UTC ISO 8601 timestamps in the HTTP contract. Database and timezone details come later.

## 30–48 Minutes — Endpoint Catalog

### Users and authentication

Authentication implementation arrives on Days 79–84, but reserve a coherent contract:

| Method | Path | Purpose | Success |
|---|---|---|---:|
| `POST` | `/auth/register` | Create an account | 201 |
| `POST` | `/auth/login` | Exchange credentials for tokens/session | 200 |
| `GET` | `/users/me` | Read current user's profile | 200 |
| `GET` | `/users/:userId` | Read a public user summary | 200 |

### Posts

| Method | Path | Purpose | Success |
|---|---|---|---:|
| `GET` | `/posts` | List visible posts | 200 |
| `POST` | `/posts` | Create a draft or post | 201 |
| `GET` | `/posts/:slug` | Read one visible post | 200 |
| `PATCH` | `/posts/:slug` | Partially update owned post | 200 |
| `DELETE` | `/posts/:slug` | Delete owned post | 204 |

Planned collection queries:

```text
/posts?page=1&limit=20
/posts?authorId=7
/posts?category=nodejs
/posts?tag=typescript
/posts?status=published
/posts?sort=-publishedAt
/posts?q=streams
```

Public anonymous callers see published posts only. Authors can request their own drafts after authentication. The exact authorization behavior must not rely on hiding a UI control.

### Comments

| Method | Path | Purpose | Success |
|---|---|---|---:|
| `GET` | `/posts/:slug/comments` | List visible comments on a post | 200 |
| `POST` | `/posts/:slug/comments` | Create a comment | 201 |
| `GET` | `/comments/:commentId` | Read one visible comment | 200 |
| `PATCH` | `/comments/:commentId` | Edit owned comment | 200 |
| `DELETE` | `/comments/:commentId` | Delete/moderate comment | 204 |

### Categories and tags

| Method | Path | Purpose | Success |
|---|---|---|---:|
| `GET` | `/categories` | List categories | 200 |
| `POST` | `/categories` | Create category; admin later | 201 |
| `GET` | `/categories/:slug` | Read category | 200 |
| `PATCH` | `/categories/:slug` | Update category; admin later | 200 |
| `DELETE` | `/categories/:slug` | Delete category; admin later | 204 |
| `GET` | `/tags` | List tags | 200 |
| `POST` | `/tags` | Create tag | 201 |
| `GET` | `/tags/:slug` | Read tag | 200 |

Filtering `/posts?category=...` avoids a separate nested endpoint unless a product requirement makes `/categories/:slug/posts` valuable.

## 48–60 Minutes — Writes and Validation Boundaries

Define separate inputs:

```ts
interface CreatePostInput {
  title: string;
  body: string;
  status?: "draft" | "published";
  categoryId?: number | null;
  tagIds?: number[];
}

interface UpdatePostInput {
  title?: string;
  body?: string;
  status?: "draft" | "published";
  categoryId?: number | null;
  tagIds?: number[];
}
```

Missing means “do not change” for PATCH. Explicit `categoryId: null` means remove the category. Reject an empty update object. Do not allow clients to set server-owned fields such as `id`, `authorId`, `createdAt`, or `publishedAt` directly.

For tags, decide whether `tagIds` replaces the complete set or applies incremental changes. This course initially treats it as complete replacement and documents that behavior.

## 60–72 Minutes — Ownership and Visibility Matrix

Write rules before guards exist:

| Action | Anonymous | Reader | Author/owner | Admin |
|---|---:|---:|---:|---:|
| Read published post | Yes | Yes | Yes | Yes |
| Read another user's draft | No | No | No | Yes |
| Create post | No | No | Yes | Yes |
| Edit/delete post | No | No | Own only | Any |
| Create comment | No | Yes | Yes | Yes |
| Edit comment | No | Own only | Own only | Any |
| Moderate comment | No | No | On own post, if chosen | Any |
| Manage categories | No | No | No | Yes |

“Not allowed” can produce 401, 403, or sometimes 404 when hiding resource existence is a deliberate security policy. Record the policy consistently; do not improvise endpoint by endpoint.

## 72–90 Minutes — Contract Decisions

Create `practice/day-49/blog-api-contract.md` and record:

1. base path and versioning decision;
2. resource representation shapes;
3. complete endpoint table;
4. query parameters and defaults;
5. success statuses and important headers;
6. error envelope and common error codes;
7. ownership/visibility matrix;
8. slug normalization and uniqueness expectation;
9. delete semantics and whether deleted resources remain visible;
10. at least five open questions for later lessons.

Suggested error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "title", "message": "Title is required" }
    ],
    "requestId": "example-id"
  }
}
```

## Independent Exercises

1. Decide ID versus slug usage for every resource.
2. Define a post-list response with pagination metadata.
3. Specify what anonymous callers see for draft slugs.
4. Define tag replacement semantics for PATCH.
5. Decide whether deleting a category with posts conflicts or unassigns it.
6. Define duplicate slug and duplicate tag-name errors.
7. Add an endpoint only if a concrete use case requires it.
8. Review every endpoint for ownership and visibility.

## Common Mistakes and Debugging Advice

- Design public resources, not ORM tables.
- Do not expose secrets or server-owned fields.
- Keep write inputs separate from response types.
- Define missing versus null semantics.
- Empty collections normally return 200 with `[]`.
- Authorization rules must exist server-side.
- Avoid inventing endpoints without a use case.
- Record unresolved decisions explicitly.

## Review Questions

1. Why are API resources not identical to database tables?
2. Why use summary representations for relationships?
3. Which fields are server-owned?
4. How do missing and null differ in a PATCH?
5. How are drafts hidden from unauthorized callers?
6. Why define authorization before implementing it?
7. What tradeoff exists between IDs and slugs?
8. Which open decisions can wait for later phases?

## Completion Checklist

- [ ] All five core resources are modeled.
- [ ] Representations omit sensitive fields.
- [ ] Endpoint catalog includes success and failure behavior.
- [ ] Queries and defaults are documented.
- [ ] PATCH null/missing semantics are explicit.
- [ ] Ownership and visibility rules are complete.
- [ ] Error shape and open questions are recorded.
- [ ] All exercises and review questions are complete.

## Official References

- HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110
- JSON media type: https://www.rfc-editor.org/rfc/rfc8259
- OWASP API Security Top 10: https://owasp.org/API-Security/

## What to Send for Review

Send `blog-api-contract.md`, resource map, endpoint catalog, representations, ownership matrix, open questions, exercises, and review answers. Next: **Day 50 — Input Validation and a Consistent Error Shape**.

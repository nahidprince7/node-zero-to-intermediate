# Day 48 — REST Principles and Resource Design

> Core lesson: about 60–90 minutes. Design an HTTP API around resources and protocol semantics instead of controller function names.

## Learning Objectives

You will learn to:

- explain REST as architectural constraints rather than a URL style;
- identify resources and choose stable identifiers;
- map CRUD-like operations to HTTP semantics;
- design collection and item endpoints;
- represent relationships without excessive nesting;
- recognize tradeoffs rather than treating REST as rigid dogma.

## 0–15 Minutes — What REST Means

REST describes architectural constraints for networked systems. For this course, the practical ideas are:

- client and server have separated responsibilities;
- requests are self-contained enough to be understood;
- interactions are stateless from request to request;
- responses identify cacheability;
- resources have identifiers and representations;
- clients use a uniform interface based on HTTP semantics;
- layers such as proxies can exist between client and server.

An API is not automatically RESTful because it returns JSON or uses plural nouns. This course uses “REST API” pragmatically: resource-oriented HTTP with predictable methods, statuses, representations, and links where useful.

Stateless does not mean the server stores no data. It means the server does not require hidden conversational request state to understand the next request; authentication credentials and necessary context accompany each request.

## 15–30 Minutes — Model Resources, Not Functions

Prefer nouns representing addressable concepts:

```text
GET    /posts
POST   /posts
GET    /posts/42
PATCH  /posts/42
DELETE /posts/42
```

Avoid RPC-shaped paths for ordinary resource operations:

```text
/getAllPosts
/createPost
/updatePost?id=42
/deletePost/42
```

Some actions do not map cleanly to CRUD. First ask whether the action creates or changes an addressable resource or state transition:

```text
POST /posts/42/publications
DELETE /posts/42/publication
```

Alternatively, a documented `PATCH /posts/42` changing publication fields can be appropriate. Choose the model that makes invariants and permissions clearest.

## 30–43 Minutes — Collections and Items

A collection endpoint can support bounded query controls:

```text
GET /posts?page=2&limit=20&published=true&sort=-createdAt
```

A useful collection representation includes data plus navigation metadata:

```json
{
  "data": [],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 87,
    "totalPages": 5
  }
}
```

An empty collection normally returns 200 with an empty array, not 404. The collection exists; it currently has no matching members.

Item identifiers should be stable. Database IDs are common; unique slugs can provide readable public identifiers. Avoid changing a resource URI every time a display title changes unless redirects and compatibility are designed.

## 43–55 Minutes — Create, Replace, and Modify

- `POST /posts` asks the collection to create a subordinate resource; return 201 and `Location`.
- `PUT /posts/42` represents complete replacement at a known URI and is idempotent.
- `PATCH /posts/42` represents a partial modification; define the accepted patch format.
- `DELETE /posts/42` removes the resource; 204 is common when no representation is returned.

Do not use one `UpdatePostInput` where every property is optional without defining whether `null`, missing, and empty have different meanings.

Repeated POST can create duplicates unless the endpoint supports an explicit idempotency mechanism. Repeated PUT expresses the same intended state.

## 55–68 Minutes — Relationships and Nesting

Useful nesting expresses ownership or context:

```text
GET  /posts/42/comments
POST /posts/42/comments
GET  /comments/99
```

Avoid nesting every relationship indefinitely:

```text
/users/7/posts/42/comments/99/replies/3
```

Once a child has a globally useful identity, a top-level item endpoint is often clearer. Filtering can represent other relationships:

```text
GET /posts?authorId=7
GET /posts?tag=nodejs
```

For many-to-many relationships, decide whether the relationship itself needs metadata or actions. Adding a tag may be represented through a post update or a relationship resource; consistency matters more than ritual.

## 68–78 Minutes — Representation and Evolution

Keep a consistent envelope and date format:

```json
{
  "data": {
    "id": 42,
    "title": "Resource Design",
    "createdAt": "2026-08-28T10:30:00.000Z"
  }
}
```

Do not expose storage rows accidentally. Public fields, relationship shapes, and error structures form a contract. Adding optional response fields is usually easier than renaming or changing existing meanings.

Versioning is not a substitute for careful evolution. Start without a version prefix if the course project does not yet need simultaneous incompatible contracts; document the decision. Later, `/v1` or media-type versioning can be introduced when a real compatibility requirement exists.

## Guided Practice — Redesign an RPC API

Redesign these endpoints:

```text
POST /createPost
GET /getPost?id=12
POST /publishPost/12
POST /addCommentToPost/12
GET /getUserPosts/7
POST /deleteComment?id=9
```

For each replacement, document:

1. resource and identifier;
2. method and path;
3. request representation;
4. success status and headers;
5. likely failure statuses;
6. safety and idempotency;
7. authorization rule, even though auth is implemented later.

## Independent Exercises

1. Design collection and item endpoints for categories and tags.
2. Decide whether post publication is a PATCH or subresource.
3. Design comment creation under a post and direct comment access.
4. Return an empty filtered collection correctly.
5. Compare ID and slug resource identifiers.
6. Define PUT and PATCH semantics for a post.
7. Reduce a four-level nested URL.
8. Write one backward-compatible and one breaking API change.

## Common Mistakes and Debugging Advice

- REST is more than plural noun paths.
- Use HTTP methods for their semantics.
- An empty collection is normally 200, not 404.
- Return 201 and `Location` for creation.
- Define partial-update semantics precisely.
- Do not turn every verb into a custom endpoint automatically.
- Avoid deep nesting when resources have useful identities.
- Public representations should not mirror storage accidentally.

## Review Questions

1. What does stateless interaction mean?
2. Why prefer resource nouns over controller verbs?
3. How do collection and item endpoints differ?
4. How do POST, PUT, and PATCH differ?
5. Why is an empty collection not usually 404?
6. When is nesting helpful?
7. When should a nested resource also have a top-level endpoint?
8. Why is API versioning not the first solution to every change?

## Completion Checklist

- [ ] REST constraints can be explained pragmatically.
- [ ] Resources and stable identifiers are identified.
- [ ] CRUD-like operations use appropriate methods.
- [ ] Collection behavior and metadata are designed.
- [ ] Relationship URLs avoid excessive nesting.
- [ ] The RPC API redesign is documented fully.
- [ ] All exercises and review questions are complete.

## Official References

- HTTP Semantics (RFC 9110): https://www.rfc-editor.org/rfc/rfc9110
- REST dissertation, Chapter 5: https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
- URI syntax (RFC 3986): https://www.rfc-editor.org/rfc/rfc3986

## What to Send for Review

Send the redesigned endpoint table, resource relationship sketch, publication decision, PUT/PATCH semantics, compatibility examples, exercises, and review answers. Next: **Day 49 — Design the Blog Resources and Endpoints**.

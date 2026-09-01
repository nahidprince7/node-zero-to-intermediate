# Day 43 — Route Params, Query Params, and the `req`/`res` Objects

> Core lesson: about 60–90 minutes. Read each input channel deliberately and keep routing concerns separate from validation.

## Learning Objectives

You will learn to:

- distinguish route, query, header, and body inputs;
- read and validate route parameters;
- normalize Express query values safely;
- use important request and response properties;
- avoid trusting inferred client information blindly;
- design predictable filtering URLs.

## Setup

Continue Day 42 or create `practice/day-43` with Express 5, strict TypeScript, and `express.json({ limit: "100kb" })`.

## 0–15 Minutes — Four Input Channels

For this request:

```http
PATCH /posts/42?notify=true HTTP/1.1
Host: api.example.test
Content-Type: application/json
Authorization: Bearer example

{"title":"Updated"}
```

Express exposes:

- route parameter `42` through `request.params`;
- query value `true` through `request.query`;
- metadata through `request.headers` or `request.get()`;
- parsed JSON through `request.body` after the parser runs.

All four channels are untrusted. Type declarations describe how your code intends to use data; they do not prove that the client sent valid values.

## 15–30 Minutes — Route Parameters

```ts
app.get("/posts/:postId", (request, response) => {
  const postId = Number(request.params.postId);

  if (!Number.isSafeInteger(postId) || postId <= 0) {
    response.status(400).json({
      error: { code: "INVALID_POST_ID", message: "postId must be a positive integer" },
    });
    return;
  }

  const post = posts.find((candidate) => candidate.id === postId);

  if (!post) {
    response.status(404).json({
      error: { code: "POST_NOT_FOUND", message: "Post not found" },
    });
    return;
  }

  response.json({ data: post });
});
```

Route parameters are strings. Conversion can produce `NaN`, fractions, zero, or unsafe integers; validate after conversion.

Choose paths that express hierarchy without encoding every relationship:

```text
/posts/42
/posts/42/comments
/posts/42/comments/7
```

Avoid deeply nested paths when a resource can be addressed clearly on its own.

## 30–45 Minutes — Query Parameters

Queries commonly control filtering, sorting, pagination, and optional views:

```text
GET /posts?published=true&sort=createdAt&order=desc
```

Express query values can be strings, arrays, nested objects, or missing depending on the configured query parser and input. Normalize explicitly:

```ts
function optionalSingleString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

app.get("/posts", (request, response) => {
  const rawPublished = optionalSingleString(request.query.published);

  if (rawPublished !== undefined && rawPublished !== "true" && rawPublished !== "false") {
    response.status(400).json({
      error: { code: "INVALID_QUERY", message: "published must be true or false" },
    });
    return;
  }

  const published = rawPublished === undefined ? undefined : rawPublished === "true";
  const result = published === undefined
    ? posts
    : posts.filter((post) => post.published === published);

  response.json({ data: result });
});
```

The string `"false"` is truthy. Never convert query Booleans with `Boolean(value)`.

Queries should not perform unsafe state changes. A filter describes which representation to retrieve; it should not publish or delete posts.

## 45–57 Minutes — Useful Request and Response APIs

Selected request properties:

```ts
console.log({
  method: request.method,
  path: request.path,
  originalUrl: request.originalUrl,
  contentType: request.get("content-type"),
  acceptsJson: request.accepts("json"),
  ip: request.ip,
});
```

- `path` is the pathname for the current request;
- `originalUrl` preserves the original request URL across mounted routers;
- `get(name)` reads a header case-insensitively;
- `accepts` performs content-negotiation checks;
- `ip` depends on socket and proxy trust configuration.

Useful response operations:

```ts
response.set("Cache-Control", "no-store");
response.location(`/posts/${post.id}`);
response.status(201).json({ data: post });
```

Do not trust forwarded client IP or protocol headers unless the deployment proxy topology and Express `trust proxy` setting are configured deliberately.

## 57–65 Minutes — Type Route Parameters

Express handler generics can document parameter names:

```ts
import type { Request, Response } from "express";

interface PostParams {
  postId: string;
}

function getPost(request: Request<PostParams>, response: Response): void {
  const postId = Number(request.params.postId);
  // Runtime validation is still required.
  response.json({ data: { postId } });
}

app.get("/posts/:postId", getPost);
```

Static typing catches your own property-name mistakes. It cannot validate an HTTP request arriving at runtime.

## Guided Practice — Filterable Posts

Implement:

1. `GET /posts/:postId` with strict positive ID validation;
2. `GET /posts?published=true|false`;
3. optional `sort=title|createdAt`;
4. optional `order=asc|desc` with a documented default;
5. rejection of arrays and unsupported values;
6. responses that do not mutate the original array while sorting;
7. a response header reporting the result count.

## Independent Exercises

1. Test missing, valid, fractional, negative, and alphabetic IDs.
2. Send a repeated query such as `?published=true&published=false`.
3. Parse a bounded positive `limit` query.
4. Compare `request.url`, `path`, and `originalUrl`.
5. Read `Accept` with both `get` and `accepts`.
6. Sort a copied array rather than shared storage.
7. Define request generics without skipping runtime checks.
8. Explain when data belongs in a route, query, header, or body.

## Common Mistakes and Debugging Advice

- Route and query parameters arrive as untrusted values.
- TypeScript annotations are not runtime validation.
- `Boolean("false")` evaluates to true.
- Repeated query keys may produce arrays.
- Do not mutate shared arrays while preparing a sorted response.
- Use queries for optional retrieval controls, not state changes.
- Forwarded IP/protocol values require correct proxy trust.
- Avoid logging credentials and cookies while inspecting requests.

## Review Questions

1. How do route and query parameters differ semantically?
2. Why validate a typed route parameter at runtime?
3. Why is query normalization necessary?
4. What is wrong with `Boolean(request.query.published)`?
5. How do `path` and `originalUrl` differ?
6. What does `request.accepts` inspect?
7. Why can `request.ip` require deployment configuration?
8. Where should filtering and sorting controls live?

## Completion Checklist

- [ ] IDs are converted and validated.
- [ ] Query values are normalized before use.
- [ ] Filtering and sorting have bounded supported values.
- [ ] Shared data is not mutated by response preparation.
- [ ] Headers are read case-insensitively.
- [ ] Static types and runtime checks are both present.
- [ ] All exercises and review questions are complete.

## Official References

- Express request API: https://expressjs.com/en/5x/api.html#req
- Express response API: https://expressjs.com/en/5x/api.html#res
- Express routing guide: https://expressjs.com/en/guide/routing.html

## What to Send for Review

Send the route and query handlers, full edge-case output, sort-mutation check, input-channel explanation, exercises, and review answers. Next: **Day 44 — Middleware, Ordering, and `next()`**.

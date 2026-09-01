# Day 47 — Review Project: Rebuild the Raw API in Express

> Review lesson: about 90–120 minutes. Rebuild Day 41 with Express, then compare behavior and responsibilities—not only line counts.

## Learning Objectives

You will prove that you can:

- rebuild a known HTTP contract with Express 5;
- organize it with middleware, routers, controllers, and a service;
- preserve success and error behavior during a framework migration;
- test raw and Express implementations against the same cases;
- explain what Express removes, centralizes, and leaves to you.

## Project Constraint

Do not add new endpoints until the Day 41 contract behaves identically. A framework migration is successful when clients observe the intended contract, not when the new server starts.

Create `practice/day-47`, install Express 5 and the TypeScript tooling from Day 42, and use the Day 46 folder structure.

## Required Contract

Rebuild:

| Method | Path | Success | Important failures |
|---|---|---:|---|
| `GET` | `/health` | 200 | — |
| `GET` | `/posts` | 200 | — |
| `GET` | `/posts/:id` | 200 | 400 invalid ID, 404 missing |
| `POST` | `/posts` | 201 + `Location` | 400 malformed, 413 large, 415 media, 422 invalid |
| Any | unknown path | — | 404 route |
| Unsupported | known path | — | 405 + `Allow` |

Keep the error envelope stable:

```json
{
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post not found",
    "details": []
  }
}
```

## 0–20 Minutes — Build the Skeleton

Create:

```text
src/
├── app.ts
├── server.ts
├── errors/app-error.ts
├── middleware/error-handler.ts
├── middleware/not-found.ts
└── posts/
    ├── post.types.ts
    ├── post.validation.ts
    ├── post.service.ts
    ├── post.controller.ts
    └── post.router.ts
```

Compose middleware in this order:

```ts
app.use(requestId);
app.use(express.json({ limit: "100kb" }));
app.get("/health", healthController);
app.use("/posts", postsRouter);
app.use(notFound);
app.use(errorHandler);
```

## 20–50 Minutes — Implement One Vertical Slice at a Time

Suggested order:

1. `GET /health` end to end;
2. list posts through router → controller → service;
3. get one post with ID validation;
4. create with media-type and body validation;
5. parser-error mapping;
6. 404, 405, and unexpected 500 behavior.

Do not put all behavior into the router merely to finish faster. This review tests whether the Day 46 boundaries are usable.

For JSON-only creation, a small precondition middleware can reject the wrong media type:

```ts
import type { RequestHandler } from "express";

export const requireJson: RequestHandler = (request, _response, next) => {
  if (!request.is("application/json")) {
    next(new AppError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json"));
    return;
  }

  next();
};
```

Use it only on routes that require JSON content:

```ts
postsRouter.post("/", requireJson, controller.create);
```

## 50–75 Minutes — One Test Suite, Two Servers

Create `requests.http` or a shell checklist where the base URL can change:

```text
RAW_BASE=http://127.0.0.1:3000
EXPRESS_BASE=http://127.0.0.1:3001
```

Compare status, important headers, and JSON shape for:

- collection read;
- existing and missing IDs;
- invalid IDs;
- successful creation;
- malformed and invalid JSON;
- wrong content type;
- oversized content;
- unknown route;
- unsupported method;
- deliberate unexpected error.

Dynamic fields such as uptime, generated IDs, request IDs, and timestamps need semantic comparison rather than byte-for-byte equality.

## 75–90 Minutes — Compare Responsibilities

Complete this table in your own words:

| Concern | Raw Node | Express |
|---|---|---|
| Method/path matching | Manual branching | Route registration |
| Path parameters | Manual matching | `req.params` |
| Query parsing | `URL.searchParams` | `req.query` |
| Body streaming | Manual | `express.json` |
| Body limit | Manual byte counting | Parser option |
| Response serialization | Helper | `res.json` |
| Middleware chain | Manual composition | Ordered stack and `next` |
| Async rejection | Explicit Promise catch | Express 5 forwarding |
| Validation rules | Your code | Still your code |
| Status/header choices | Your code | Still your code |
| Business rules | Your code | Still your code |

Less handwritten plumbing is valuable, but abstraction does not remove responsibility for protocol correctness, security, validation, and domain behavior.

## Required Review Evidence

1. Source tree and dependency list.
2. Same contract exercised against both implementations.
3. At least ten success/failure comparisons.
4. A written explanation of three differences.
5. A note about any intentionally changed behavior.
6. No use of `any` to silence request-body uncertainty.

## Stretch Goals

1. Add `DELETE /posts/:id` to both versions.
2. Add a tiny automated black-box comparison using Node `fetch`.
3. Confirm both servers return JSON for every failure.
4. Add request IDs and compare only their presence and format.
5. Import `app` without listening to demonstrate testability.

## Common Mistakes and Debugging Advice

- Compare behavior, not just source length.
- Do not accidentally change status codes during migration.
- Register parser and routes in the correct order.
- A JSON parser is not a validator.
- Preserve 404 route versus 404 resource distinctions.
- Do not share mutable arrays between the two running servers.
- Compare dynamic values semantically.
- Record intentional differences instead of hiding them.

## Reflection Questions

1. Which raw code disappeared entirely?
2. Which raw code became configuration?
3. Which responsibilities stayed unchanged?
4. Which version makes middleware order clearer to you?
5. Which version is easier to test and why?
6. What could Express still allow you to implement incorrectly?

## Completion Checklist

- [ ] The Express API matches the required contract.
- [ ] Router, controller, and service boundaries are present.
- [ ] Parser, 404, and error middleware are ordered correctly.
- [ ] Both servers pass the shared comparison matrix.
- [ ] Dynamic values are compared appropriately.
- [ ] The responsibility comparison is complete.
- [ ] All reflection questions are answered.

## Official References

- Express routing: https://expressjs.com/en/guide/routing.html
- Express middleware: https://expressjs.com/en/guide/using-middleware.html
- Express error handling: https://expressjs.com/en/guide/error-handling.html

## What to Send for Review

Send both implementations, the shared request suite, comparison results, completed responsibility table, source tree, and reflection answers. Next: **Day 48 — REST Principles and Resource Design**.

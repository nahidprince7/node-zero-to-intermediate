# Day 45 — Error-Handling Middleware and 404s

> Core lesson: about 60–90 minutes. Give every failure a deliberate path to one stable public response.

## Learning Objectives

You will learn to:

- distinguish a 404 result from an operational error;
- create typed application errors;
- write Express error-handling middleware;
- handle malformed JSON consistently;
- forward async failures correctly in Express 5;
- avoid leaking internal details or responding twice.

## 0–15 Minutes — 404 Is Not Automatically an Error

If no Express route responds, add final ordinary middleware:

```ts
import type { RequestHandler } from "express";

const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(
    404,
    "ROUTE_NOT_FOUND",
    `Cannot ${request.method} ${request.path}`,
  ));
};
```

Express does not treat “no route matched” as a thrown error by itself. You decide whether the final 404 middleware sends directly or creates an application error for the shared error formatter.

A missing resource inside a matched route is also a 404, but should usually have a domain-specific code such as `POST_NOT_FOUND`.

## 15–28 Minutes — Define Public Application Errors

Create `src/errors/app-error.ts`:

```ts
export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details: ErrorDetail[] = [],
  ) {
    super(message);
  }
}
```

Expected errors represent known client-visible outcomes: invalid ID, missing post, duplicate slug, or failed validation. Programmer bugs and unexpected dependency failures should not be disguised as expected errors.

Do not let callers choose arbitrary status codes or expose database messages directly.

## 28–45 Minutes — Error Middleware

An Express error handler has four parameters, even when some are unused:

```ts
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  console.error("Unexpected request error:", error);
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      details: [],
    },
  });
};
```

If headers were already sent—perhaps a streamed response failed—delegate to Express's default handler so it can close the connection appropriately.

Register in this order:

```ts
app.use(express.json({ limit: "100kb" }));
app.use("/posts", postsRouter);
app.use(notFound);
app.use(errorHandler);
```

## 45–57 Minutes — Parser Errors and Async Errors

`express.json` can reject malformed or oversized bodies before the route runs. Narrow known parser errors without relying on every unknown property:

```ts
interface BodyParserError extends Error {
  status?: number;
  type?: string;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return error instanceof Error && "type" in error;
}
```

At the top of the error handler, map supported cases:

```ts
if (isBodyParserError(error) && error.type === "entity.parse.failed") {
  response.status(400).json({
    error: { code: "MALFORMED_JSON", message: "Request body contains malformed JSON", details: [] },
  });
  return;
}

if (isBodyParserError(error) && error.type === "entity.too.large") {
  response.status(413).json({
    error: { code: "BODY_TOO_LARGE", message: "Request body is too large", details: [] },
  });
  return;
}
```

Express 5 automatically forwards a thrown error or rejected Promise returned by an async handler:

```ts
app.get("/posts/:postId", async (request, response) => {
  const post = await postService.findById(request.params.postId);

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  response.json({ data: post });
});
```

Do not add an Express 4 async wrapper to every route without understanding why; this course targets Express 5.

## 57–65 Minutes — Logging Without Leaking

Log enough internal context to diagnose unexpected failures, ideally with a request ID. Return only the stable public shape.

Never expose by default:

- stack traces;
- SQL or ORM errors;
- filesystem paths;
- environment variables;
- tokens, cookies, or passwords;
- internal hostnames and connection details.

Expected 4xx outcomes may not need error-level logs. A client typo is not necessarily a server incident.

## Guided Practice — Consistent Failure Pipeline

Implement and test:

1. unknown route → `ROUTE_NOT_FOUND` 404;
2. missing post → `POST_NOT_FOUND` 404;
3. invalid ID → `INVALID_POST_ID` 400;
4. malformed JSON → `MALFORMED_JSON` 400;
5. oversized JSON → `BODY_TOO_LARGE` 413;
6. a deliberately thrown `AppError`;
7. a deliberately thrown unexpected `Error` → generic 500;
8. one error handler registered after the routes.

## Independent Exercises

1. Compare a route 404 with a resource 404.
2. Throw inside a synchronous handler.
3. Reject inside an awaited Express 5 handler.
4. Trigger malformed and oversized body-parser errors.
5. Test an error after `headersSent` using a stream route.
6. Confirm the public 500 contains no stack.
7. Attach a request ID to unexpected logs and responses.
8. Decide which 4xx outcomes deserve warning-level logs.

## Common Mistakes and Debugging Advice

- Final 404 middleware has three parameters; error middleware has four.
- Register 404 after routes and error handling after the 404.
- Return after sending an error response.
- Forward errors exactly once.
- Delegate when headers are already sent.
- Do not expose arbitrary `error.message` for unexpected errors.
- Narrow unknown errors before reading custom properties.
- Express 5 handles rejected returned Promises, not detached failures.

## Review Questions

1. Why does an unmatched route not automatically enter error handling?
2. How do route and resource 404s differ?
3. Why must error middleware have four parameters?
4. What should happen when headers are already sent?
5. How does Express 5 handle rejected async handlers?
6. Why map body-parser failures explicitly?
7. What distinguishes expected and unexpected errors?
8. Why should internal errors differ from public messages?

## Completion Checklist

- [ ] Application errors have status, code, message, and details.
- [ ] Unknown routes and missing resources are distinct.
- [ ] Parser failures use the common JSON shape.
- [ ] Async handler failures reach error middleware.
- [ ] Headers-sent failures delegate safely.
- [ ] Unexpected 500 responses reveal no internals.
- [ ] All exercises and review questions are complete.

## Official References

- Express error handling: https://expressjs.com/en/guide/error-handling.html
- Express 5 migration guide: https://expressjs.com/en/guide/migrating-5.html
- Express response API: https://expressjs.com/en/5x/api.html#res.headersSent

## What to Send for Review

Send the error classes and middleware, registration order, every failure response, server logs for unexpected failure, exercises, and review answers. Next: **Day 46 — Routers, Controllers, and Services**.

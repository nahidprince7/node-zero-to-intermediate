# Day 44 — Middleware: How It Works, Ordering, and `next()`

> Core lesson: about 60–90 minutes. Treat an Express application as an ordered request-processing pipeline.

## Learning Objectives

You will learn to:

- explain the Express middleware contract;
- write application- and router-level middleware;
- predict execution from registration order;
- distinguish ending, delegating, and error delegation;
- add request-scoped state safely;
- avoid hanging requests and double responses.

## 0–15 Minutes — The Middleware Contract

A normal middleware function receives request, response, and `next`:

```ts
import type { RequestHandler } from "express";

const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now();

  response.on("finish", () => {
    const durationMs = performance.now() - startedAt;
    console.log(request.method, request.originalUrl, response.statusCode, durationMs.toFixed(1));
  });

  next();
};
```

Each middleware must choose one outcome:

1. end the response;
2. call `next()` to continue normal processing;
3. call `next(error)` or reject/throw to enter error handling.

Failing to end or delegate leaves the request hanging. Sending and then calling `next()` can cause later code to send a second response.

## 15–28 Minutes — Order Is Behavior

```ts
app.use(requestLogger);
app.use(express.json({ limit: "100kb" }));
app.use("/posts", postsRouter);
app.use(notFound);
app.use(errorHandler);
```

Express examines this stack in registration order. A request moves forward when a layer matches and calls `next`. A terminating handler stops normal traversal.

Predict this output before running it:

```ts
app.use((_request, _response, next) => {
  console.log("A before");
  next();
  console.log("A after");
});

app.get("/demo", (_request, response) => {
  console.log("B handler");
  response.send("done");
});
```

The output is `A before`, `B handler`, `A after`. `next()` transfers control synchronously into downstream work unless that work introduces asynchronous boundaries. Code after `next` is possible, but use it carefully; response events are clearer for completion logging.

## 28–42 Minutes — Mount Paths and Router Middleware

Application-level middleware can run globally or under a path:

```ts
app.use("/admin", (_request, response, next) => {
  response.set("X-Admin-Area", "true");
  next();
});
```

Router-level middleware scopes behavior:

```ts
import { Router } from "express";

const postsRouter = Router();

postsRouter.use((_request, _response, next) => {
  console.log("Posts router reached");
  next();
});

postsRouter.get("/", (_request, response) => {
  response.json({ data: [] });
});

app.use("/posts", postsRouter);
```

Inside that router, `/` corresponds to the mounted `/posts`. `request.originalUrl` retains the full original URL.

## 42–55 Minutes — Request-Scoped State

Prefer `response.locals` for data used by later middleware during this response:

```ts
import { randomUUID } from "node:crypto";

interface RequestContext {
  requestId: string;
}

app.use((_request, response, next) => {
  const context: RequestContext = { requestId: randomUUID() };
  response.locals.context = context;
  response.set("X-Request-Id", context.requestId);
  next();
});
```

Values in `res.locals` live for one request-response cycle. They are not shared application storage. When stronger static typing is needed, augment Express's `Locals` type in a `.d.ts` file included by TypeScript.

Do not place per-request identity or mutable state in a module-level variable; concurrent requests would overwrite each other.

## 55–65 Minutes — Async Middleware in Express 5

Express 5 forwards rejected returned Promises to error handling:

```ts
const loadPost: RequestHandler = async (request, response, next) => {
  const post = await findPost(request.params.postId);

  if (!post) {
    response.status(404).json({ error: { message: "Post not found" } });
    return;
  }

  response.locals.post = post;
  next();
};
```

Successful async middleware must still call `next()` if it does not end the response. Do not mix `next(error)` with throwing the same error; forward it exactly once.

Errors from detached work such as a timer are not automatically connected merely because the surrounding middleware was async. Await work or catch and pass failures deliberately.

## Guided Practice — Observable Pipeline

Build a pipeline containing:

1. request-ID middleware;
2. completion logger using the response `finish` event;
3. JSON parser with a limit;
4. a `/posts` router;
5. route-specific middleware that requires `X-Learning-Key: practice`;
6. a successful handler reading request context;
7. final 404 middleware;
8. an error handler placeholder for Day 45.

Write the expected order for accepted, rejected, unknown, and malformed requests before testing.

## Independent Exercises

1. Create three named middleware functions and predict their order.
2. Omit `next` deliberately, observe the hang, then fix it.
3. Send a response and call `next`, observe the failure, then fix it.
4. Mount one middleware only under `/posts`.
5. Add a value to `res.locals` and consume it later.
6. Compare the `finish` and `close` response events.
7. Throw inside an awaited Express 5 handler and observe delegation.
8. Explain why module-level current-user state is unsafe.

## Common Mistakes and Debugging Advice

- Middleware order is part of application behavior.
- End, delegate normally, or delegate an error—do exactly one.
- A successful async middleware still needs `next` when it sends nothing.
- Return after an early response.
- Use response events for accurate completion logging.
- Store request-scoped values in `res.locals`, not global variables.
- Parsers must run before code that reads parsed bodies.
- Forward each failure once.

## Review Questions

1. What are the three normal middleware arguments?
2. What happens when middleware neither responds nor calls `next`?
3. Why is registration order significant?
4. What does a mount path change?
5. Why is `res.locals` safer than module-level request state?
6. What does Express 5 do with rejected returned Promises?
7. When must successful async middleware call `next`?
8. Why should a failure be forwarded only once?

## Completion Checklist

- [ ] Middleware outcome choices are understood.
- [ ] Global and mounted middleware work.
- [ ] Execution order is predicted correctly.
- [ ] Request IDs remain request-scoped.
- [ ] Completion logging uses response events.
- [ ] Async failures enter error handling once.
- [ ] All exercises and review questions are complete.

## Official References

- Writing Express middleware: https://expressjs.com/en/guide/writing-middleware.html
- Using Express middleware: https://expressjs.com/en/guide/using-middleware.html
- Express 5 migration guide: https://expressjs.com/en/guide/migrating-5.html

## What to Send for Review

Send the middleware stack, predicted and actual execution traces, hang/double-send fixes, request-ID output, exercises, and review answers. Next: **Day 45 — Error-Handling Middleware and 404s**.

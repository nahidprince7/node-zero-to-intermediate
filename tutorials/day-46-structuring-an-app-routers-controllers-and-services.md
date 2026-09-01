# Day 46 — Structuring an App: Routers, Controllers, and Services

> Core lesson: about 60–90 minutes. Separate HTTP wiring from use-case logic without creating unnecessary layers.

## Learning Objectives

You will learn to:

- split application creation from process startup;
- organize a feature around router, controller, and service roles;
- keep HTTP objects out of domain services;
- pass dependencies explicitly;
- avoid circular imports and shared mutable globals;
- identify where persistence will fit later.

## 0–15 Minutes — Separate App from Server

Use this structure:

```text
src/
├── app.ts
├── server.ts
├── errors/
│   └── app-error.ts
├── middleware/
│   ├── error-handler.ts
│   └── not-found.ts
└── posts/
    ├── post.types.ts
    ├── post.service.ts
    ├── post.controller.ts
    └── post.router.ts
```

`src/app.ts` builds the application without opening a port:

```ts
import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { postsRouter } from "./posts/post.router.js";

export const app = express();

app.use(express.json({ limit: "100kb" }));
app.use("/posts", postsRouter);
app.use(notFound);
app.use(errorHandler);
```

`src/server.ts` owns process lifecycle:

```ts
import { app } from "./app.js";

const server = app.listen(3000, "127.0.0.1", () => {
  console.log("API listening at http://127.0.0.1:3000");
});
```

This separation will make automated API testing easier because tests can import `app` without competing for a fixed port.

## 15–28 Minutes — Responsibilities

| Layer | Owns | Avoids |
|---|---|---|
| Router | Method/path mapping and middleware composition | Business decisions |
| Controller | Translating HTTP input/output to a use-case call | Storage mechanics |
| Service | Application rules and operations | Express `req`/`res` |
| Repository later | Persistent storage queries | HTTP concerns |

These are boundaries, not ceremonial filenames. A tiny feature may have short files. Add a layer because it provides a useful responsibility boundary, not because every project diagram contains it.

## 28–42 Minutes — Service Without Express

`post.types.ts`:

```ts
export interface Post {
  id: number;
  title: string;
  published: boolean;
}

export interface CreatePostInput {
  title: string;
  published: boolean;
}
```

`post.service.ts`:

```ts
import type { CreatePostInput, Post } from "./post.types.js";

export class PostService {
  private readonly posts: Post[] = [];
  private nextId = 1;

  findAll(): Post[] {
    return this.posts.map((post) => ({ ...post }));
  }

  findById(id: number): Post | undefined {
    const post = this.posts.find((candidate) => candidate.id === id);
    return post ? { ...post } : undefined;
  }

  create(input: CreatePostInput): Post {
    const post = { id: this.nextId, ...input };
    this.nextId += 1;
    this.posts.push(post);
    return { ...post };
  }
}
```

The service accepts and returns domain values. It does not know status codes, headers, Express, or route parameters. Copying returned values prevents callers from accidentally mutating the service's storage; a database will later replace this in-memory implementation.

## 42–55 Minutes — Controllers and Router

`post.controller.ts`:

```ts
import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import type { PostService } from "./post.service.js";

export function createPostController(service: PostService) {
  const list: RequestHandler = (_request, response) => {
    response.json({ data: service.findAll() });
  };

  const getById: RequestHandler<{ postId: string }> = (request, response) => {
    const id = Number(request.params.postId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError(400, "INVALID_POST_ID", "postId must be a positive integer");
    }

    const post = service.findById(id);

    if (!post) {
      throw new AppError(404, "POST_NOT_FOUND", "Post not found");
    }

    response.json({ data: post });
  };

  return { list, getById };
}
```

`post.router.ts` composes dependencies and maps URLs:

```ts
import { Router } from "express";
import { createPostController } from "./post.controller.js";
import { PostService } from "./post.service.js";

const service = new PostService();
const controller = createPostController(service);

export const postsRouter = Router();

postsRouter.get("/", controller.list);
postsRouter.get("/:postId", controller.getById);
```

Passing the service into the controller makes the dependency visible and replaceable in tests.

## 55–65 Minutes — Dependency Direction

Keep dependencies pointing inward:

```text
router -> controller -> service -> repository (later)
```

The service may expose domain-specific errors, but it should not import an Express response object. Avoid barrel files while the structure is small if they conceal circular imports. Import the exact module needed.

Do not instantiate a new service inside every handler; that would reset in-memory state and later create resources repeatedly. Compose long-lived dependencies once at application startup.

## Guided Practice — Structured Posts Feature

Refactor Day 45 into:

1. app creation separate from server startup;
2. a posts router with no storage logic;
3. controllers translating parameters, bodies, and response statuses;
4. a service implementing list, find, and create;
5. one composed service instance;
6. shared not-found and error middleware;
7. no imports of Express inside the service;
8. identical external API behavior before and after refactoring.

## Independent Exercises

1. Add delete behavior across the three layers.
2. Instantiate a service twice and explain the state difference.
3. Replace the service with a small fake when constructing controllers.
4. Move HTTP validation out of the service where appropriate.
5. Put a domain uniqueness rule in the service.
6. Draw the import/dependency direction.
7. Detect and remove one circular import attempt.
8. Explain when this separation would be excessive for a tiny script.

## Common Mistakes and Debugging Advice

- Keep port binding out of `app.ts`.
- Routers map; controllers translate; services implement use cases.
- Do not pass `req` or `res` into services.
- Compose dependencies once instead of hiding repeated construction.
- Preserve observable behavior during refactoring.
- Avoid module-level arrays exported for everyone to mutate.
- Use `.js` extensions for relative imports under NodeNext ESM.
- Boundaries should clarify ownership, not multiply boilerplate blindly.

## Review Questions

1. Why separate application creation from listening?
2. What belongs in a router?
3. What translation does a controller perform?
4. Why should a service avoid Express objects?
5. Where will database access fit?
6. What does explicit dependency passing improve?
7. Why compose a long-lived service once?
8. How do you know a refactor preserved behavior?

## Completion Checklist

- [ ] App construction and process startup are separate.
- [ ] Posts code is organized by clear responsibility.
- [ ] The service has no Express dependency.
- [ ] Dependencies are explicit and replaceable.
- [ ] In-memory state has one intentional owner.
- [ ] Endpoint behavior remains unchanged.
- [ ] All exercises and review questions are complete.

## Official References

- Express Router API: https://expressjs.com/en/5x/api/router/
- Express routing guide: https://expressjs.com/en/guide/routing.html
- Node.js ESM: https://nodejs.org/api/esm.html

## What to Send for Review

Send the source tree, each feature file, dependency diagram, before/after API tests, fake-service exercise, and review answers. Next: **Day 47 — Rebuild the Raw API in Express**.

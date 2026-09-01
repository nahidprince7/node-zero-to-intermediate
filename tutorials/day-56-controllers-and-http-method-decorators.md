# Day 56 — Controllers and HTTP Method Decorators

> Core lesson: about 60–90 minutes. Map the blog's HTTP contract to controller methods while keeping business work elsewhere.

## Learning Objectives

You will learn to:

- define controller route prefixes;
- map standard HTTP methods with decorators;
- extract route, query, header, and body values;
- control response status and headers;
- return values through Nest's standard response handling;
- avoid mixing platform-specific response code into controllers.

## 0–15 Minutes — Controller Metadata

Create or replace `src/posts/posts.controller.ts`:

```ts
import { Controller, Get } from "@nestjs/common";

@Controller("posts")
export class PostsController {
  @Get()
  findAll(): { data: unknown[] } {
    return { data: [] };
  }
}
```

`@Controller("posts")` supplies a prefix. `@Get()` maps GET requests at that prefix. With a global `api` prefix, the route is `GET /api/posts`.

Decorators attach metadata that Nest reads to build routing. They do not execute the handler at class-definition time.

## 15–30 Minutes — HTTP Method Decorators

```ts
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from "@nestjs/common";

@Controller("posts")
export class PostsController {
  @Get()
  findAll() {
    return { data: [] };
  }

  @Post()
  create() {
    return { data: { id: 1 } };
  }

  @Patch(":postId")
  update() {
    return { data: { updated: true } };
  }

  @Delete(":postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(): void {}
}
```

Nest defaults successful POST handlers to 201 and most other successful handlers to 200. Use `@HttpCode` when the contract requires another status. A 204 response must not contain a body.

Other standard decorators include `@Put`, `@Options`, and `@Head`.

## 30–47 Minutes — Extract Request Data

```ts
import {
  Body,
  Headers,
  Param,
  Query,
} from "@nestjs/common";

@Get(":postId")
findOne(@Param("postId") postId: string) {
  return { data: { postId } };
}

@Get()
findAll(
  @Query("published") published: string | undefined,
  @Query("limit") limit: string | undefined,
) {
  return { data: [], meta: { published, limit } };
}

@Post()
create(
  @Body() body: unknown,
  @Headers("content-type") contentType: string | undefined,
) {
  return { data: { body, contentType } };
}
```

- `@Param` reads route parameters;
- `@Query` reads query values;
- `@Body` reads the adapter-parsed body;
- `@Headers` reads incoming headers.

Values are still untrusted. Pipes will transform and validate parameters later; DTOs begin on Day 60 and validation decorators on Day 61.

## 47–58 Minutes — Status and Headers

Set a static header with a decorator:

```ts
import { Header } from "@nestjs/common";

@Get()
@Header("Cache-Control", "no-store")
findAll() {
  return { data: [] };
}
```

For a dynamic `Location` header, prefer an abstraction that does not take over the whole response. Nest supports response passthrough when native access is truly needed, but ordinary handlers should return values and let Nest serialize them.

Using `@Res()` without passthrough switches that handler into library-specific response mode: you must send the response yourself, it couples code to Express/Fastify details, and missing sends can hang. Reserve it for capabilities that require native response access.

## 58–68 Minutes — Route Specificity and Shape

Static routes that could collide with dynamic parameters must be declared deliberately:

```ts
@Get("search")
search() {
  return { data: [] };
}

@Get(":postId")
findOne(@Param("postId") postId: string) {
  return { data: { postId } };
}
```

Place fixed paths before broad parameter paths so `/posts/search` is not accidentally treated as an ID in configurations where order affects matching.

Keep controllers thin: extract transport input, invoke a provider, and translate the result to the HTTP contract. Do not store posts in a controller field.

## Guided Practice — Posts Controller Contract

Implement placeholder handlers for:

1. `GET /posts` with query extraction;
2. `POST /posts` with an unknown body;
3. `GET /posts/search` before the parameter route;
4. `GET /posts/:postId`;
5. `PATCH /posts/:postId`;
6. `DELETE /posts/:postId` returning 204;
7. a static cache header on the list route;
8. no direct Express response injection.

Test every route with curl and record the default status for each method.

## Independent Exercises

1. Add `@Put`, `@Options`, and `@Head` examples.
2. Compare a controller prefix with a global prefix.
3. Read one route parameter and two queries.
4. Read a selected request header without logging secrets.
5. Override a POST status and explain why.
6. Return a body accidentally with 204, then correct it.
7. Put a dynamic route above a colliding static route and test.
8. Explain when native `@Res()` access is justified.

## Common Mistakes and Debugging Advice

- Register the controller in its module.
- Controller and method paths combine.
- Parameters and bodies remain untrusted despite annotations.
- POST defaults to 201; verify rather than assume all methods return 200.
- A 204 response has no body.
- Place colliding static routes before broad dynamic routes.
- Avoid native response mode for ordinary JSON endpoints.
- Controllers coordinate HTTP; providers own application work.

## Review Questions

1. What metadata does `@Controller` provide?
2. How do class and method paths combine?
3. Which decorators extract each input channel?
4. What is Nest's default POST success status?
5. When is `@HttpCode` useful?
6. Why is `@Body() body: unknown` honest today?
7. What changes when using native `@Res()` mode?
8. Why should controllers remain thin?

## Completion Checklist

- [ ] Controller prefix and method decorators map correctly.
- [ ] Route, query, header, and body inputs are extracted.
- [ ] Default and explicit statuses are understood.
- [ ] DELETE returns a bodyless 204.
- [ ] Static and dynamic routes do not collide.
- [ ] Native response mode is avoided without a reason.
- [ ] All exercises and review questions are complete.

## Official References

- Nest controllers: https://docs.nestjs.com/controllers
- Nest HTTP status codes: https://docs.nestjs.com/controllers#status-code
- Nest request objects: https://docs.nestjs.com/controllers#request-object

## What to Send for Review

Send controller source, route table, curl output with statuses, collision test, native-response explanation, exercises, and review answers. Next: **Day 57 — Providers and Dependency Injection**.

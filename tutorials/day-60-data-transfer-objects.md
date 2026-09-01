# Day 60 — Data Transfer Objects (DTOs)

> Core lesson: about 60–90 minutes. Define explicit transport shapes that survive at runtime and prepare for validation and OpenAPI.

## Learning Objectives

You will learn to:

- explain what a DTO represents;
- use DTO classes for request boundaries;
- distinguish DTOs from domain models and database entities;
- create separate create, update, query, and response shapes;
- understand why TypeScript types alone do not validate requests;
- prevent clients from assigning server-owned fields.

## 0–15 Minutes — What a DTO Is

A Data Transfer Object describes data crossing a boundary. In this course, request DTOs describe permitted HTTP input and response DTOs document public output.

A DTO is not automatically:

- a database model;
- a domain entity with all business behavior;
- proof that runtime input is valid;
- permission to expose every stored field;
- one universal type reused for every operation.

Keep transport contracts separate so storage and domain changes do not accidentally rewrite the public API.

## 15–30 Minutes — Why Nest DTOs Use Classes

Create `src/posts/dto/create-post.dto.ts`:

```ts
export class CreatePostDto {
  title!: string;
  body!: string;
  published!: boolean;
  categoryId?: number | null;
  tagIds?: number[];
}
```

Classes remain as JavaScript values at runtime. Interfaces and type aliases are erased during compilation. Nest pipes and OpenAPI tooling can use class metadata, which is why Nest commonly models DTOs as classes.

The definite-assignment marker `!` satisfies strict property initialization; it does not make a value required at runtime and does not validate anything.

## 30–42 Minutes — Use a Request DTO

```ts
import { Body, Controller, Post } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto.js";

@Controller("posts")
export class PostsController {
  @Post()
  create(@Body() input: CreatePostDto) {
    return { data: input };
  }
}
```

This gives editor support and compile-time checking inside the handler. It does not prove the incoming body contains those fields. Without a configured validation mechanism, a client can still send missing, incorrectly typed, or extra properties.

Day 61 adds validation decorators and `ValidationPipe`. Until then, treat the runtime body as untrusted despite the annotation.

## 42–55 Minutes — Separate Operation DTOs

PATCH has different requiredness:

```ts
export class UpdatePostDto {
  title?: string;
  body?: string;
  published?: boolean;
  categoryId?: number | null;
  tagIds?: number[];
}
```

List queries deserve their own shape:

```ts
export class ListPostsQueryDto {
  published?: string;
  page?: string;
  limit?: string;
  sort?: string;
}
```

They are strings now because query parameters arrive as text. Transformation into numbers and Booleans belongs to a deliberate pipe/validation design.

Create and update are not interchangeable: create requires core fields, while update permits a subset and must later reject an empty object. `null` should mean removal only for fields where the contract explicitly permits it.

## 55–68 Minutes — Domain and Response Shapes

An internal domain value can include server-owned information:

```ts
export interface Post {
  id: number;
  authorId: number;
  title: string;
  body: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

A public response DTO may differ:

```ts
export class PostResponseDto {
  id!: number;
  title!: string;
  body!: string;
  published!: boolean;
  createdAt!: string;
  updatedAt!: string;
}
```

Map deliberately:

```ts
function toPostResponse(post: Post): PostResponseDto {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    published: post.published,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
```

The response omits `authorId` here only as an example design choice; Day 49's final representation can include a safe author summary instead. Explicit mapping prevents accidental data exposure.

## 68–78 Minutes — Server-Owned Fields and Mass Assignment

Never include these in `CreatePostDto` merely because the database model has them:

```text
id
authorId
createdAt
updatedAt
publishedAt
moderationStatus
```

The authenticated identity will determine `authorId`; server logic determines timestamps and protected state. Passing a raw request object into a persistence create/update call can let clients assign fields they do not own.

DTO whitelisting on Day 61 plus explicit service inputs provides defense in depth. Database constraints and authorization remain necessary.

## 78–85 Minutes — File Organization

Use predictable names:

```text
src/posts/
├── dto/
│   ├── create-post.dto.ts
│   ├── update-post.dto.ts
│   ├── list-posts-query.dto.ts
│   └── post-response.dto.ts
├── posts.controller.ts
├── posts.service.ts
└── posts.module.ts
```

Avoid a giant global `dto` directory that obscures feature ownership. Re-export files only when a barrel genuinely improves imports without creating cycles.

## Guided Practice — Posts Transport Contract

Create:

1. `CreatePostDto` with client-owned write fields;
2. `UpdatePostDto` with PATCH semantics;
3. `ListPostsQueryDto` reflecting raw query types;
4. `PostResponseDto` with safe serialized fields;
5. controller annotations using each request DTO;
6. a domain `Post` model separate from DTOs;
7. an explicit response mapper;
8. tests showing annotations alone accept invalid runtime bodies today.

## Independent Exercises

1. Send a missing title and observe the lack of runtime validation.
2. Send `published: "false"` and inspect the runtime value.
3. Send unknown `authorId` and observe current behavior.
4. Explain every difference between create and update DTOs.
5. Design a create-comment DTO.
6. Design a safe user response DTO that omits credentials.
7. Map `Date` objects to ISO strings.
8. Explain why a Prisma model should not become the HTTP DTO automatically.

## Common Mistakes and Debugging Advice

- A DTO annotation is not runtime validation.
- Use classes when Nest needs runtime metadata.
- `!` affects TypeScript checking, not incoming data.
- Do not reuse database entities as request DTOs.
- Create and PATCH requiredness differs.
- Query values begin as strings.
- Exclude server-owned and sensitive fields from write DTOs.
- Map responses explicitly when exposure matters.

## Review Questions

1. What boundary does a DTO describe?
2. Why prefer classes over interfaces for Nest DTOs?
3. What does the definite-assignment marker mean?
4. Why does a typed `@Body` not validate runtime data?
5. How do create and update DTOs differ?
6. Why are query DTO properties strings today?
7. Which fields are server-owned?
8. Why separate response DTOs from domain/storage models?

## Completion Checklist

- [ ] Request DTOs are runtime classes.
- [ ] Create, update, and query DTOs are separate.
- [ ] Domain and transport models are distinguished.
- [ ] Server-owned fields are excluded from writes.
- [ ] Response mapping controls public exposure.
- [ ] Invalid runtime input is demonstrated before validation.
- [ ] All exercises and review questions are complete.

## Official References

- Nest controller request payloads: https://docs.nestjs.com/controllers#request-payloads
- Nest validation overview: https://docs.nestjs.com/techniques/validation
- Nest OpenAPI types and parameters: https://docs.nestjs.com/openapi/types-and-parameters

## What to Send for Review

Send all DTOs, domain type, response mapper, controller usage, invalid-runtime demonstrations, exercises, and review answers. Next: **Day 61 — Validation with `class-validator` and `ValidationPipe`**.

# Day 62 — Pipes and Transformation

> Core lesson: about 60–90 minutes. Validate or transform handler arguments at the point where Nest resolves them.

## Learning Objectives

You will learn to:

- explain the two responsibilities of a pipe;
- use built-in parse pipes for route and query values;
- bind pipes at parameter, route, controller, and global levels;
- create a small custom pipe;
- distinguish transformation from unsafe coercion;
- choose pipe placement deliberately.

## 0–15 Minutes — What Pipes Do

A pipe receives a value before the controller handler and can:

1. transform it into another value;
2. validate it and throw an exception if unacceptable.

If a pipe throws, the controller method does not run. `ValidationPipe` from Day 61 is one pipe; Nest also includes focused parsing pipes.

Use pipes for transport argument rules. Authorization belongs in guards, and state-dependent business rules belong in providers.

## 15–32 Minutes — Route Parameter Pipes

```ts
import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";

@Controller("posts")
export class PostsController {
  @Get(":postId")
  findOne(@Param("postId", ParseIntPipe) postId: number) {
    return { data: { postId } };
  }
}
```

`ParseIntPipe` changes a valid integer string into a number and throws a 400 response for invalid text. The TypeScript `number` now describes the value delivered after the pipe, not the raw URL.

Other built-ins include:

```ts
@Param("id", ParseUUIDPipe) id: string
@Query("published", ParseBoolPipe) published: boolean
@Query("ids", new ParseArrayPipe({ items: Number, separator: "," })) ids: number[]
```

Use the parser matching the contract. Do not use UUID validation for numeric identifiers merely because the pipe exists.

## 32–45 Minutes — Defaults and Query Values

```ts
import { DefaultValuePipe, ParseIntPipe, Query } from "@nestjs/common";

@Get()
findAll(
  @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  return { data: [], meta: { page, limit } };
}
```

Pipes on one parameter run in the declared sequence. Defaults apply only when the value is missing; they do not repair malformed supplied input.

Parsing an integer does not prove it is positive or within a safe page-size limit. Add a DTO validator or custom pipe for bounds.

## 45–60 Minutes — A Custom Positive Integer Pipe

```ts
import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from "@nestjs/common";

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new BadRequestException("Value must be a positive integer");
    }

    return parsed;
  }
}
```

Bind by class so Nest can instantiate it:

```ts
findOne(@Param("postId", PositiveIntPipe) postId: number) {}
```

Use `ArgumentMetadata` when behavior needs to depend on whether the value came from a body, query, param, or custom decorator. Most small pipes should remain focused and avoid hidden context-dependent behavior.

## 60–70 Minutes — Transformation Choices

An explicit trim pipe can normalize text:

```ts
@Injectable()
export class TrimPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (typeof value !== "string") {
      throw new BadRequestException("Value must be text");
    }

    return value.trim();
  }
}
```

Normalize only when the API contract promises it. Do not transform arbitrary invalid values into something acceptable. In particular, `Boolean("false")` is true; use `ParseBoolPipe` or exact DTO validation.

## 70–78 Minutes — Binding Scope

- parameter-scoped pipes affect one argument;
- route-scoped pipes affect arguments for one handler;
- controller-scoped pipes affect a controller;
- global pipes affect the application.

Keep the global `ValidationPipe` for consistent DTO enforcement. Prefer narrow parameter pipes for identifier parsing. Broad custom global transformation can surprise unrelated endpoints.

## Guided Practice — Typed Posts Parameters

1. Parse `postId` as a positive safe integer.
2. parse page and limit with defaults;
3. enforce page ≥ 1 and limit from 1–100;
4. parse an optional published Boolean;
5. parse comma-separated tag IDs;
6. reject malformed, repeated, and out-of-range values;
7. use a trim pipe only on a documented text query;
8. verify rejected requests never enter the controller.

## Independent Exercises

1. Compare `Number`, `parseInt`, and `ParseIntPipe` on `12x`.
2. Test missing and malformed values with `DefaultValuePipe`.
3. Parse valid and invalid UUIDs.
4. Parse `true`, `false`, `1`, `0`, and empty Boolean queries.
5. Build a bounded page-size pipe.
6. Inspect `ArgumentMetadata` in a disposable pipe.
7. Bind one pipe at two scopes and compare behavior.
8. Explain why coercion can hide client bugs.

## Common Mistakes and Debugging Advice

- Raw route and query values are strings.
- Parsing type and validating range are separate steps.
- Defaults do not replace malformed supplied values.
- Keep authorization out of pipes.
- Use exact Boolean parsing.
- A pipe exception prevents controller execution.
- Prefer narrow bindings for specialized transformations.
- Make normalization part of the documented contract.

## Review Questions

1. What two jobs can a pipe perform?
2. What does `ParseIntPipe` deliver to the handler?
3. Why is integer parsing insufficient for pagination?
4. How does `DefaultValuePipe` behave?
5. When should a custom pipe use metadata?
6. Why is Boolean coercion dangerous?
7. What pipe binding scopes exist?
8. Why keep custom transformations narrow?

## Completion Checklist

- [ ] IDs reach handlers as validated numbers.
- [ ] Pagination defaults and bounds are enforced.
- [ ] Boolean and array queries parse predictably.
- [ ] A custom pipe is implemented and tested.
- [ ] Invalid inputs skip controller execution.
- [ ] Pipe scopes are chosen deliberately.
- [ ] All exercises and review questions are complete.

## Official References

- Nest pipes: https://docs.nestjs.com/pipes
- Nest validation and transformation: https://docs.nestjs.com/techniques/validation
- Nest controllers: https://docs.nestjs.com/controllers

## What to Send for Review

Send controller parameters, custom pipes, valid/invalid output, scope comparison, coercion explanation, exercises, and review answers. Next: **Day 63 — Exception Filters and Consistent Errors**.

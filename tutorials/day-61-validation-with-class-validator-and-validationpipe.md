# Day 61 — Validation with `class-validator` and `ValidationPipe`

> Core lesson: about 60–90 minutes. Make DTO rules enforceable at runtime and reject unexpected input before controllers run.

## Learning Objectives

You will learn to:

- add declarative validation rules to DTO classes;
- register `ValidationPipe` globally;
- whitelist or reject unknown properties;
- distinguish validation from TypeScript typing;
- validate create and update inputs differently;
- test several invalid fields in one request.

## Setup

Install the packages used by Nest's class-based validation path:

```bash
cd /home/nahid/Projects/Learning/app/practice/day-54
npm install class-validator class-transformer
```

Nest also supports Standard Schema libraries, but this course continues with DTO classes and `class-validator` because they connect directly to the upcoming Nest and Swagger lessons.

## 0–20 Minutes — Decorate a DTO

Update `src/posts/dto/create-post.dto.ts`:

```ts
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreatePostDto {
  @IsString()
  @Length(3, 120)
  title!: string;

  @IsString()
  @Length(10, 50_000)
  body!: string;

  @IsBoolean()
  published!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];
}
```

Decorator order does not replace careful rule design. `@IsOptional()` skips the remaining validators when the value is `null` or `undefined`; that means this example permits `categoryId: null` intentionally.

`@IsBoolean()` rejects the string `"false"`. Validation should not silently reinterpret surprising client input.

## 20–35 Minutes — Register the Global Pipe

In `main.ts`, before `listen`:

```ts
import { ValidationPipe } from "@nestjs/common";

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: false,
  }),
);
```

- `whitelist` considers properties that have validation metadata;
- `forbidNonWhitelisted` rejects unexpected properties instead of silently stripping them;
- `transform` returns class instances and enables explicit transformations;
- `stopAtFirstError: false` allows multiple useful failures to be collected.

The pipe runs before the controller method. Invalid input never reaches the handler.

## 35–48 Minutes — Test the Boundary

```bash
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Valid title","body":"Long enough body text","published":false}'

curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"x","body":4,"published":"false","authorId":99}'
```

Inspect the default error shape and status. It is useful but does not yet match the course-wide error envelope; Day 63 will translate it consistently.

Try `{}`, `null`, an array, missing properties, wrong types, boundary lengths, duplicate tag IDs, and more than 20 tag IDs.

## 48–62 Minutes — Update DTO Rules

PATCH fields are optional, but supplied values still require full validation:

```ts
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @Length(3, 120)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(10, 50_000)
  body?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
```

This accepts `{}` because no supplied property violates a decorator. Rejecting an empty PATCH requires an object-level rule or an explicit check. Record that as a separate contract requirement rather than assuming optional decorators enforce it.

Mapped types can derive update DTOs, but write the first one manually so the changed semantics are visible.

## 62–72 Minutes — Validation Is Not Every Rule

DTO validation should cover transport-level shape and local constraints. It should not query the database for:

- unique slug conflicts;
- category existence;
- ownership;
- permission to publish;
- current resource state.

Those rules belong in providers and database constraints. A database uniqueness constraint remains necessary because concurrent requests can both pass an earlier check.

## Guided Practice — Validate Posts Input

1. Decorate create and update DTOs.
2. Register one global `ValidationPipe`.
3. reject unknown fields;
4. test exact Boolean behavior;
5. validate each array element and bound array length;
6. test minimum/maximum text boundaries;
7. demonstrate that `{}` passes the update DTO;
8. list business rules deliberately left for services.

## Independent Exercises

1. Test `null`, arrays, numbers, and strings as the complete body.
2. Test title lengths 2, 3, 120, and 121.
3. Send duplicate, fractional, negative, and excessive tag IDs.
4. Compare stripping unknown fields with rejecting them.
5. Add a create-comment DTO.
6. Add an enum-backed status rule.
7. Confirm the controller is not called for invalid input.
8. Explain why validation cannot guarantee slug uniqueness.

## Common Mistakes and Debugging Advice

- DTO types alone do not validate runtime values.
- Install both `class-validator` and `class-transformer`.
- Register the pipe before expecting decorators to run.
- `@IsOptional` permits null as well as undefined.
- Validate array contents with `{ each: true }`.
- Transformation should be explicit, not surprising coercion.
- Empty PATCH needs its own rule.
- Database and authorization rules do not belong in DTO decorators.

## Review Questions

1. What activates DTO validation?
2. How do whitelist and forbid-non-whitelisted differ?
3. Why enable transformation carefully?
4. What does `@IsOptional` skip?
5. How are array elements validated?
6. Why can an empty update pass?
7. Which rules belong in services?
8. Why do database constraints remain necessary?

## Completion Checklist

- [ ] Global class-based validation is active.
- [ ] Create and update rules differ correctly.
- [ ] Unknown fields are rejected.
- [ ] Arrays and individual elements are bounded.
- [ ] Boundary and multi-error requests are tested.
- [ ] Business rules remain outside DTO validation.
- [ ] All exercises and review questions are complete.

## Official References

- Nest validation: https://docs.nestjs.com/techniques/validation
- class-validator decorators: https://github.com/typestack/class-validator
- class-transformer: https://github.com/typestack/class-transformer

## What to Send for Review

Send DTOs, global pipe configuration, complete request matrix, default validation responses, empty-PATCH explanation, exercises, and review answers. Next: **Day 62 — Pipes and Transformation**.

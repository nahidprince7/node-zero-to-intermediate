# Day 23 — Narrowing and Type Guards

> Core lesson: about 60 minutes, followed by exercises. The goal is to prove types with runtime checks, not to silence the compiler with assertions.

## Learning Objectives

You will learn to:

- explain control-flow narrowing;
- narrow unions with `typeof`, equality, truthiness, `in`, and `instanceof`;
- write reusable user-defined type guards;
- model related states with discriminated unions;
- check discriminated unions exhaustively;
- safely begin validating `unknown` external data.

## Prerequisites and Setup

Complete Day 22, then continue its project or create a Day 23 project with the same strict configuration:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-23/src
cd practice/day-23
code .
```

If starting fresh, repeat Day 19's TypeScript project setup.

## 0–15 Minutes — Control-Flow Narrowing

TypeScript only allows operations shared by every member of a union until your code proves which member it has. Create `src/narrowing.ts`:

```ts
function formatId(id: number | string): string {
  if (typeof id === "number") {
    return `#${id.toFixed(0)}`;
  }

  return id.toUpperCase();
}
```

Inside the first branch, `id` is a number. After that branch returns, only the string possibility remains. TypeScript follows control flow rather than permanently changing the declared type.

The main `typeof` results useful for narrowing are `"string"`, `"number"`, `"boolean"`, `"bigint"`, `"symbol"`, `"undefined"`, `"function"`, and `"object"`. Remember that JavaScript reports `typeof null` as `"object"`.

Equality checks narrow too:

```ts
function titleOrFallback(title: string | null): string {
  if (title === null) {
    return "Untitled";
  }

  return title.toUpperCase();
}
```

Truthiness can be concise, but it also treats `""`, `0`, `false`, `null`, and `undefined` as falsy. Use an explicit check when an empty string or zero is valid data.

## 15–27 Minutes — `in` and `instanceof`

Use `in` to check for a property:

```ts
interface Author {
  name: string;
  bio: string;
}

interface Administrator {
  name: string;
  permissions: string[];
}

function printPerson(person: Author | Administrator): void {
  if ("permissions" in person) {
    console.log(person.permissions.join(", "));
  } else {
    console.log(person.bio);
  }
}
```

Use `instanceof` for values created by a class or built-in constructor:

```ts
function formatFailure(error: Error | string): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return error;
}
```

`instanceof` checks the runtime prototype chain. It does not work with interfaces because interfaces do not exist at runtime. Data parsed from JSON is not automatically an instance of a class even if its fields look similar.

## 27–40 Minutes — User-Defined Type Guards

External input should begin as `unknown`, which requires evidence before use. Do not use `any`, because it disables these checks.

Create `src/guards.ts`:

```ts
interface ApiPost {
  id: number;
  title: string;
  published: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiPost(value: unknown): value is ApiPost {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isInteger(value.id) &&
    typeof value.title === "string" &&
    typeof value.published === "boolean"
  );
}

function parsePost(value: unknown): ApiPost {
  if (!isApiPost(value)) {
    throw new Error("Invalid post data");
  }

  return value;
}
```

The return type `value is ApiPost` is a type predicate. It tells TypeScript what a `true` result proves. The implementation must honestly check that claim; TypeScript does not verify that the guard is logically complete.

Validate arrays as well as their members:

```ts
function isApiPostArray(value: unknown): value is ApiPost[] {
  return Array.isArray(value) && value.every(isApiPost);
}
```

This is an introduction to runtime validation, not a complete validation library. Real APIs often need limits, formats, nested validation, and useful error details.

## 40–53 Minutes — Discriminated Unions

A shared literal property can identify each valid shape:

```ts
interface DraftPost {
  status: "draft";
  title: string;
  lastSavedAt: Date;
}

interface PublishedPost {
  status: "published";
  title: string;
  publishedAt: Date;
  slug: string;
}

interface ArchivedPost {
  status: "archived";
  title: string;
  archivedAt: Date;
}

type PostState = DraftPost | PublishedPost | ArchivedPost;

function describePost(post: PostState): string {
  switch (post.status) {
    case "draft":
      return `${post.title} was saved at ${post.lastSavedAt.toISOString()}`;
    case "published":
      return `${post.title} is live at /posts/${post.slug}`;
    case "archived":
      return `${post.title} was archived at ${post.archivedAt.toISOString()}`;
  }
}
```

This model prevents impossible combinations such as a draft that claims to have a publication slug but has no publication date. The `status` property is the discriminant.

## 53–60 Minutes — Exhaustive Checks

An exhaustive check makes TypeScript report a missing branch when the union grows:

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${JSON.stringify(value)}`);
}

function getStatusLabel(post: PostState): string {
  switch (post.status) {
    case "draft":
      return "Draft";
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    default:
      return assertNever(post);
  }
}
```

After all cases are handled, `post` narrows to `never` in `default`. Add a `ScheduledPost` member without adding a case; the call to `assertNever` should fail compilation. Then implement the missing branch.

The thrown error is still useful at runtime if unvalidated JavaScript somehow supplies an unexpected value.

## Guided Practice — Safe Blog Input

Create `src/blog.ts` that:

1. receives a value as `unknown`;
2. proves it is a non-null object;
3. validates an integer ID, non-empty title, and a known status;
4. returns a typed post or throws a clear error;
5. models draft, published, and archived posts as a discriminated union;
6. formats every state with an exhaustive `switch`;
7. tests valid data, `null`, a missing field, a wrong field type, and an unknown status.

Do not use `as Post`, non-null assertions, or `any` in the solution.

## Independent Exercises

1. Narrow `string | number | null` using explicit checks and format every case.
2. Use `in` to distinguish two object shapes with different capabilities.
3. Use `instanceof` to distinguish `Date`, `Error`, and string inputs.
4. Write a guard for a comment object received as `unknown`.
5. Write a guard for an array of valid comments.
6. Model loading, success, and error states as a discriminated union.
7. Render every loading state with an exhaustive `switch`.
8. Add a new state and confirm the exhaustive check finds the missing case.

## Common Mistakes and Debugging Advice

- Check `typeof value === "object"` together with `value !== null`.
- Truthiness may accidentally reject valid empty strings or zero values.
- Interfaces cannot be used with `instanceof`; they have no runtime value.
- A type predicate is a promise made by its implementation, so validate every required field.
- Validate the array container and every array member.
- Prefer `unknown` for untrusted input; `any` removes the compiler's help.
- A type assertion is not runtime validation.
- Use one stable literal discriminant shared by every member of a state union.

## Review Questions

1. What is narrowing?
2. How does an early return help narrow a union?
3. Why must a `typeof "object"` check also reject `null`?
4. When should you use `in` versus `instanceof`?
5. What does `value is ApiPost` mean?
6. Why should external data begin as `unknown`?
7. What makes a union discriminated?
8. How does `never` reveal a missing case?

## Completion Checklist

- [ ] Strict compilation succeeds without `any` or unsafe assertions.
- [ ] Built-in narrowing techniques are demonstrated.
- [ ] Single-object and array guards validate `unknown` input.
- [ ] Blog states form a discriminated union.
- [ ] Every state is handled exhaustively.
- [ ] Invalid runtime examples fail clearly.
- [ ] All eight exercises and review questions are complete.

## What to Send for Review

Send all `.ts` source, build output, valid and invalid runtime output, the deliberate exhaustive-check diagnostic and fix, and review answers. Next: **Day 24 ↻ — Convert the Day 12 JavaScript Project to TypeScript**.

# Day 27 — Generics and Utility Types

> Core lesson: about 60 minutes, followed by exercises. Generics preserve relationships between types; they are not a substitute for clear domain modeling.

## Learning Objectives

You will learn to:

- write generic functions, interfaces, and classes;
- infer and explicitly provide type arguments;
- constrain a type parameter;
- use `keyof` safely;
- apply `Partial`, `Pick`, `Omit`, and `Record`;
- recognize shallow utility-type behavior.

## Setup

Continue the strict TypeScript project or create `practice/day-27/src` using Day 19's configuration.

## 0–15 Minutes — Preserve a Type Relationship

Without generics, a reusable function may lose information:

```ts
function firstUnknown(items: unknown[]): unknown {
  return items[0];
}
```

Create `src/generics.ts`:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstTitle = first(["Node", "TypeScript"]);
const firstId = first([10, 20, 30]);
```

`T` is a type parameter. Each call connects the input element type to the return type. TypeScript usually infers it, but it can be explicit:

```ts
const emptyResult = first<string>([]);
```

`noUncheckedIndexedAccess` is why the function returns `T | undefined`.

## 15–27 Minutes — Generic Data Shapes

```ts
interface ApiResponse<T> {
  data: T;
  requestId: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  status: "draft" | "published";
}

const response: ApiResponse<Post> = {
  data: {
    id: 1,
    title: "Generics",
    body: "One response shape, many data types.",
    status: "published",
  },
  requestId: "req-27",
};
```

The same wrapper can hold `Post[]`, `User`, or another known type without losing its shape.

A generic class can preserve a collection type:

```ts
class Store<T> {
  private readonly items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): readonly T[] {
    return this.items;
  }
}
```

## 27–40 Minutes — Constraints and `keyof`

Sometimes a generic accepts only values with required structure:

```ts
interface HasId {
  id: number;
}

function findById<T extends HasId>(
  items: T[],
  id: number,
): T | undefined {
  return items.find((item) => item.id === id);
}
```

The constraint guarantees `.id` exists while preserving the rest of `T`.

Use `keyof` to connect an object and one of its keys:

```ts
function getProperty<T extends object, K extends keyof T>(
  object: T,
  key: K,
): T[K] {
  return object[key];
}

const title = getProperty(response.data, "title");
// getProperty(response.data, "email"); // Type error
```

Avoid adding generic parameters that express no useful relationship. A function that only logs a value can accept `unknown` instead of inventing `<T>`.

## 40–54 Minutes — Built-In Utility Types

Starting model:

```ts
interface BlogPost {
  id: number;
  title: string;
  body: string;
  status: "draft" | "published";
  authorId: number;
}
```

### `Partial<T>`

Makes every top-level property optional:

```ts
type PostChanges = Partial<Pick<BlogPost, "title" | "body" | "status">>;

function updatePost(post: BlogPost, changes: PostChanges): BlogPost {
  return { ...post, ...changes };
}
```

Restricting the keys prevents callers from changing `id` or `authorId`.

### `Pick<T, K>` and `Omit<T, K>`

```ts
type PostSummary = Pick<BlogPost, "id" | "title" | "status">;
type CreatePostInput = Omit<BlogPost, "id">;
```

`Pick` keeps named keys. `Omit` removes named keys.

### `Record<K, V>`

```ts
type PostStatus = BlogPost["status"];
type StatusCounts = Record<PostStatus, number>;

const counts: StatusCounts = {
  draft: 0,
  published: 0,
};
```

Every key in the union is required. This is valuable when missing a case would be a bug.

## 54–60 Minutes — Shallow Transformations

Utility types affect the top level unless you deliberately define a recursive type:

```ts
interface Profile {
  name: string;
  address: {
    city: string;
    country: string;
  };
}

type ProfileChanges = Partial<Profile>;
```

`address` may be absent, but if present it still needs both `city` and `country`. Do not assume `Partial` deeply makes nested fields optional.

Utility types transform compile-time contracts. They do not validate runtime input or decide which fields an API should permit; that remains a domain and security decision.

## Guided Practice — Typed Repository

1. Define a `HasId` constraint.
2. Create a generic in-memory `Repository<T extends HasId>`.
3. Add `create`, `findAll`, and `findById` methods.
4. Return readonly arrays where mutation should be prevented.
5. Define `CreatePostInput`, `PostSummary`, and restricted `PostChanges`.
6. Track counts with `Record<PostStatus, number>`.

## Independent Exercises

1. Write generic `last` and `wrapInArray` functions.
2. Build `Result<T>` as a discriminated union for success or failure.
3. Use a constraint requiring a `createdAt` property.
4. Write a safe `getProperty` variation.
5. Derive create, update, and public-output models from one user model.
6. Prove that `Partial` is shallow with a nested object.
7. Add a status to a union and observe how `Record` finds the missing key.
8. Identify one needless generic and simplify it.

## Common Mistakes and Debugging Advice

- Do not replace a useful relationship with `unknown` or `any`.
- A generic is valuable when multiple positions share type information.
- `T extends X` constrains `T`; it does not make `T` exactly `X`.
- `keyof` produces allowed property keys, not runtime values.
- `Partial` can make protected fields writable if applied too broadly.
- Utility types are shallow and compile-time only.
- Prefer readable domain aliases over deeply nested utility expressions.

## Review Questions

1. What relationship does `first<T>` preserve?
2. When must a type argument be explicit?
3. What does a generic constraint guarantee?
4. How do `keyof` and indexed access types work together?
5. What does each required utility type produce?
6. Why restrict `PostChanges` before applying `Partial`?
7. Is `Partial` recursive?
8. When is a generic unnecessary?

## Completion Checklist

- [ ] Generic functions, interfaces, and classes compile.
- [ ] Constraints and `keyof` prevent invalid access.
- [ ] All four required utility types are demonstrated.
- [ ] Update input cannot change protected identity fields.
- [ ] Shallow behavior is understood.
- [ ] All exercises and review questions are complete.

## What to Send for Review

Send all `.ts` source, build output, deliberate constraint/key errors with fixes, and review answers. Next: **Day 28 — Project Tooling: ESLint, Prettier, Watch Mode, and npm Scripts**.

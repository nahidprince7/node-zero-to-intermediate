# Day 21 — Interfaces and Type Aliases

> Core lesson: about 60 minutes, followed by exercises. Continue using strict mode and avoid `any`.

## Learning Objectives

You will learn to:

- give reusable names to object shapes;
- define and extend interfaces;
- create type aliases for objects and other kinds of types;
- understand structural typing;
- choose between an interface and a type alias;
- use `readonly` properties to protect values from reassignment.

## Prerequisites and Setup

Complete Day 20, then continue its project or create a Day 21 project with the same strict TypeScript configuration:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-21/src
cd practice/day-21
code .
```

If this is a fresh directory, repeat Day 19's TypeScript installation, scripts, and `tsconfig.json` setup.

## 0–15 Minutes — Reusable Object Shapes

Day 20 used inline object types. Repeating them makes code harder to read and easier to change incorrectly:

```ts
function printAuthor(author: { id: number; name: string }): void {
  console.log(`${author.id}: ${author.name}`);
}

function renameAuthor(
  author: { id: number; name: string },
  name: string,
): { id: number; name: string } {
  return { ...author, name };
}
```

Create `src/interfaces.ts` and name the shape once:

```ts
interface Author {
  id: number;
  name: string;
}

function printAuthor(author: Author): void {
  console.log(`${author.id}: ${author.name}`);
}

function renameAuthor(author: Author, name: string): Author {
  return { ...author, name };
}

const author: Author = { id: 1, name: "Nahid" };
printAuthor(renameAuthor(author, "N. Hasan"));
```

An interface is a TypeScript contract for a shape. It emits no JavaScript and performs no runtime validation.

## 15–27 Minutes — Extending Interfaces and `readonly`

Interfaces can build on other interfaces:

```ts
interface Entity {
  readonly id: number;
  createdAt: Date;
}

interface Post extends Entity {
  title: string;
  body: string;
  published: boolean;
}

const post: Post = {
  id: 10,
  createdAt: new Date(),
  title: "Reusable Types",
  body: "Interfaces describe object shapes.",
  published: false,
};

post.title = "Interfaces and Type Aliases";
// post.id = 11; // Error: id is readonly
```

`readonly` prevents reassignment through this TypeScript type. It does not freeze the runtime object. Code outside TypeScript, or code that receives the object through a mutable type, can still modify it.

An interface can extend more than one compatible interface:

```ts
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Publishable {
  published: boolean;
}

interface Article extends Timestamped, Publishable {
  title: string;
}
```

## 27–40 Minutes — Type Aliases

Create `src/aliases.ts`:

```ts
type Comment = {
  readonly id: number;
  body: string;
  authorName: string;
};

const comment: Comment = {
  id: 1,
  body: "Clear explanation.",
  authorName: "Amina",
};
```

For object shapes, this looks much like an interface. A type alias can also name types that are not object declarations:

```ts
type Identifier = string | number;
type Coordinates = [number, number];
type Formatter = (title: string) => string;

const postId: Identifier = "post-21";
const location: Coordinates = [23.81, 90.41];
const uppercase: Formatter = (title) => title.toUpperCase();
```

Unions are covered on Day 22. For now, notice that a type alias can name a union, tuple, primitive, function signature, or object shape. An interface primarily names an object-like contract.

Type aliases combine object types with intersections:

```ts
type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: number;
  name: string;
} & WithTimestamps;
```

An intersection requires all combined members. Do not confuse `&` in a type with a runtime JavaScript operation.

## 40–50 Minutes — Structural Typing

TypeScript usually checks structure, not the name used to declare a type:

```ts
interface NamedAuthor {
  id: number;
  name: string;
}

type NamedUser = {
  id: number;
  name: string;
};

const user: NamedUser = { id: 2, name: "Rafi" };
const anotherAuthor: NamedAuthor = user;
```

The assignment works because the required members are compatible.

Objects may have more properties than the receiving type requires:

```ts
const detailedUser = { id: 3, name: "Maya", email: "maya@example.com" };
printAuthor(detailedUser);
```

But a fresh object literal receives an excess-property check:

```ts
// printAuthor({ id: 3, name: "Maya", email: "maya@example.com" });
```

That check catches likely spelling mistakes and accidental fields. Do not bypass it with a type assertion; model the intended data instead.

## 50–60 Minutes — Which One Should You Use?

Use an interface when you are describing an object-shaped public contract, especially one that may be extended. Use a type alias when you need a union, tuple, function type, mapped type, or a composition that an interface cannot express clearly.

Both are valid for ordinary object shapes. Consistency and clarity matter more than treating one as universally better.

One special difference is declaration merging:

```ts
interface RequestContext {
  requestId: string;
}

interface RequestContext {
  userId: number;
}

const context: RequestContext = {
  requestId: "req-1",
  userId: 42,
};
```

Interfaces with the same name merge. Type aliases cannot be redeclared. Merging is useful for some library augmentation, but accidental merging can confuse application code, so do not use it casually.

## Guided Practice — Blog Models

Create `src/blog.ts`:

1. Define an `Entity` interface with a `readonly id` and `createdAt`.
2. Define an `Author` interface that extends `Entity`.
3. Define a `Post` interface with an author, title, body, tags, and publication status.
4. Create a `PostSummary` type containing an ID, title, and author name.
5. Write `summarizePost(post: Post): PostSummary`.
6. Create two valid posts, summarize them with `map`, and print the result.

Keep the models focused. Do not add optional properties yet; Day 22 covers their exact behavior.

## Independent Exercises

1. Replace Day 20's repeated inline post shape with one named interface.
2. Create `User`, `Author`, and `Admin` interfaces using sensible extension.
3. Create aliases for an identifier, a coordinate tuple, and a title formatter.
4. Combine two object types with an intersection and construct a valid value.
5. Demonstrate structural compatibility using two differently named types.
6. Trigger an excess-property error, explain it, and fix the model or call.
7. Mark an ID as `readonly`, attempt reassignment, and record the diagnostic.

## Common Mistakes and Debugging Advice

- Interfaces and aliases disappear when TypeScript compiles.
- `readonly` is compile-time protection, not runtime freezing.
- An intersection needs all compatible members; conflicting members can create impossible types.
- Do not add type assertions merely to silence excess-property checks.
- Avoid duplicating nearly identical models when extension or composition expresses the relationship.
- Choose names from the domain, such as `PostSummary`, rather than vague names such as `Data`.

## Review Questions

1. What problem does a named object type solve?
2. How does an interface extend another interface?
3. What kinds of types can an alias name?
4. What does structural typing mean?
5. Why might a fresh object literal produce an excess-property error?
6. Does `readonly` freeze an object at runtime?
7. What is declaration merging?
8. When would a type alias be required instead of an interface?

## Completion Checklist

- [ ] Strict compilation succeeds without `any`.
- [ ] Blog object shapes use reusable names.
- [ ] Interface extension and type intersections both compile.
- [ ] Structural compatibility is demonstrated and explained.
- [ ] `readonly` and excess-property diagnostics are understood.
- [ ] All seven exercises and review questions are complete.

## What to Send for Review

Send all `.ts` source, build output, the two deliberate diagnostics with fixes, and review answers. Next: **Day 22 — Unions, Literal Types, Optional Properties, and Enums**.

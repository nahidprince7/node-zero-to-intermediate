# Day 22 — Unions, Literal Types, Optional Properties, and Enums

> Core lesson: about 60 minutes, followed by exercises. Keep `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` enabled.

## Learning Objectives

You will learn to:

- model a value that can have more than one type;
- restrict values with string and numeric literal types;
- create reusable finite choices from `as const` data;
- distinguish an optional property from a property containing `undefined`;
- define and use a string enum;
- choose between literal unions and enums deliberately.

## Prerequisites and Setup

Complete Day 21, then continue its project or create a Day 22 project with the same strict configuration:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-22/src
cd practice/day-22
code .
```

If starting fresh, repeat Day 19's TypeScript project setup.

## 0–14 Minutes — Union Types

A union allows any one of its member types. Create `src/unions.ts`:

```ts
type Identifier = number | string;

function printIdentifier(id: Identifier): void {
  console.log(`ID: ${id}`);
}

printIdentifier(21);
printIdentifier("post-21");
// printIdentifier(true); // Type error
```

The `|` means “or” at the type level. A function can return a union too:

```ts
interface Post {
  id: number;
  title: string;
}

const posts: Post[] = [{ id: 1, title: "Unions" }];

function findPost(id: number): Post | undefined {
  return posts.find((post) => post.id === id);
}
```

Before using the result as a `Post`, the caller must prove it is not `undefined`. Day 23 studies this process, called narrowing.

Use unions when each member represents a genuine possible state. Do not add `undefined` or `null` merely to make an error disappear.

## 14–28 Minutes — Literal Types

A literal type permits one exact value:

```ts
type PublicationStatus = "draft" | "published" | "archived";

interface Article {
  title: string;
  status: PublicationStatus;
}

const article: Article = {
  title: "Model Valid States",
  status: "draft",
};

// article.status = "visible"; // Type error
article.status = "published";
```

This is safer than a general `string`, which would allow misspellings and unsupported states.

Numeric and boolean literals also exist:

```ts
type Rating = 1 | 2 | 3 | 4 | 5;
type FeatureFlag = true;
```

### Derive a union from runtime data

Sometimes the choices must also exist at runtime:

```ts
const roles = ["reader", "author", "admin"] as const;
type Role = (typeof roles)[number];

function isKnownRole(value: string): value is Role {
  return roles.some((role) => role === value);
}
```

`as const` preserves the exact literals and makes the tuple readonly. `typeof roles` obtains its TypeScript type, and `[number]` obtains the type of any indexed member. The guard's behavior is explored on Day 23.

## 28–42 Minutes — Optional Properties

Create `src/optional-properties.ts`:

```ts
interface PostDraft {
  title: string;
  excerpt?: string;
}

const shortDraft: PostDraft = { title: "Optional Data" };
const detailedDraft: PostDraft = {
  title: "Optional Data",
  excerpt: "Not every draft has an excerpt.",
};
```

The `?` means the property may be absent. Reading it can therefore produce `undefined`:

```ts
function printExcerpt(draft: PostDraft): void {
  if (draft.excerpt !== undefined) {
    console.log(draft.excerpt.toUpperCase());
  } else {
    console.log("No excerpt");
  }
}
```

With `exactOptionalPropertyTypes: true`, absence is not automatically the same as explicitly storing `undefined`:

```ts
// const invalidDraft: PostDraft = {
//   title: "Exact Optional Properties",
//   excerpt: undefined,
// };
```

If explicit `undefined` is part of the domain, say so:

```ts
interface EditableDraft {
  title: string;
  excerpt?: string | undefined;
}
```

Compare these contracts:

```ts
interface MayBeAbsent {
  note?: string;
}

interface AlwaysPresent {
  note: string | undefined;
}
```

The second requires a `note` key even when its value is `undefined`.

Use optional properties for genuinely optional data. Do not mark every field optional to make object construction easier.

## 42–52 Minutes — Enums

An enum creates a named set of constants and emits a runtime JavaScript object. Create `src/enums.ts`:

```ts
enum UserRole {
  Reader = "reader",
  Author = "author",
  Admin = "admin",
}

interface User {
  id: number;
  name: string;
  role: UserRole;
}

const user: User = {
  id: 1,
  name: "Nahid",
  role: UserRole.Author,
};

console.log(UserRole.Admin);
```

Prefer explicit string enum values when the strings cross logs, configuration, databases, or API boundaries. Automatically numbered enums are compact, but their numbers are less descriptive and can change accidentally when members are reordered.

An enum value is normally referenced through its enum member:

```ts
// const role: UserRole = "author"; // Not the enum member
const role: UserRole = UserRole.Author;
```

## 52–60 Minutes — Literal Union or Enum?

A literal union is lightweight and erased during compilation:

```ts
type CommentStatus = "visible" | "hidden" | "deleted";
```

An enum provides a runtime object and namespaced members:

```ts
enum CommentStatusEnum {
  Visible = "visible",
  Hidden = "hidden",
  Deleted = "deleted",
}
```

Use a literal union when you mainly need compile-time constraints and simple interoperability with strings. Use an enum when the runtime object and named member access are useful or an existing codebase consistently uses enums. A readonly object with a derived union is another useful choice when you want both runtime data and ordinary literal values:

```ts
const CommentStatus = {
  Visible: "visible",
  Hidden: "hidden",
  Deleted: "deleted",
} as const;

type CommentStatus =
  (typeof CommentStatus)[keyof typeof CommentStatus];
```

Do not mix all three styles within one small domain without a reason.

## Guided Practice — Post Workflow

Create `src/blog.ts` that:

1. defines `PostStatus` as a literal union;
2. defines `UserRole` as a string enum;
3. models a `Post` with a `number | string` ID;
4. gives `Post` an optional excerpt and optional publication date;
5. creates valid draft and published examples;
6. prints a label for each status;
7. deliberately tries two invalid states, records the diagnostics, and fixes them.

If a published post must always have a publication date while a draft must never have one, a few optional properties cannot express that relationship precisely. Day 23 will introduce discriminated unions for state-specific shapes.

## Independent Exercises

1. Create literal unions for blog roles, post statuses, and comment visibility.
2. Write a function accepting `string | number` and observe which operations are unsafe before narrowing.
3. Model a profile with two genuinely optional properties.
4. Demonstrate the difference between `property?: string` and `property: string | undefined`.
5. Create a string enum for notification channel and use all of its members.
6. Recreate that enum as a readonly object plus a derived union.
7. Explain which representation you prefer for each model and why.

## Common Mistakes and Debugging Advice

- A union permits only its listed members; it does not make every operation valid on every member.
- Prefer literal unions over unrestricted strings for finite states.
- An optional property is still possibly `undefined` when read.
- Under exact optional-property checking, absent and explicitly `undefined` are different contracts.
- String enums use member references such as `UserRole.Author`.
- Types disappear at runtime; enums and `as const` objects can provide runtime values.
- Do not use `as` assertions to force invalid external strings into a union or enum.

## Review Questions

1. What does `string | number` mean?
2. Why is a literal union safer than `string` for status?
3. What does `as const` change in the roles example?
4. What does `excerpt?: string` mean?
5. How does it differ from `excerpt: string | undefined`?
6. What JavaScript does a normal enum contribute at runtime?
7. Why prefer explicit string enum values for external data?
8. When would you choose a literal union over an enum?

## Completion Checklist

- [ ] Strict compilation succeeds without `any`.
- [ ] Union and literal types reject invalid values.
- [ ] Optional-property behavior is demonstrated accurately.
- [ ] A string enum and a readonly-object alternative both work.
- [ ] The guided post workflow is complete.
- [ ] All seven exercises and review questions are complete.

## What to Send for Review

Send all `.ts` source, build output, deliberate diagnostics with fixes, and your comparison of literals, enums, and readonly objects. Next: **Day 23 — Narrowing and Type Guards**.

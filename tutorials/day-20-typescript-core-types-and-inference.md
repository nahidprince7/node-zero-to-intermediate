# Day 20 — TypeScript Primitives, Arrays, Objects, Functions, and Inference

> Core lesson: about 60 minutes, followed by exercises. Keep `strict` mode enabled and do not use `any`.

## Learning Objectives

You will learn to:

- annotate primitive, array, and object values;
- let TypeScript infer obvious types;
- type function parameters and return values;
- describe function values;
- understand `void`, `never`, and safe indexed access at an introductory level;
- distinguish compile-time types from runtime values.

## Prerequisites and Setup

Continue the configured Day 19 project or create a copy for Day 20:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-20/src
cd practice/day-20
code .
```

If using a fresh project, repeat Day 19's local TypeScript setup and strict `tsconfig.json`.

## 0–15 Minutes — Primitives and Inference

Create `src/primitives.ts`:

```ts
const courseName: string = "Node.js Backend";
const lessonNumber: number = 20;
const isComplete: boolean = false;

console.log(courseName, lessonNumber, isComplete);
```

TypeScript can infer obvious types:

```ts
const studentName = "Nahid";
const completedLessons = 19;
const isLearning = true;
```

Hover over each variable in VS Code. The inferred types are already useful, so avoid noisy annotations when the initializer makes the type obvious.

Inference prevents incompatible reassignment:

```ts
let score = 10;
score = 20;
// score = "twenty"; // Type error
```

`const` with a primitive may infer a more specific literal type, but today's focus is using that inference rather than naming literal types manually.

## 15–28 Minutes — Arrays

Create `src/arrays.ts`:

```ts
const titles: string[] = ["Node", "TypeScript"];
const views: Array<number> = [100, 250, 75];
const publicationStates: boolean[] = [true, false, true];

titles.push("NestJS");
// titles.push(42); // Type error
```

`string[]` and `Array<string>` describe the same ordinary array type. Prefer one consistent style.

Inference works here too:

```ts
const roles = ["admin", "author", "reader"];
```

With `noUncheckedIndexedAccess`, an indexed item may be missing:

```ts
const firstTitle = titles[0];

if (firstTitle !== undefined) {
  console.log(firstTitle.toUpperCase());
}
```

This check prevents blindly calling string methods on an out-of-range element.

## 28–40 Minutes — Object Types

Create `src/objects.ts`:

```ts
const user: {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
} = {
  id: 1,
  name: "Nahid",
  role: "author",
  isActive: true,
};

console.log(user.name);
```

The type describes required property names and value types. Missing, extra, or incompatible properties can be reported depending on context.

Nested example:

```ts
const post: {
  id: number;
  title: string;
  author: {
    id: number;
    name: string;
  };
  tags: string[];
} = {
  id: 10,
  title: "TypeScript Objects",
  author: {
    id: 1,
    name: "Nahid",
  },
  tags: ["typescript", "backend"],
};
```

Repeated inline object types become noisy. Day 21 introduces interfaces and type aliases for reusable shapes.

## 40–52 Minutes — Function Types

Create `src/functions.ts`:

```ts
function add(a: number, b: number): number {
  return a + b;
}

function createLabel(title: string, views: number): string {
  return `${title}: ${views} views`;
}

function printLabel(label: string): void {
  console.log(label);
}

console.log(add(2, 3));
printLabel(createLabel("TypeScript", 100));
```

Parameters should be typed because TypeScript cannot infer what callers are allowed to pass. Return types can often be inferred, but explicit return types are useful for exported functions and intended contracts.

`void` means callers should not expect a useful returned value.

### Function values

```ts
const operation: (a: number, b: number) => number = add;

const multiply: (a: number, b: number) => number = (a, b) => {
  return a * b;
};
```

The type before `=` describes the whole function signature. Callback parameter types can then be contextually inferred.

```ts
const numbers = [1, 2, 3];
const doubled = numbers.map((number) => number * 2);
```

TypeScript knows `number` is a number from the array and knows `doubled` is `number[]`.

## 52–60 Minutes — Return Safety

```ts
function findTitle(id: number): string | undefined {
  const posts = [
    { id: 1, title: "Node" },
    { id: 2, title: "TypeScript" },
  ];

  return posts.find((post) => post.id === id)?.title;
}
```

The union says either a string or no result. Union types are covered deeply on Day 22; today, notice that the caller must check before using string methods.

A function that always throws can return `never`:

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

`never` means normal completion is impossible. Do not annotate ordinary error-capable functions as `never`.

## Guided Practice — Typed Blog Summary

Create `src/blog.ts` with an array of typed post objects and functions that:

1. return published posts;
2. total views;
3. find a post title by ID;
4. map posts to labels;
5. print the summary with a `void` function.

First use one inline post type. Note the repetition or limitation; Day 21 will extract it into a reusable named type.

## Independent Exercises

1. Annotate and then simplify five variables using sensible inference.
2. Create typed arrays of prices, user names, and active flags.
3. Model a nested comment object inline.
4. Type rectangle and temperature functions, including returns.
5. Declare a variable that accepts a `(number, number) => number` function and assign two compatible functions.
6. Intentionally create five type errors, predict each diagnostic, then fix them without `any`.

## Common Mistakes and Debugging Advice

- Do not annotate every obvious local variable.
- Do type function parameters and important exported boundaries.
- `String`, `Number`, and `Boolean` are wrapper-object types; use lowercase `string`, `number`, and `boolean`.
- An array index can be missing.
- `void` does not mean the function cannot technically return internally; it means its useful return is not part of the contract.
- Types disappear at runtime and do not validate JSON by themselves.

## Review Questions

1. What is type inference?
2. When is an explicit annotation helpful?
3. How can you write a string array type in two ways?
4. Why might `titles[0]` include `undefined`?
5. Which parts of a function signature need types?
6. What does `void` communicate?
7. What does `never` communicate?
8. Why are repeated inline object types inconvenient?

## Completion Checklist

- [ ] Strict compilation succeeds.
- [ ] Primitive, array, object, and function examples compile.
- [ ] Indexed values are checked safely.
- [ ] Typed blog summary works.
- [ ] All six exercises are complete without `any`.
- [ ] You can explain inference versus annotation.

## What to Send for Review

Send all `.ts` source, build output, five corrected diagnostics, review answers, and where inference helped. Next: **Day 21 — Interfaces and Type Aliases**.

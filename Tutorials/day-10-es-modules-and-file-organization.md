# Day 10 — ES Modules and Clean File Organization

> Core lesson: about 60 minutes, followed by independent exercises if needed.

## Learning Objectives

You will learn to:

- explain why programs are split into modules;
- configure Node.js to use ES modules;
- create named and default exports;
- import values with correct relative paths;
- rename imports and re-export through an index module;
- organize a small program by responsibility;
- recognize common module-loading errors.

## Prerequisites and Setup

Recall functions, arrays, objects, destructuring, and array methods.

Create today's project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-10/src/utils
mkdir -p practice/day-10/src/data
cd practice/day-10
code .
```

## 0–12 Minutes — Why Modules?

A growing single file becomes difficult to navigate, test, and reuse. A module is a file with its own scope that explicitly exports selected values and imports dependencies.

Good module boundaries group one responsibility:

```text
src/
├── data/
│   └── posts.js
├── utils/
│   ├── format.js
│   └── math.js
└── app.js
```

Avoid both extremes:

- one enormous file containing everything;
- dozens of tiny files with no meaningful responsibility.

## 12–20 Minutes — Enable ES Modules

Node.js supports CommonJS and ES modules. This course will use ES modules first because their `import`/`export` syntax is standard across modern JavaScript tooling.

Create `package.json` in `practice/day-10`:

```json
{
  "name": "day-10-modules",
  "private": true,
  "type": "module"
}
```

`"type": "module"` tells Node.js to treat `.js` files in this package as ES modules. `"private": true` prevents accidental publication to npm.

Make sure JSON uses double quotes and has no trailing comma after the last property.

## 20–34 Minutes — Named Exports and Imports

Create `src/utils/math.js`:

```js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export const taxRate = 0.05;
```

Create `src/app.js`:

```js
import { add, multiply, taxRate } from "./utils/math.js";

console.log(add(10, 5));
console.log(multiply(4, 3));
console.log(taxRate);
```

From `practice/day-10`, run:

```bash
node src/app.js
```

Important details:

- named imports use braces;
- names must match the exports unless renamed;
- `./` means relative to the importing file;
- include `.js` in local Node.js ES-module import paths.

### Export after declaration

Both styles are valid:

```js
function subtract(a, b) {
  return a - b;
}

function divide(a, b) {
  return a / b;
}

export { subtract, divide };
```

### Rename an import

```js
import { add as addNumbers } from "./utils/math.js";

console.log(addNumbers(2, 3));
```

Renaming helps avoid a local naming conflict or provides context. Do not rename everything without a reason.

## 34–42 Minutes — Default Exports

Create `src/utils/create-slug.js`:

```js
export default function createSlug(title) {
  return title.toLowerCase().trim().replaceAll(" ", "-");
}
```

Import it without braces:

```js
import createSlug from "./utils/create-slug.js";

console.log(createSlug("  Learning ES Modules  "));
```

A module can have at most one default export and any number of named exports.

Default imports can technically use any local name:

```js
import makeSlug from "./utils/create-slug.js";
```

Use a clear, consistent name anyway. Named exports are often preferable when a module exposes several utilities because editor tooling can discover and rename them precisely.

## 42–52 Minutes — Organize a Small Blog Program

Create `src/data/posts.js`:

```js
export const posts = [
  { id: 1, title: "Node Basics", status: "published", views: 120 },
  { id: 2, title: "Functions", status: "draft", views: 40 },
  { id: 3, title: "Arrays", status: "published", views: 200 },
];
```

Create `src/utils/posts.js`:

```js
export function getPublishedPosts(posts) {
  return posts.filter((post) => post.status === "published");
}

export function getTotalViews(posts) {
  return posts.reduce((total, post) => total + post.views, 0);
}

export function findPostById(posts, id) {
  return posts.find((post) => post.id === id);
}
```

Replace `src/app.js`:

```js
import { posts } from "./data/posts.js";
import {
  findPostById,
  getPublishedPosts,
  getTotalViews,
} from "./utils/posts.js";
import createSlug from "./utils/create-slug.js";

const publishedPosts = getPublishedPosts(posts);

console.log(publishedPosts);
console.log(`Published views: ${getTotalViews(publishedPosts)}`);
console.log(findPostById(posts, 2));
console.log(createSlug(posts[0].title));
```

Run:

```bash
node src/app.js
```

Responsibilities are now separated:

- `data/posts.js` supplies sample data;
- `utils/posts.js` contains post-related calculations;
- `utils/create-slug.js` contains one reusable formatter;
- `app.js` coordinates the program.

## 52–60 Minutes — Re-exports and Module Behavior

Create `src/utils/index.js`:

```js
export { default as createSlug } from "./create-slug.js";
export {
  findPostById,
  getPublishedPosts,
  getTotalViews,
} from "./posts.js";
```

Now `app.js` can import utilities from one public entry point:

```js
import {
  createSlug,
  findPostById,
  getPublishedPosts,
  getTotalViews,
} from "./utils/index.js";
```

This is sometimes called a **barrel module**. Use it when it creates a clear public API; too many re-export layers can hide where code lives.

### Modules have their own scope

A variable declared in one module is not automatically global. It must be exported and imported to be used elsewhere.

### Imported bindings are not yours to reassign

Do not do this:

```js
// posts = []; // TypeError if attempted
```

Imports are read-only bindings in the importing module. An exported object or array may still be mutable, so read-only binding does not mean deeply immutable data.

## Guided Practice — Add Categories

Extend the program:

1. create `src/data/categories.js` with named export `categories`;
2. create `findCategoryById` in an appropriate utility module;
3. export it through `src/utils/index.js`;
4. import and call it from `app.js`;
5. handle a missing category without crashing.

Draw the dependency direction before coding:

```text
app.js → data modules
app.js → utility public entry point → utility modules
```

Data modules should not import `app.js`.

## Independent Exercises

1. Move rectangle calculations into `src/utils/geometry.js` using named exports.
2. Create a default-exported `formatUser` function in its own module.
3. Create a `users` data module and utilities to find active users and an admin.
4. Re-export user utilities through `src/utils/index.js`.
5. Create `src/report.js` that imports data and utilities and prints a summary.
6. Deliberately omit `.js` from one local import, read the error, then fix it.

## Common Mistakes and Debugging

- `Cannot use import statement outside a module`: verify the nearest `package.json` contains `"type": "module"`.
- `ERR_MODULE_NOT_FOUND`: check spelling, relative location, `./` or `../`, and the `.js` extension.
- “does not provide an export named”: match the exported name and default-versus-named syntax.
- JSON does not allow comments or trailing commas.
- Paths are relative to the importing file, not the terminal's current directory.
- Circular imports make initialization difficult to reason about; keep dependencies flowing in a clear direction.
- Do not put unrelated helpers into one vague `utils.js` file forever; group by responsibility as the project grows.

## Review Questions

1. Why split a program into modules?
2. What does `"type": "module"` do?
3. How do named and default exports differ?
4. Why must local Node.js ESM imports include `.js`?
5. From which location is a relative import path resolved?
6. What is a barrel module, and when can it hurt clarity?
7. Are imported object contents deeply immutable?
8. Which module should coordinate the program?

## Completion Checklist

- [ ] `node src/app.js` runs successfully.
- [ ] The program uses data, utility, and entry-point modules.
- [ ] Named, default, renamed, and re-exported imports work.
- [ ] You completed the category guided practice.
- [ ] You completed all six exercises.
- [ ] You deliberately produced and fixed a module path error.

## Next Blog Milestone

This separation is the beginning of backend architecture. NestJS later formalizes similar boundaries with modules, controllers, and providers.

## What to Send for Review

Send your Day 10 directory tree, `package.json`, module code, output, review answers, and any import error. Next: **Day 11 — Errors, Stack Traces, Console Tools, and the VS Code Debugger**.

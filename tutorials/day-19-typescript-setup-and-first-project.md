# Day 19 — Why TypeScript, `tsc`, and Your First Typed Project

> Core lesson: about 60–90 minutes. Package installation needs internet access and may make setup run long.

## Learning Objectives

You will learn to:

- explain what TypeScript adds to JavaScript;
- distinguish compile-time checking from runtime behavior;
- install TypeScript locally as a development dependency;
- understand the main parts of `tsconfig.json`;
- compile `.ts` source into `.js` output;
- run the compiled program with Node.js;
- interpret a basic TypeScript diagnostic.

## Prerequisites

Complete the JavaScript phase through Day 18. Confirm:

```bash
node --version
npm --version
```

## 0–12 Minutes — Why TypeScript?

JavaScript discovers many mistakes only when the affected line runs:

```js
function formatTitle(title) {
  return title.toUpperCase();
}

formatTitle(42);
```

TypeScript lets you describe expected types and reports incompatible usage before running the emitted JavaScript:

```ts
function formatTitle(title: string): string {
  return title.toUpperCase();
}

formatTitle(42);
```

TypeScript is a static type checker and language built on JavaScript. It does not replace Node.js, validate network data automatically, or guarantee bug-free logic. Type information is removed when `.ts` compiles to `.js`.

## 12–25 Minutes — Create the Project

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-19/src
cd practice/day-19
npm init -y
npm install --save-dev typescript
```

Why local installation?

- the project records its TypeScript dependency;
- collaborators and CI use a compatible version;
- `npx tsc` runs the project's compiler.

Verify:

```bash
npx tsc --version
```

Update the generated `package.json` without overwriting the TypeScript version npm recorded:

```bash
npm pkg set private=true --json
npm pkg set type=module
npm pkg set scripts.build=tsc
npm pkg set scripts.start="node dist/index.js"
```

Inspect the result and confirm that `devDependencies.typescript` is still present:

```bash
sed -n '1,200p' package.json
```

Ensure `.gitignore` contains:

```text
node_modules/
dist/
```

Commit `package-lock.json`; it records the resolved dependency tree.

## 25–38 Minutes — Configure the Compiler

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Meaning:

- `target`: JavaScript language level emitted for Node.js;
- `module`/`moduleResolution`: Node-compatible ES-module behavior;
- `rootDir`: TypeScript source location;
- `outDir`: compiled JavaScript location;
- `strict`: enables strong safety checks;
- `sourceMap`: helps debuggers map JavaScript back to TypeScript;
- `include`/`exclude`: which files belong to the project.

Do not weaken `strict` to make an error disappear. Understand the mismatch.

## 38–52 Minutes — First Typed Program

Create `src/index.ts`:

```ts
function createGreeting(name: string, lesson: number): string {
  return `Hello ${name}. Welcome to TypeScript lesson ${lesson}.`;
}

const studentName: string = "Nahid";
const currentLesson: number = 19;

console.log(createGreeting(studentName, currentLesson));
```

Compile:

```bash
npm run build
```

Inspect generated files:

```bash
find dist -maxdepth 2 -type f -print
sed -n '1,120p' dist/index.js
```

Run:

```bash
npm start
```

Node runs `dist/index.js`, not TypeScript directly. The compiler checks source and emits JavaScript.

## 52–60 Minutes — Create and Fix a Type Error

Change:

```ts
const currentLesson: number = "nineteen";
```

Run:

```bash
npm run build
```

Read the diagnostic:

- file and line;
- TypeScript error code;
- actual type;
- expected type.

Fix it back to a number and rebuild.

Add another invalid call:

```ts
createGreeting(19, "Nahid");
```

Explain both parameter errors before fixing them.

## Guided Practice

Create `src/post.ts`:

```ts
export function formatPost(title: string, views: number): string {
  return `${title} — ${views} views`;
}
```

Import it in `index.ts` using the emitted JavaScript extension:

```ts
import { formatPost } from "./post.js";
```

With NodeNext ESM, source imports use `.js` because that is the runtime file Node will load after compilation.

Build and run again.

## Independent Exercises

1. Add typed functions for rectangle area and temperature conversion.
2. Create three deliberate type errors, copy their diagnostics into notes, then fix them.
3. Split one typed utility into another module and import it.
4. Delete `dist`, rebuild, and explain why source remains safe.
5. Explain each chosen `tsconfig` option in your own words.

## Common Mistakes and Debugging Advice

- Install TypeScript locally; do not depend only on a global compiler.
- Do not commit `node_modules` or usually `dist`; do commit `package-lock.json`.
- JSON forbids comments and trailing commas.
- A successful compile does not validate external runtime input.
- Under NodeNext ESM, local imports should use runtime `.js` extensions.
- Read diagnostics instead of adding `any` or disabling strictness.

## Review Questions

1. What does TypeScript add to JavaScript?
2. When do type checks happen?
3. Does Node.js directly execute the types?
4. Why install TypeScript as a dev dependency?
5. What do `rootDir` and `outDir` mean?
6. Why use `strict`?
7. Why import `./post.js` from a `.ts` source file here?
8. What belongs in `package-lock.json`?

## Completion Checklist

- [ ] Local TypeScript installation works.
- [ ] `npm run build` creates `dist`.
- [ ] `npm start` runs compiled JavaScript.
- [ ] You created, understood, and fixed type errors.
- [ ] A second TypeScript module imports successfully.

## What to Send for Review

Send `package.json`, `tsconfig.json`, TypeScript source, build output, three diagnostics with fixes, and review answers. Next: **Day 20 — TypeScript Primitives, Arrays, Objects, Functions, and Inference**.

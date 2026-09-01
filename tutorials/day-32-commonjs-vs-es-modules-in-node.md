# Day 32 — CommonJS and ES Modules in Node.js

> Core lesson: about 60 minutes. New course code continues to use ES modules, but backend developers must recognize both Node module systems.

## Learning Objectives

You will learn to:

- explain why Node has CommonJS and ES modules;
- identify a file's module format from explicit markers;
- export and import values in both systems;
- understand important resolution and execution differences;
- use dynamic `import()` deliberately;
- connect Node's module rules to TypeScript NodeNext output.

## Setup

Create a small JavaScript project so the runtime rules are visible without a compiler:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-32/src
cd practice/day-32
npm init -y
npm pkg set private=true --json
npm pkg set type=module
```

## 0–15 Minutes — Two Module Systems

CommonJS is Node's original module system. It commonly uses:

```js
const dependency = require("dependency");
module.exports = value;
exports.name = value;
```

ECMAScript modules, or ESM, are the JavaScript standard module format:

```js
import dependency from "dependency";
export default value;
export const name = value;
```

Both provide file-level scope and reusable APIs, but their loaders, syntax, timing, resolution, and interoperability rules differ. Do not mechanically mix syntax within one file.

## 15–27 Minutes — Explicit Format Markers

Node uses the nearest `package.json` and file extensions:

| Marker | How Node treats the file |
|---|---|
| `.mjs` | Always ESM |
| `.cjs` | Always CommonJS |
| `.js` under `"type": "module"` | ESM |
| `.js` under `"type": "commonjs"` | CommonJS |

Be explicit with `type` even though modern Node can inspect ambiguous source. Explicit markers are easier for people, Node, editors, and build tools to understand.

The Day 32 package has `"type": "module"`, so ordinary `.js` files are ESM while `.cjs` remains available for a focused CommonJS example.

## 27–38 Minutes — Build Both Examples

Create `src/math.cjs`:

```js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
```

Create `src/commonjs-demo.cjs`:

```js
const { add, multiply } = require("./math.cjs");

console.log(add(2, 3));
console.log(multiply(4, 5));
console.log({ filename: __filename, directory: __dirname });
```

Create `src/math.js`:

```js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
```

Create `src/esm-demo.js`:

```js
import { add, multiply } from "./math.js";

console.log(add(2, 3));
console.log(multiply(4, 5));
console.log({ url: import.meta.url });
```

Run both:

```bash
node src/commonjs-demo.cjs
node src/esm-demo.js
```

Relative ESM imports must include the runtime file extension. ESM does not provide CommonJS wrapper variables such as `require`, `module`, `exports`, `__filename`, or `__dirname`.

## 38–48 Minutes — Loading and Execution Differences

Static ESM imports are analyzed before the module body executes. They must appear at the top level. ESM also supports top-level `await`:

```js
const result = await Promise.resolve("ESM ready");
console.log(result);
```

CommonJS `require()` loads through the CommonJS loader and is synchronous. It can be called conditionally, though conditional loading can make dependencies harder to follow.

Dynamic `import()` returns a Promise and works from either module system:

```js
async function loadMath() {
  const math = await import("./math.js");
  return math.add(10, 5);
}

console.log(await loadMath());
```

Use dynamic import when loading is genuinely conditional or deferred, not merely to avoid understanding static imports.

## 48–55 Minutes — Interoperability

Node supports interoperability, but the two systems are not perfectly symmetrical. An ESM file can often import a CommonJS package through its default export shape:

```js
import commonJsMath from "./math.cjs";

console.log(commonJsMath.add(5, 6));
```

Detected named exports from CommonJS are a convenience, not a universal guarantee. When consuming an older CommonJS library from ESM, check its documentation and inspect the imported value instead of guessing.

Modern Node can `require()` some synchronous ESM graphs, but top-level `await` and version compatibility complicate that direction. Prefer a package's documented entry point and avoid building a dual-format library in this beginner project.

## 55–60 Minutes — TypeScript NodeNext Connection

The course TypeScript configuration uses:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

Together with `"type": "module"`, `.ts` source is checked and emitted using Node-compatible ESM behavior. Local source imports use the emitted extension:

```ts
import { add } from "./math.js";
```

Types are erased, and `import type` avoids a runtime import:

```ts
import type { Post } from "./post.js";
```

## Guided Practice — Module Boundary

1. Create data, calculation, and application modules in CommonJS.
2. Build the same three-module structure with ESM.
3. Export multiple named utilities.
4. Add one default export and explain when its name can vary.
5. Load one ESM module dynamically.
6. Intentionally omit an ESM extension, read the error, and fix it.

## Independent Exercises

1. Classify ten snippets as CommonJS, ESM, or invalid mixing.
2. Predict how `.js`, `.mjs`, and `.cjs` behave under both `type` values.
3. Convert a CommonJS two-file program to ESM.
4. Convert a small ESM example to explicit `.cjs` files.
5. Compare `__filename` with `import.meta.url`.
6. Import a CommonJS module from ESM and inspect its namespace.
7. Add a top-level `await` example and explain why CommonJS cannot use the same syntax.
8. Compile one NodeNext TypeScript import and inspect emitted JavaScript.

## Common Mistakes and Debugging Advice

- Declare the package `type` explicitly.
- Do not combine `require` and static `import` syntax casually in one file.
- Include extensions in relative ESM imports.
- `__dirname` is not an ESM global.
- A TypeScript source import may say `.js` because Node executes emitted JavaScript.
- CommonJS named-import detection is not the same as native named exports.
- Check a dependency's documentation before changing its import style.
- Module format errors are loader errors, not TypeScript type errors.

## Review Questions

1. Why does Node support two module systems?
2. Which explicit markers select each format?
3. How do exports differ syntactically?
4. Why do relative ESM imports include extensions?
5. Which CommonJS wrapper values are missing in ESM?
6. What does dynamic `import()` return?
7. Why can CommonJS interoperability require care?
8. What does NodeNext model for TypeScript?

## Completion Checklist

- [ ] CommonJS and ESM examples both run.
- [ ] File extensions and package `type` are explained.
- [ ] Static and dynamic imports are demonstrated.
- [ ] One interoperability example is inspected.
- [ ] A NodeNext TypeScript module emits and runs.
- [ ] All exercises and review questions are complete.

## Official References

- Node package and module rules: https://nodejs.org/api/packages.html
- ECMAScript modules: https://nodejs.org/api/esm.html
- CommonJS modules: https://nodejs.org/api/modules.html

## What to Send for Review

Send `package.json`, all CommonJS and ESM source, runtime output, the deliberate resolution error and fix, emitted TypeScript output, and review answers. Next: **Day 33 — `path`, `process`, `os`, Environment Variables, and `dotenv`**.

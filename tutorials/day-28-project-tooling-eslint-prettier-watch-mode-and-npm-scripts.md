# Day 28 — Project Tooling: ESLint, Prettier, Watch Mode, and npm Scripts

> Setup lesson: about 60–90 minutes. Package installation requires internet access. Tool versions change, so install locally and commit the lockfile.

## Learning Objectives

You will learn to:

- distinguish the compiler, linter, formatter, and development runner;
- configure ESLint's flat config for TypeScript;
- format consistently with Prettier;
- run TypeScript in watch mode with `tsx`;
- understand why `ts-node-dev` is no longer selected for this ESM project;
- create clear npm scripts for development and verification.

## Prerequisites and Setup

Continue a working Day 27 project or create `practice/day-28` with Day 19's NodeNext ESM configuration.

Install the linting and watch tools locally:

```bash
npm install --save-dev eslint @eslint/js typescript-eslint tsx
npm install --save-dev eslint-config-prettier
npm install --save-dev --save-exact prettier
```

TypeScript should already be a local development dependency. Confirm:

```bash
npx tsc --version
npx eslint --version
npx prettier --version
npx tsx --version
```

Commit `package-lock.json`; do not commit `node_modules`.

## 0–12 Minutes — Give Each Tool One Job

| Tool | Main job | Changes files? | Type-checks? |
|---|---|---:|---:|
| `tsc` | Check types and build JavaScript | During build | Yes |
| ESLint | Find suspicious code patterns | Only with `--fix` | Some rules; not a replacement for `tsc` |
| Prettier | Format code consistently | With `--write` | No |
| `tsx` | Run TypeScript and restart on changes | No | No |

Keep the responsibilities separate. A formatted program can have type errors, and a type-correct program can still fail lint or runtime tests.

## 12–28 Minutes — ESLint Flat Configuration

Create `eslint.config.mjs` in the project root:

```js
// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,mjs,ts}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],
  },
  eslintConfigPrettier,
);
```

Run it:

```bash
npx eslint .
```

The final `eslint-config-prettier` entry disables formatting-related lint rules that could conflict with Prettier. ESLint still owns code-quality rules; Prettier owns layout.

Create a deliberate unused variable, run ESLint, read the rule name, then fix the code. Do not disable an entire rule before understanding it.

## 28–40 Minutes — Prettier

Create `.prettierrc.json`:

```json
{}
```

An empty configuration accepts Prettier's defaults and signals that the project uses Prettier.

Create `.prettierignore`:

```text
dist
node_modules
coverage
package-lock.json
```

Check without editing:

```bash
npx prettier . --check
```

Format files:

```bash
npx prettier . --write
```

Review the diff after formatting. Automated formatting is not permission to ignore unexpected file changes.

## 40–50 Minutes — Development Watch Mode

Create `src/index.ts`:

```ts
const startedAt = new Date();

console.log(`Development process started at ${startedAt.toISOString()}`);
```

Run:

```bash
npx tsx watch src/index.ts
```

Edit and save the file. The process should restart. Stop it with `Ctrl+C`.

`tsx` transpiles and runs TypeScript conveniently, but it does not type-check. Keep `tsc --noEmit` as a separate verification step.

### Where `ts-node-dev` fits

The original syllabus named `ts-node-dev`, whose common command was:

```bash
ts-node-dev --respawn --transpile-only src/index.ts
```

It combined `ts-node` with automatic restart. Its repository was archived in December 2025, and its ESM support does not fit the NodeNext setup used in this course reliably. Learn what role it served because older projects still contain it; use `tsx watch` for this project.

## 50–60 Minutes — npm Scripts as the Project Interface

Set the scripts:

```bash
npm pkg set scripts.dev="tsx watch src/index.ts"
npm pkg set scripts.build=tsc
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.lint:fix="eslint . --fix"
npm pkg set scripts.format="prettier . --write"
npm pkg set scripts.format:check="prettier . --check"
```

Run the full local verification:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm start
```

Scripts give learners, teammates, and future CI one stable command interface without requiring global installations.

## Guided Practice — Make the Tools Disagree

1. Add badly formatted but type-correct code.
2. Observe that `tsc` succeeds while Prettier check fails.
3. Add an unused variable and observe ESLint.
4. Add a genuine type error and observe `tsc --noEmit`.
5. Run `npm run dev` and confirm that `tsx` still needs a separate type check.
6. Fix each failure with the tool responsible for it.

## Independent Exercises

1. Explain every development dependency in `package.json`.
2. Add `check` to run typecheck, lint, and format checking sequentially.
3. Confirm `dist` is ignored by ESLint and Prettier.
4. Add a second `.ts` module and verify watch restart.
5. Compare `lint` with `lint:fix` on a safe example.
6. Compare `format` with `format:check`.
7. Delete `dist`, run the complete verification, and start the build.

## Common Mistakes and Debugging Advice

- Install project tools locally rather than relying on global versions.
- Do not expect Prettier to find logic errors.
- Do not expect a transpile-only runner to type-check.
- Put `eslint-config-prettier` after other shared configurations.
- Flat config uses `eslint.config.mjs`, not old `.eslintrc` tutorials.
- Keep generated output and dependencies out of lint/format traversal.
- Read a lint rule's documentation before disabling it.
- Stop watch mode before starting another process on the same resource.

## Review Questions

1. What distinct problem does each tool solve?
2. Why is `tsx` not a replacement for `tsc --noEmit`?
3. What does `eslint-config-prettier` do?
4. Why install Prettier with an exact local version?
5. What is ESLint flat config?
6. Why use npm scripts instead of memorizing full commands?
7. Why does this lesson not adopt `ts-node-dev`?
8. Which commands should CI eventually run?

## Completion Checklist

- [ ] Local tool installations and lockfile are present.
- [ ] ESLint flat config works.
- [ ] Prettier check and write modes work.
- [ ] `tsx` restarts after a source edit.
- [ ] Type checking remains a separate command.
- [ ] All verification scripts succeed.
- [ ] All exercises and review questions are complete.

## Official References

- typescript-eslint quick start: https://typescript-eslint.io/getting-started/
- Prettier installation: https://prettier.io/docs/install
- Archived `ts-node-dev` project: https://github.com/wclr/ts-node-dev
- `tsx` documentation: https://tsx.is/

## What to Send for Review

Send `package.json`, lockfile, tool configuration files, source, output from every verification script, and review answers. Next: **Day 29 ↻ — TypeScript Review: Fix Every Error Without `any`**.

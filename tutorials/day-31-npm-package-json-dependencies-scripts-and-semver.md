# Day 31 — npm, `package.json`, Dependencies, Scripts, and Semantic Versioning

> Core lesson: about 60–90 minutes. Package installation requires internet access. Work locally and commit the generated lockfile.

## Learning Objectives

You will learn to:

- explain the different roles of Node.js and npm;
- create and inspect a `package.json`;
- distinguish dependencies from development dependencies;
- use npm scripts as a project command interface;
- read semantic versions and common version ranges;
- explain why `package-lock.json` and `npm ci` matter.

## Prerequisites and Setup

Confirm the Node version selected on Day 30:

```bash
node --version
npm --version
```

Create the project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-31/src
cd practice/day-31
npm init -y
```

`npm init -y` creates a starting `package.json` using defaults. Inspect it before editing:

```bash
sed -n '1,200p' package.json
```

## 0–15 Minutes — What `package.json` Describes

Set useful application metadata:

```bash
npm pkg set name=day-31-npm-basics
npm pkg set private=true --json
npm pkg set type=module
npm pkg set description="Practice project for npm and package metadata"
npm pkg set engines.node=">=24 <25"
```

Use the Node range matching your Day 30 `.nvmrc`; `>=24 <25` is an example for Node 24, not a universal requirement.

Important fields:

- `name` and `version` identify a package;
- `private: true` prevents accidental publication through npm;
- `type` tells Node how to interpret `.js` files;
- `scripts` names repeatable project commands;
- `dependencies` records packages required when the application runs;
- `devDependencies` records development-only tools;
- `engines` communicates supported runtime versions.

`package.json` is project metadata, not an installed dependency tree and not executable application source.

## 15–28 Minutes — Dependencies and Development Dependencies

Install a runtime dependency that Day 33 will use:

```bash
npm install dotenv
```

Install development tools:

```bash
npm install --save-dev typescript @types/node tsx
```

Inspect the result:

```bash
npm pkg get dependencies devDependencies
npm ls --depth=0
```

Use this decision:

- If compiled production code needs the package to start or serve requests, it belongs in `dependencies`.
- If the package only builds, checks, formats, tests, or runs local development, it normally belongs in `devDependencies`.

Type declarations such as `@types/node` are compile-time support, so they are development dependencies. `dotenv` is a runtime dependency when application source imports it.

Remove a package with `npm uninstall package-name`; do not delete only its directory from `node_modules`.

## 28–40 Minutes — npm Scripts

Create `src/index.ts`:

```ts
const lesson = 31;

console.log(`Day ${lesson}: npm project is running.`);
```

Add scripts:

```bash
npm pkg set scripts.dev="tsx watch src/index.ts"
npm pkg set scripts.build=tsc
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.check="npm run typecheck && npm run build"
```

Use the strict NodeNext `tsconfig.json` from Day 19, then run:

```bash
npm run
npm run typecheck
npm run build
npm start
```

npm makes locally installed executables such as `tsc` available to scripts. You do not need a global TypeScript installation.

Scripts run from the package root. A non-zero exit code stops a chained command, which makes scripts useful later in CI.

## 40–52 Minutes — Semantic Versioning

A normal stable version has three numbers:

```text
MAJOR.MINOR.PATCH
2.4.7
```

- Increase `PATCH` for backward-compatible fixes: `2.4.7` → `2.4.8`.
- Increase `MINOR` for backward-compatible features: `2.4.7` → `2.5.0`.
- Increase `MAJOR` for breaking changes: `2.4.7` → `3.0.0`.

Common dependency ranges:

| Range | Typical meaning for `1.4.2` |
|---|---|
| `1.4.2` | Exactly that version |
| `~1.4.2` | Compatible patch updates below `1.5.0` |
| `^1.4.2` | Compatible minor and patch updates below `2.0.0` |
| `>=1.4.2 <2` | Explicit lower and upper bounds |

Caret behavior before `1.0.0` is narrower because a minor zero version may signal instability. Use npm's semver documentation or calculator rather than guessing complex ranges.

A range describes what may be installed. It does not prove every release within the range is bug-free or compatible with your particular application.

## 52–60 Minutes — Lockfiles and Reproducible Installs

`package-lock.json` records the resolved dependency tree and integrity information. Commit it for an application.

Compare:

- `npm install` resolves allowed ranges, updates the lockfile when needed, and installs packages;
- `npm ci` requires an existing compatible lockfile, performs a clean install, and does not rewrite dependency declarations;
- `node_modules` contains generated installed packages and should remain ignored by Git.

Practice from a clean state only after confirming the lockfile exists:

```bash
npm ci
npm run check
```

Do not hand-edit `package-lock.json`. Change dependencies with npm commands and review the resulting diff.

## Guided Practice — Audit the Project

1. Classify every installed package as runtime or development-only.
2. Move one deliberately misclassified package using uninstall and reinstall.
3. Explain every top-level `package.json` field.
4. Run a local executable through an npm script.
5. Compare declared ranges with resolved versions using `npm ls --depth=0`.
6. Run `npm ci` and verify the project again.

## Independent Exercises

1. Create a fresh package without copying `package.json`.
2. Add `clean`, `build`, `typecheck`, `dev`, and `start` scripts.
3. Predict which of five example packages belong in each dependency group.
4. Translate five semantic-version changes into patch, minor, or major.
5. Explain `^`, `~`, exact, and bounded ranges in your own words.
6. Inspect one dependency with `npm view package-name version` and `npm ls`.
7. Break the lockfile/package manifest agreement in a disposable copy, observe `npm ci`, then restore the valid files.
8. Confirm Git ignores `node_modules` and `dist` but includes the lockfile.

## Common Mistakes and Debugging Advice

- npm is a package manager and script runner; Node is the runtime.
- Mark learning applications `private` to prevent accidental publication.
- Do not put every package in `dependencies` by habit.
- Do not rely on globally installed project tools.
- A semver range and a lockfile serve different purposes.
- Never commit `node_modules` or manually edit the lockfile.
- Read install-script output and package changes before committing.
- Avoid `sudo npm install` inside a project.

## Review Questions

1. What does `package.json` describe?
2. How do dependencies and devDependencies differ?
3. Why is TypeScript usually a development dependency?
4. How do npm scripts find local executables?
5. What do the three semantic-version numbers mean?
6. How do caret and tilde ranges differ for a stable `1.x` package?
7. What extra information does the lockfile record?
8. When should a project use `npm ci`?

## Completion Checklist

- [ ] Package metadata is accurate and private.
- [ ] Runtime and development packages are classified correctly.
- [ ] Local scripts build and run the project.
- [ ] Semver changes and common ranges are explained.
- [ ] `package-lock.json` is committed and `node_modules` is ignored.
- [ ] `npm ci` followed by verification succeeds.
- [ ] All exercises and review questions are complete.

## Official References

- npm `package.json`: https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
- Dependencies and devDependencies: https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/
- npm scripts: https://docs.npmjs.com/cli/v11/using-npm/scripts/
- Semantic versioning: https://docs.npmjs.com/about-semantic-versioning/

## What to Send for Review

Send `package.json`, `package-lock.json`, `tsconfig.json`, source, script output, dependency classification, semver answers, and review answers. Next: **Day 32 — CommonJS and ES Modules in Node.js**.

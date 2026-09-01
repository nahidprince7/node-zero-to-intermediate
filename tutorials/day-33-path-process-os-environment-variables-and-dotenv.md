# Day 33 — `path`, `process`, `os`, Environment Variables, and `dotenv`

> Core lesson: about 60–90 minutes. Treat configuration as untrusted string input and never commit real secrets.

## Learning Objectives

You will learn to:

- build cross-platform paths with `node:path`;
- inspect arguments, working directory, and exit status through `process`;
- read useful platform information from `node:os`;
- load configuration from the environment;
- compare Node's native `.env` support with `dotenv`;
- validate configuration once at application startup.

## Setup

Continue Day 31 or create a strict NodeNext TypeScript project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-33/src
cd practice/day-33
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install dotenv
npm install --save-dev typescript @types/node tsx
```

Use the strict `tsconfig.json` and scripts from Days 19 and 28.

## 0–15 Minutes — Portable Paths

Create `src/paths.ts`:

```ts
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  resolve,
} from "node:path";

const relativeReportPath = join("data", "reports", "daily.json");
const absoluteReportPath = resolve("data", "reports", "daily.json");

console.log({
  relativeReportPath,
  absoluteReportPath,
  directory: dirname(absoluteReportPath),
  filename: basename(absoluteReportPath),
  extension: extname(absoluteReportPath),
  absolute: isAbsolute(absoluteReportPath),
});
```

`join` combines segments and normalizes separators. `resolve` processes segments into an absolute path, using the current working directory when necessary.

Do not build filesystem paths with hardcoded `/` or `\`. Do not confuse a filesystem path with a URL.

For a location relative to the current ESM module rather than the shell's working directory:

```ts
const moduleDirectory = import.meta.dirname;
const templatePath = join(moduleDirectory, "templates", "post.txt");
```

The course's selected active LTS Node version supports `import.meta.dirname`. Older compatible code often derives a path from `import.meta.url` with `fileURLToPath`.

## 15–28 Minutes — The `process` Object

Create `src/process-info.ts`:

```ts
console.log({
  version: process.version,
  platform: process.platform,
  architecture: process.arch,
  cwd: process.cwd(),
  arguments: process.argv.slice(2),
});
```

Run with arguments:

```bash
npx tsx src/process-info.ts --draft 42
```

Key ideas:

- `process.cwd()` is where the process was started, not necessarily where the source file lives;
- `process.argv` contains the executable, entry file, and user arguments;
- `process.env` contains environment strings;
- `process.exitCode = 1` lets pending output finish while signaling failure;
- `process.exit(1)` terminates immediately and can cut off unfinished asynchronous work.

Prefer setting `exitCode` at an application boundary unless immediate termination is truly required.

## 28–38 Minutes — Operating-System Information

Create `src/system-info.ts`:

```ts
import {
  arch,
  availableParallelism,
  homedir,
  platform,
  tmpdir,
} from "node:os";

console.log({
  platform: platform(),
  architecture: arch(),
  availableParallelism: availableParallelism(),
  homeDirectory: homedir(),
  temporaryDirectory: tmpdir(),
});
```

These values describe the host, but they do not grant permission to write anywhere. Use OS information only when behavior genuinely needs to differ; unnecessary platform branches become maintenance problems.

Never use the reported home directory as a broad deletion or overwrite target.

## 38–50 Minutes — Environment Variables

Environment variables arrive as `string | undefined`:

```ts
const rawPort = process.env.PORT;
const port = rawPort === undefined ? 3000 : Number(rawPort);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

console.log(`Configured port: ${port}`);
```

Run with a shell-provided value:

```bash
PORT=4000 npx tsx src/config.ts
```

Never assume that a value is numeric, Boolean, present, or safe merely because it came from the environment. The string `"false"` is truthy; parse Boolean configuration explicitly.

Do not print all of `process.env`, because it can contain tokens, credentials, and unrelated machine secrets.

## 50–60 Minutes — `.env` and `dotenv`

Create `.env` for local-only values:

```text
PORT=4000
LOG_LEVEL=debug
DATABASE_URL=postgresql://local-example-only
```

Add `.env` and `.env.*` to `.gitignore`, then allow a documented template such as `.env.example` containing placeholders only.

Modern Node can load the file before application startup:

```bash
node --env-file=.env dist/config.js
```

For projects using `dotenv`, load it before any module reads configuration:

```ts
import "dotenv/config";

console.log(process.env.LOG_LEVEL);
```

The two approaches serve the same basic job. Native `--env-file` avoids an application dependency when your supported Node versions provide everything required. `dotenv` remains common in existing projects, tools, and framework setups. Choose one loading strategy per entry point instead of layering both without a reason.

Real environment variables normally take precedence over file defaults. Verify override behavior for the chosen loader before relying on it in deployment.

## Guided Practice — Validated Configuration Module

Create `src/config.ts` that:

1. loads the selected environment strategy first;
2. requires `DATABASE_URL`;
3. parses `PORT` with a safe default;
4. restricts `LOG_LEVEL` to `debug`, `info`, `warn`, or `error`;
5. returns one readonly typed configuration object;
6. throws clear startup errors without printing secret values;
7. is imported by `src/index.ts` rather than reading `process.env` everywhere.

## Independent Exercises

1. Build five paths with `join`, `resolve`, `basename`, `dirname`, and `extname`.
2. Compare `process.cwd()` with `import.meta.dirname` from two launch directories.
3. Parse a `--post-id` argument without assuming it exists.
4. Print a small safe OS summary.
5. Parse number, Boolean, and finite-choice environment settings.
6. Test missing, empty, malformed, and valid configuration.
7. Run once with native `--env-file` and once with `dotenv`.
8. Create a safe `.env.example` and confirm real `.env` files are ignored.

## Common Mistakes and Debugging Advice

- Paths, URLs, and module specifiers are related but not interchangeable.
- `cwd` depends on where the process starts.
- Every environment value is a string or missing until parsed.
- Never log all environment variables or commit real credentials.
- Load `.env` before importing modules that read configuration.
- Validate at startup so bad configuration fails early and clearly.
- Prefer one configuration module over scattered `process.env` access.
- Set `process.exitCode` when graceful completion is possible.

## Review Questions

1. How do `join` and `resolve` differ?
2. Why can `cwd` differ from the module directory?
3. What is stored in `process.argv`?
4. Why is `process.env.PORT` not a number?
5. When is `process.exitCode` preferable to `process.exit()`?
6. What useful data does `node:os` expose?
7. How do native env-file loading and `dotenv` compare?
8. Why centralize and validate configuration?

## Completion Checklist

- [ ] Portable path operations work.
- [ ] Arguments and working-directory behavior are understood.
- [ ] OS information is read without unsafe assumptions.
- [ ] All configuration is parsed and validated.
- [ ] Secrets remain ignored and a template is committed.
- [ ] Native and `dotenv` loading are compared.
- [ ] All exercises and review questions are complete.

## Official References

- `node:path`: https://nodejs.org/api/path.html
- `process`: https://nodejs.org/api/process.html
- `node:os`: https://nodejs.org/api/os.html
- Node environment variables: https://nodejs.org/api/environment_variables.html
- `dotenv`: https://www.npmjs.com/package/dotenv

## What to Send for Review

Send source, configuration module, safe `.env.example`, `.gitignore`, output for valid and invalid settings, path comparisons, and review answers. Next: **Day 34 — Reading and Writing Files Safely with `fs`**.

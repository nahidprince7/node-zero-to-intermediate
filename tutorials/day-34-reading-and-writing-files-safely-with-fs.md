# Day 34 — Reading and Writing Files Safely with `fs`

> Core lesson: about 60–90 minutes. Work only inside `practice/day-34`; verify every resolved path before writing.

## Learning Objectives

You will learn to:

- distinguish synchronous, callback, and Promise filesystem APIs;
- read text and JSON with explicit encoding and validation;
- create directories and write or append files;
- handle expected filesystem error codes;
- avoid common check-then-act and concurrent-write mistakes;
- constrain user-controlled paths to an intended directory.

## Setup

Create a strict NodeNext TypeScript project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-34/src
mkdir -p practice/day-34/data/input
mkdir -p practice/day-34/data/output
cd practice/day-34
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
```

Use the previous strict `tsconfig.json`. Create `data/input/posts.json`:

```json
[
  { "id": 1, "title": "Node Files", "published": true },
  { "id": 2, "title": "Safe Writes", "published": false }
]
```

## 0–15 Minutes — Three API Styles

Node exposes filesystem operations through `node:fs` and `node:fs/promises`:

```ts
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
```

- Synchronous methods such as `readFileSync` block the JavaScript thread until complete.
- Callback methods are asynchronous and use error-first callbacks.
- Promise methods are asynchronous and work naturally with `async`/`await`.

Prefer Promise APIs for application flows. A synchronous read can be reasonable during a short CLI script or controlled startup before serving requests, but synchronous filesystem work inside request handling blocks other JavaScript work.

## 15–28 Minutes — Read Text and Parse JSON

Create `src/read-posts.ts`:

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const postsPath = join(process.cwd(), "data", "input", "posts.json");
const text = await readFile(postsPath, "utf8");
const parsed: unknown = JSON.parse(text);

console.log({ bytesAsCharacters: text.length, parsed });
```

Without an encoding, `readFile` returns a `Buffer`. With `"utf8"`, it returns text.

`JSON.parse` can throw for invalid syntax, and parsed data is not trustworthy merely because the file extension is `.json`. Reuse Day 23's guards:

```ts
interface StoredPost {
  id: number;
  title: string;
  published: boolean;
}

function isStoredPost(value: unknown): value is StoredPost {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    Number.isInteger(value.id) &&
    "title" in value &&
    typeof value.title === "string" &&
    "published" in value &&
    typeof value.published === "boolean"
  );
}

function isStoredPostArray(value: unknown): value is StoredPost[] {
  return Array.isArray(value) && value.every(isStoredPost);
}
```

Reject invalid structure before passing data to the rest of the application.

## 28–40 Minutes — Create, Write, and Append

Create `src/write-report.ts`:

```ts
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputDirectory = join(process.cwd(), "data", "output");
const reportPath = join(outputDirectory, "report.json");
const logPath = join(outputDirectory, "activity.log");

await mkdir(outputDirectory, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  totalPosts: 2,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await appendFile(logPath, `Generated ${reportPath}\n`, "utf8");
```

By default, `writeFile` replaces an existing file. To create a file only when it does not already exist:

```ts
await writeFile(reportPath, "first write\n", {
  encoding: "utf8",
  flag: "wx",
});
```

That call rejects with `EEXIST` instead of overwriting. Choose overwrite, append, or exclusive creation intentionally.

## 40–50 Minutes — Handle Expected Failures

Catch errors at a level that can add context or recover:

```ts
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function readOptionalText(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, "utf8");
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}
```

Handle only errors you genuinely expect. `ENOENT` means a path does not exist; it does not mean permission failures, invalid paths, or I/O errors should be hidden.

Avoid this race-prone pattern:

```ts
// Check whether a file exists, then read or write it later.
```

Another process can change the file between the check and operation. Perform the intended operation and handle its error.

## 50–60 Minutes — Safer Paths and Writes

Never join an untrusted filename and assume it remains inside the intended directory. Constrain the resolved path:

```ts
import { resolve, sep } from "node:path";

function resolveInside(baseDirectory: string, requestedName: string): string {
  const base = resolve(baseDirectory);
  const candidate = resolve(base, requestedName);

  if (!candidate.startsWith(`${base}${sep}`)) {
    throw new Error("Requested path escapes the data directory");
  }

  return candidate;
}
```

Test ordinary names plus `../outside.txt` and an absolute path. For stricter applications, also define permitted filenames or extensions and consider symbolic-link behavior.

For important replacement writes, writing a temporary file in the same directory and then renaming it can reduce the window in which readers observe partial content. This is not a universal transaction guarantee across every filesystem and failure mode. A database is more appropriate when multiple writers, durable transactions, or complex consistency are required.

Always await one `writeFile` before starting another write to the same file. Concurrent unsynchronized modifications can corrupt or unpredictably reorder data.

## Guided Practice — File-Backed Blog Report

Build a program that:

1. resolves the input and output paths safely;
2. reads `posts.json` as UTF-8;
3. parses it as `unknown` and validates every post;
4. calculates published count and total count;
5. creates the output directory recursively;
6. writes formatted JSON plus a newline;
7. appends a timestamped activity line;
8. reports missing, malformed, and permission errors clearly.

## Independent Exercises

1. Compare text returned with and without an encoding.
2. Test valid JSON, invalid syntax, and invalid structure separately.
3. Demonstrate overwrite, append, and exclusive-create behavior.
4. Read an optional file while handling only `ENOENT`.
5. Reject traversal attempts using `resolveInside`.
6. Run two ordered writes and explain why each is awaited.
7. Rewrite a small callback example with `fs/promises`.
8. Measure a small sync and async read without claiming one measurement proves universal performance.
9. Explain when `readFile` is unsuitable for a very large file.

## Common Mistakes and Debugging Advice

- Pass an encoding when text is expected.
- Parsing JSON does not validate its shape.
- Know whether a write replaces, appends, or rejects existing content.
- Do not hide every filesystem error as “file not found.”
- Perform the operation and handle errors instead of checking first.
- Await modifications to the same file in a defined order.
- Validate resolved paths before using user-controlled names.
- `readFile` loads the whole file into memory; streams arrive on Days 36–37.
- Avoid synchronous filesystem work in request handlers.

## Review Questions

1. How do sync, callback, and Promise APIs differ?
2. Why specify UTF-8 when reading text?
3. Why should parsed JSON begin as `unknown`?
4. What does the `wx` flag protect against?
5. Why handle only specific expected error codes?
6. What is wrong with checking existence before acting?
7. How can a filename escape its intended directory?
8. Why are concurrent writes to one file dangerous?

## Completion Checklist

- [ ] Promise-based reads and writes work.
- [ ] JSON syntax and structure are validated separately.
- [ ] Overwrite, append, and exclusive creation are demonstrated.
- [ ] Expected errors retain useful context.
- [ ] Traversal attempts are rejected.
- [ ] Writes to one file are sequenced.
- [ ] All exercises and review questions are complete.

## Official References

- Node.js filesystem API: https://nodejs.org/api/fs.html
- Node.js path API: https://nodejs.org/api/path.html
- Node.js errors: https://nodejs.org/api/errors.html

## What to Send for Review

Send source, sample input, generated output, deliberate failure output, path-traversal tests, ordered-write explanation, and review answers. Next: **Day 35 — Events and `EventEmitter`**.

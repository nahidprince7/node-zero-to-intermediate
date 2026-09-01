# Day 37 — Streams II: `pipe`, Transform Streams, and Backpressure

> Core lesson: about 60–90 minutes. Connect stream stages safely and let slow consumers control fast producers.

## Learning Objectives

You will learn to:

- connect readable and writable streams with `pipe`;
- prefer `pipeline` when errors and cleanup matter;
- build a small transform stream;
- explain backpressure and `highWaterMark`;
- respect the return value of `write` and wait for `drain`;
- stream a large file through compression.

## Setup

Continue the Day 36 project or create `practice/day-37` with the same strict NodeNext TypeScript setup:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-37/src practice/day-37/data
cd practice/day-37
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
```

Create input data:

```bash
node -e "for (let i = 1; i <= 100000; i++) console.log(JSON.stringify({ id: i, title: 'Post ' + i }))" > data/posts.ndjson
```

NDJSON stores one complete JSON value per line. It is convenient for incremental processing; a normal JSON array needs a parser capable of preserving structure across chunks.

## 0–15 Minutes — Connect Streams with `pipe`

Create `src/copy.ts`:

```ts
import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";

const source = createReadStream(join(process.cwd(), "data", "posts.ndjson"));
const destination = createWriteStream(
  join(process.cwd(), "data", "posts-copy.ndjson"),
);

source.pipe(destination);

source.on("error", (error) => console.error("Read failed:", error));
destination.on("error", (error) => console.error("Write failed:", error));
destination.on("finish", () => console.log("Copy complete"));
```

`pipe` moves chunks from a readable to a writable, ends the destination when the source ends by default, and coordinates flow when the destination becomes busy.

Error handling remains your responsibility. An error in one piped stream does not automatically provide complete cleanup for the entire chain. For application code, `pipeline` is usually the safer composition tool.

## 15–28 Minutes — Use Promise-Based `pipeline`

Create `src/compress.ts`:

```ts
import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const sourcePath = join(process.cwd(), "data", "posts.ndjson");
const destinationPath = `${sourcePath}.gz`;

try {
  await pipeline(
    createReadStream(sourcePath),
    createGzip(),
    createWriteStream(destinationPath),
  );
  console.log(`Created ${destinationPath}`);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Compression failed: ${message}`);
  process.exitCode = 1;
}
```

`pipeline` forwards data, handles backpressure, propagates failure, and destroys the participating streams when appropriate. Its Promise settles only when the whole pipeline completes or fails.

The stages are:

```text
file readable -> gzip transform -> file writable
```

## 28–42 Minutes — Build a Transform

A transform consumes chunks and produces derived chunks. Create `src/number-lines.ts`:

```ts
import { createReadStream, createWriteStream } from "node:fs";
import { join } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

class NumberLines extends Transform {
  private remainder = "";
  private lineNumber = 0;

  constructor() {
    super({ decodeStrings: false });
  }

  override _transform(
    chunk: string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const parts = `${this.remainder}${chunk}`.split("\n");
    this.remainder = parts.pop() ?? "";

    for (const line of parts) {
      this.lineNumber += 1;
      this.push(`${this.lineNumber}: ${line}\n`);
    }

    callback();
  }

  override _flush(callback: (error?: Error | null) => void): void {
    if (this.remainder.length > 0) {
      this.lineNumber += 1;
      this.push(`${this.lineNumber}: ${this.remainder}\n`);
    }

    callback();
  }
}

await pipeline(
  createReadStream(join(process.cwd(), "data", "posts.ndjson"), "utf8"),
  new NumberLines(),
  createWriteStream(join(process.cwd(), "data", "numbered.ndjson")),
);
```

`_transform` must invoke its callback exactly once, either with no error or with an error. `_flush` handles final buffered state. The remainder exists because a chunk can end midway through a line.

Do not perform uncontrolled parallel asynchronous work inside a transform. Preserve ordering and call the callback only after that chunk's work completes.

## 42–55 Minutes — Backpressure

Imagine a fast producer sending data to a slow disk or network connection. If the producer never slows, queued data grows until memory usage becomes dangerous. Backpressure is the mechanism by which the consumer says, “pause until I catch up.”

For manual writes, `writable.write(chunk)` returns:

- `true`: the producer may continue;
- `false`: stop writing and wait for `drain`.

Create `src/manual-writes.ts`:

```ts
import { createWriteStream } from "node:fs";
import { once } from "node:events";

const output = createWriteStream("data/generated.txt", {
  highWaterMark: 16 * 1024,
});

for (let index = 0; index < 100_000; index += 1) {
  const ready = output.write(`record ${index}\n`);

  if (!ready) {
    await once(output, "drain");
  }
}

output.end();
await once(output, "finish");
```

The false return does not mean the write failed. It means the internal queue reached its threshold. `highWaterMark` controls that threshold; it is not a hard memory limit and increasing it blindly is not a backpressure strategy.

`pipe` and `pipeline` coordinate this pause-and-resume behavior for you.

## 55–60 Minutes — Object Mode

Most streams count bytes or strings. Object-mode streams carry arbitrary JavaScript values and count objects instead of bytes:

```ts
const titles = new Transform({
  objectMode: true,
  transform(
    post: { title: string },
    _encoding,
    callback,
  ) {
    callback(null, post.title);
  },
});
```

Do not write ordinary objects to a byte-mode stream. Object mode is useful inside application pipelines, while network and file boundaries still normally require serialization.

## Guided Practice — NDJSON Publication Filter

Build a pipeline that:

1. reads an NDJSON file incrementally as UTF-8;
2. buffers incomplete lines across chunks;
3. parses each complete line with useful line-number errors;
4. validates the parsed value before use;
5. keeps only records where `published === true`;
6. writes valid NDJSON with one newline per record;
7. uses `pipeline` and reports a single clear failure;
8. remains bounded instead of collecting all posts in an array.

You may implement a line-splitting transform, an object-mode filter, and a serializer as separate stages. Small stages are easier to test than one transform doing everything.

## Independent Exercises

1. Copy a file with `pipe`, then with `pipeline`.
2. Compress and decompress a file with `node:zlib`.
3. Make the source path invalid and observe pipeline cleanup.
4. Write an uppercase transform that handles text encoding correctly.
5. Implement the NDJSON publication filter.
6. Use a deliberately small `highWaterMark` and count `drain` events.
7. Remove the `drain` wait, observe memory behavior carefully, then restore it.
8. Explain byte mode and object mode in your own words.

## Common Mistakes and Debugging Advice

- Prefer `pipeline` for multi-stage error propagation and cleanup.
- A transform must call its callback exactly once per input chunk.
- Preserve partial records between chunks.
- Do not assume a false `write` return means failure.
- Wait for `drain` before producing more manual writes.
- `highWaterMark` is a queue threshold, not a fixed chunk size or hard cap.
- Do not mix object chunks into a byte-mode stream.
- Never parse each arbitrary chunk as if it were a complete JSON document.

## Review Questions

1. What does `pipe` automate?
2. Why is `pipeline` usually safer for a chain?
3. What makes a transform different from a general duplex stream?
4. Why does the line transform need a remainder?
5. What problem does backpressure prevent?
6. What should happen when `write` returns `false`?
7. What does `highWaterMark` represent?
8. How does object mode change buffering semantics?

## Completion Checklist

- [ ] A file is copied through streams.
- [ ] Compression succeeds through Promise-based `pipeline`.
- [ ] A custom transform handles split lines.
- [ ] Manual writes respect `drain`.
- [ ] Backpressure is explained accurately.
- [ ] NDJSON is processed without full-file accumulation.
- [ ] All exercises and review questions are complete.

## Official References

- Node.js stream API: https://nodejs.org/api/stream.html
- Node.js stream promises API: https://nodejs.org/api/stream.html#streams-promises-api
- Node.js zlib API: https://nodejs.org/api/zlib.html

## What to Send for Review

Send the copy, compression, custom transform, manual-write output, NDJSON pipeline, failure output, exercises, and review answers. Next: **Day 38 — Build an HTTP Server with No Framework**.

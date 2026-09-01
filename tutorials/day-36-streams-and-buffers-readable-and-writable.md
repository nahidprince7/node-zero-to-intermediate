# Day 36 — Streams and Buffers I: Readable and Writable Streams

> Core lesson: about 60–90 minutes. Today you process data piece by piece instead of loading an entire file into memory.

## Learning Objectives

You will learn to:

- explain why buffers and streams exist;
- create, encode, and decode `Buffer` values;
- consume a readable stream with events and async iteration;
- write to a writable stream and finish it correctly;
- distinguish chunks from complete messages;
- choose between `readFile` and a stream.

## Setup

Create a strict NodeNext TypeScript project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-36/src practice/day-36/data
cd practice/day-36
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
```

Use the strict `tsconfig.json` and scripts from Days 19 and 28. Create a sample file large enough to arrive in several chunks:

```bash
node -e "for (let i = 1; i <= 10000; i++) console.log('blog line ' + i)" > data/posts.log
```

## 0–15 Minutes — Bytes and `Buffer`

Files and network messages ultimately contain bytes. JavaScript strings represent text; a Node `Buffer` represents a fixed-length sequence of bytes and extends `Uint8Array`.

Create `src/buffers.ts`:

```ts
import { Buffer } from "node:buffer";

const text = "Node 🌊";
const bytes = Buffer.from(text, "utf8");
const empty = Buffer.alloc(8); // Initialized to zero.

console.log({
  textLength: text.length,
  byteLength: Buffer.byteLength(text, "utf8"),
  bytes,
  hexadecimal: bytes.toString("hex"),
  decoded: bytes.toString("utf8"),
  empty,
});
```

Characters and bytes are not interchangeable. Some UTF-8 characters use more than one byte, so `text.length` need not equal `Buffer.byteLength(text)`.

Prefer `Buffer.alloc` when allocating space yourself. `Buffer.allocUnsafe` may be faster, but its memory must be completely overwritten before any part is read or exposed. It is unnecessary for this lesson.

## 15–28 Minutes — Why Stream?

Day 34's `readFile` waits for the complete file and stores it in memory. That is simple and appropriate for small configuration or JSON files. A readable stream delivers chunks over time, which is better suited to large files, HTTP bodies, compression, and other incremental work.

Streams do not guarantee meaningful chunk boundaries:

- one chunk is not necessarily one line;
- one write is not necessarily one later read;
- a multi-byte character can be split across byte chunks;
- chunk sizes can differ between runs and environments.

A stream limits how much data is buffered at once; it does not make the total data smaller.

## 28–42 Minutes — Consume a Readable

Create `src/read-events.ts`:

```ts
import { createReadStream } from "node:fs";
import { join } from "node:path";

const inputPath = join(process.cwd(), "data", "posts.log");
const input = createReadStream(inputPath, {
  encoding: "utf8",
  highWaterMark: 64,
});

let chunks = 0;
let characters = 0;

input.on("data", (chunk) => {
  chunks += 1;
  characters += chunk.length;
});

input.on("end", () => {
  console.log({ chunks, characters });
});

input.on("error", (error) => {
  console.error("Could not read input:", error.message);
  process.exitCode = 1;
});
```

Adding a `data` listener puts the readable into flowing mode. `end` means no more data remains. `error` is separate: an errored stream does not imply a normal `end`.

`highWaterMark` is a buffering threshold, not a promise that every chunk has exactly that size.

Async iteration often makes consumption easier to follow:

```ts
import { createReadStream } from "node:fs";

const input = createReadStream("data/posts.log");
let bytes = 0;

for await (const chunk of input) {
  bytes += chunk.length;
}

console.log({ bytes });
```

Without an encoding, file-stream chunks are buffers. With an encoding, they are strings and Node's decoder safely handles characters split across underlying byte chunks.

## 42–55 Minutes — Write to a Writable

Create `src/write-summary.ts`:

```ts
import { createWriteStream } from "node:fs";
import { once } from "node:events";
import { join } from "node:path";

const outputPath = join(process.cwd(), "data", "summary.txt");
const output = createWriteStream(outputPath, { encoding: "utf8" });

output.on("error", (error) => {
  console.error("Could not write output:", error.message);
  process.exitCode = 1;
});

output.write("Daily blog summary\n");
output.write("Published: 12\n");
output.end("Drafts: 3\n");

await once(output, "finish");
console.log(`Wrote ${outputPath}`);
```

`write` sends a chunk to the writable's internal queue. `end` optionally writes a final chunk and declares that no more writes will follow. `finish` means all data has been handed to the underlying system; it is not the same event as a readable's `end`.

The Boolean returned by `write` becomes important when producing data faster than the destination accepts it. Day 37 covers that backpressure signal.

## 55–60 Minutes — Stream Types

Node uses four related stream categories:

| Type | Purpose | Examples |
|---|---|---|
| Readable | Data can be consumed | file input, HTTP request |
| Writable | Data can be written | file output, HTTP response |
| Duplex | Both directions independently | TCP socket |
| Transform | Duplex where output is derived from input | compression, text conversion |

All Node streams are event emitters, connecting today's lesson to Day 35.

## Guided Practice — Count Lines Incrementally

Build `src/count-lines.ts` that:

1. opens `data/posts.log` with `createReadStream` and UTF-8 decoding;
2. processes it with `for await...of`;
3. retains only an incomplete trailing line between chunks;
4. counts complete non-empty lines;
5. counts the final line even when the file lacks a trailing newline;
6. reports a useful error without hiding it;
7. never concatenates the entire file into one string.

Hint: combine the previous remainder with the current chunk, split on newlines, and save the last incomplete element for the next iteration.

## Independent Exercises

1. Compare string length with byte length for ASCII, Bangla, and emoji text.
2. Encode text as UTF-8, print it as hexadecimal, and decode it.
3. Read the same file with several `highWaterMark` values and count chunks.
4. Implement the line counter without assuming chunks equal lines.
5. Write a report using several `write` calls followed by `end`.
6. Trigger and handle a readable error with a missing file.
7. Trigger and handle a writable error with an invalid destination.
8. Explain why a 2 GB file is a poor candidate for `readFile`.

## Common Mistakes and Debugging Advice

- A chunk is an arbitrary piece of data, not a record or line.
- Do not concatenate every chunk if the goal is bounded memory usage.
- Set a text encoding or decode bytes deliberately.
- Listen for stream errors; they are not ordinary successful completion.
- Call `end` when finished writing.
- Do not write after `end`.
- `highWaterMark` is a threshold, not an exact chunk-size contract.
- Prefer safe allocation unless you can prove every byte is overwritten.

## Review Questions

1. What does a `Buffer` represent?
2. Why can character count differ from byte count?
3. When is `readFile` simpler than a readable stream?
4. Why can a chunk not be treated as one line?
5. What switches a readable into flowing mode?
6. How do readable `end` and writable `finish` differ?
7. What does `writable.end()` communicate?
8. What stream types are both readable and writable?

## Completion Checklist

- [ ] Buffer encoding and decoding are understood.
- [ ] Text length and byte length are compared.
- [ ] A readable is consumed with events and async iteration.
- [ ] Chunk boundaries are handled correctly.
- [ ] A writable is ended and observed through `finish`.
- [ ] Expected stream errors are visible.
- [ ] All exercises and review questions are complete.

## Official References

- Node.js Buffer API: https://nodejs.org/api/buffer.html
- Node.js stream API: https://nodejs.org/api/stream.html
- Node.js filesystem streams: https://nodejs.org/api/fs.html

## What to Send for Review

Send the buffer output, readable examples, line counter, generated report, deliberate error output, exercises, and review answers. Next: **Day 37 — Pipes, Transform Streams, and Backpressure**.

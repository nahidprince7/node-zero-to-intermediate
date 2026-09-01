# Day 39 — Routing and Parsing a JSON Body by Hand

> Core lesson: about 90 minutes. Implement a tiny API manually so the value of Express middleware becomes concrete.

## Learning Objectives

You will learn to:

- route by HTTP method and URL pathname;
- extract and validate a path parameter;
- collect a request body from its readable stream;
- enforce a body-size limit;
- distinguish malformed JSON from invalid data shape;
- produce consistent errors and avoid double responses.

## Setup

Create `practice/day-39` with the strict NodeNext TypeScript setup from Day 38:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-39/src
cd practice/day-39
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.start="tsx src/server.ts"
```

## 0–15 Minutes — Method and Path Routing

Start `src/server.ts`:

```ts
import { createServer, type ServerResponse } from "node:http";

interface Post {
  id: number;
  title: string;
  published: boolean;
}

const posts: Post[] = [
  { id: 1, title: "Raw Node", published: true },
  { id: 2, title: "Manual Routing", published: false },
];

function sendJson(
  response: ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  const body = JSON.stringify(data);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", "http://localhost");

  if (method === "GET" && url.pathname === "/posts") {
    sendJson(response, 200, { data: posts });
    return;
  }

  sendJson(response, 404, { error: { message: "Route not found" } });
});

server.listen(3000, "127.0.0.1", () => {
  console.log("API listening at http://127.0.0.1:3000");
});
```

A route is at least a method-plus-path match. `GET /posts` and `POST /posts` are different operations.

## 15–28 Minutes — Path Parameters

Match a single post path:

```ts
function parsePostId(pathname: string): number | undefined {
  const match = /^\/posts\/(\d+)$/.exec(pathname);

  if (!match) {
    return undefined;
  }

  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
}
```

Use it after the collection route:

```ts
if (method === "GET") {
  const postId = parsePostId(url.pathname);

  if (postId !== undefined) {
    const post = posts.find((candidate) => candidate.id === postId);

    if (!post) {
      sendJson(response, 404, { error: { message: "Post not found" } });
      return;
    }

    sendJson(response, 200, { data: post });
    return;
  }
}
```

Do not use a loose prefix such as `pathname.startsWith("/posts/")` and assume everything after it is a valid ID. Match the complete expected shape and validate the converted value.

## 28–45 Minutes — Collect a Limited Body

An incoming request body is a readable stream. It may arrive in many chunks, and it may be far larger than expected.

```ts
import type { IncomingMessage } from "node:http";

class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

async function readBody(
  request: IncomingMessage,
  maximumBytes = 1_000_000,
): Promise<Buffer> {
  const declaredLength = Number(request.headers["content-length"]);

  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    request.resume(); // Drain unread data so the connection can be managed.
    throw new HttpError(413, "Request body is too large");
  }

  const chunks: Buffer[] = [];
  let receivedBytes = 0;
  let exceededLimit = false;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.length;

    if (receivedBytes > maximumBytes) {
      exceededLimit = true;
      continue; // Keep draining, but stop retaining data.
    }

    chunks.push(buffer);
  }

  if (exceededLimit) {
    throw new HttpError(413, "Request body is too large");
  }

  return Buffer.concat(chunks);
}
```

`Content-Length` is only an early hint from an untrusted client. The server must count bytes actually received. This implementation drains excess input without retaining it; real production servers also use request and connection timeouts.

## 45–60 Minutes — Parse and Validate JSON

Parsing proves only that the text is valid JSON syntax. Validate its structure separately:

```ts
interface CreatePostInput {
  title: string;
  published: boolean;
}

function isCreatePostInput(value: unknown): value is CreatePostInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string" &&
    value.title.trim().length >= 3 &&
    "published" in value &&
    typeof value.published === "boolean"
  );
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const contentType = request.headers["content-type"] ?? "";
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase();

  if (mediaType !== "application/json") {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  const body = await readBody(request);

  if (body.length === 0) {
    throw new HttpError(400, "Request body is required");
  }

  try {
    return JSON.parse(body.toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "Request body contains malformed JSON");
  }
}
```

Now add the create route:

```ts
if (method === "POST" && url.pathname === "/posts") {
  const input = await readJson(request);

  if (!isCreatePostInput(input)) {
    throw new HttpError(422, "Post data is invalid");
  }

  const post: Post = {
    id: (posts.at(-1)?.id ?? 0) + 1,
    title: input.title.trim(),
    published: input.published,
  };

  posts.push(post);
  sendJson(response, 201, { data: post });
  return;
}
```

`400` describes invalid request syntax here, `415` an unsupported media type, and `422` syntactically valid JSON that fails the endpoint's data rules.

## 60–72 Minutes — One Error Boundary

An `async` request listener returns a Promise, but `EventEmitter` does not turn its rejection into an HTTP response. Wrap the asynchronous handler yourself:

```ts
import type { IncomingMessage } from "node:http";

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  // Put all route branches here. Throw HttpError for expected failures.
}

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error: unknown) => {
    if (response.headersSent) {
      response.destroy();
      return;
    }

    if (error instanceof HttpError) {
      sendJson(response, error.statusCode, {
        error: { message: error.message },
      });
      return;
    }

    console.error("Unexpected request failure:", error);
    sendJson(response, 500, {
      error: { message: "Internal server error" },
    });
  });
});
```

Never expose arbitrary internal error messages or stack traces to clients. Log unexpected details on the server and return a stable public response.

## 72–90 Minutes — Test the Pain

Run these deliberately different requests:

```bash
curl -i http://127.0.0.1:3000/posts
curl -i http://127.0.0.1:3000/posts/1
curl -i http://127.0.0.1:3000/posts/999
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"New Post","published":false}'
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{bad json}'
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: text/plain' \
  -d 'hello'
```

You have manually built fragments of a router, JSON body parser, size limiter, validator, response helper, 404 handler, and error middleware. Express does not remove these concerns; it supplies tested abstractions and a composable request pipeline for them.

## Guided Practice — In-Memory Posts API

Complete these endpoints:

1. `GET /posts` returns all posts;
2. `GET /posts/:id` returns one post or 404;
3. `POST /posts` accepts limited JSON, validates it, and returns 201;
4. unsupported paths return 404;
5. malformed JSON returns 400;
6. unsupported media type returns 415;
7. invalid post structure returns 422;
8. unexpected errors return a generic 500 and are logged once.

Keep data in memory. Restarting the server may reset it; persistence comes later.

## Independent Exercises

1. Reject IDs containing decimals, signs, or trailing characters.
2. Add `DELETE /posts/:id` and return 204 when deletion succeeds.
3. Require a non-empty body and JSON content type.
4. Test a declared body length above the limit.
5. Test a chunked body whose actual size crosses the limit.
6. Reject arrays, `null`, missing fields, and wrong field types.
7. Confirm one request cannot receive two responses.
8. List the raw concerns that Express will replace or organize.

## Common Mistakes and Debugging Advice

- Route with both the method and the complete pathname.
- Query strings are not part of `url.pathname`.
- Request bodies are streams, not immediately available objects.
- Count bytes actually received; do not trust `Content-Length` alone.
- Check the media type before parsing JSON.
- Parsing JSON and validating its shape are separate operations.
- Catch rejected async handlers explicitly.
- Return after sending a response.
- Do not leak internal errors in a 500 response.

## Review Questions

1. Why is method-plus-path the minimum route identity?
2. Why validate a captured path parameter after matching it?
3. Why must request bodies be size-limited?
4. Why is `Content-Length` insufficient enforcement?
5. What is the difference between malformed JSON and invalid post data?
6. Why does an async event listener need an explicit rejection boundary?
7. What should happen if an error occurs after headers were sent?
8. Which pieces of this server will Express simplify?

## Completion Checklist

- [ ] Collection and single-resource routes work.
- [ ] IDs are matched and validated strictly.
- [ ] JSON bodies are collected with a byte limit.
- [ ] Media type, syntax, and structure fail distinctly.
- [ ] Async failures reach one error boundary.
- [ ] 404 and 500 responses are consistent.
- [ ] All requests are tested with `curl`.
- [ ] All exercises and review questions are complete.

## Official References

- Node.js HTTP API: https://nodejs.org/api/http.html
- Node.js stream consumers: https://nodejs.org/api/stream.html#api-for-stream-consumers
- WHATWG URL API in Node: https://nodejs.org/api/url.html#the-whatwg-url-api

## What to Send for Review

Send the complete server, all success and failure `curl -i` output, size-limit tests, validation examples, your list of raw concerns, exercises, and review answers. Next: **Day 40 — HTTP Fundamentals**.

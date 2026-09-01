# Day 38 — The `http` Module: Build a Server with No Framework

> Core lesson: about 60–90 minutes. Build and inspect a real HTTP server using only Node's standard library.

## Learning Objectives

You will learn to:

- create and start a server with `node:http`;
- inspect an incoming request;
- set a status, headers, and response body;
- return text, HTML, and JSON;
- test a server with `curl`;
- shut the server down and handle startup errors.

## Setup

Create a strict NodeNext TypeScript project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-38/src
cd practice/day-38
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.start="tsx src/server.ts"
```

Use the strict `tsconfig.json` from earlier lessons.

## 0–15 Minutes — Create and Listen

Create `src/server.ts`:

```ts
import { createServer } from "node:http";

const host = "127.0.0.1";
const port = 3000;

const server = createServer((request, response) => {
  console.log(`${request.method} ${request.url}`);

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Hello from raw Node.js\n");
});

server.listen(port, host, () => {
  console.log(`Server listening at http://${host}:${port}`);
});
```

Run it in one terminal:

```bash
npm run dev
```

Call it from another:

```bash
curl -i http://127.0.0.1:3000/
```

`createServer` returns an `http.Server`, which is an event emitter. The callback is a listener for its `request` event. Node creates an `IncomingMessage` and `ServerResponse` for each request.

The request is a readable stream. The response is a writable stream. Days 36–37 were direct preparation for this.

## 15–28 Minutes — Inspect the Request

Temporarily log a deliberately selected subset:

```ts
console.log({
  method: request.method,
  url: request.url,
  host: request.headers.host,
  accept: request.headers.accept,
  userAgent: request.headers["user-agent"],
});
```

Important limitations:

- `request.method` and `request.url` can be `undefined` in the general Node type;
- `request.url` normally contains the path and query, not a complete absolute URL;
- incoming header names are normalized to lowercase;
- headers and URLs are untrusted input;
- indiscriminate logging can expose authorization tokens, cookies, or personal data.

Construct a URL with an explicit trusted base:

```ts
const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

console.log({ pathname: url.pathname, query: Object.fromEntries(url.searchParams) });
```

For production routing, do not trust an arbitrary `Host` header when making security decisions or generating absolute links. Application configuration should define trusted public origins.

## 28–42 Minutes — Return Different Representations

Replace the request listener body with a few direct branches:

```ts
const server = createServer((request, response) => {
  const method = request.method ?? "GET";
  const url = new URL(request.url ?? "/", "http://localhost");

  if (method === "GET" && url.pathname === "/") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end("<h1>Raw Node Blog</h1>");
    return;
  }

  if (method === "GET" && url.pathname === "/health") {
    const body = JSON.stringify({ status: "ok", uptime: process.uptime() });

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(body);
    return;
  }

  response.statusCode = 404;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify({ error: "Not found" }));
});
```

`response.end()` completes the response. A handler that neither ends the response nor intentionally keeps streaming leaves the client waiting.

Node may determine framing for you, but representation metadata remains your responsibility. Set the correct content type and character encoding.

## 42–52 Minutes — A JSON Helper

Repeated response details become noisy quickly:

```ts
import type { ServerResponse } from "node:http";

function sendJson(
  response: ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  const body = JSON.stringify(data);

  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
}
```

Use byte length, not JavaScript string length, for `Content-Length`. You may also omit it and allow Node to choose appropriate response framing. Never set a length that does not exactly match the transmitted bytes.

This helper is the beginning of an abstraction. Express will later supply higher-level response methods, but it still writes an HTTP response underneath.

## 52–60 Minutes — Lifecycle and Errors

Handle server startup or socket errors:

```ts
server.on("error", (error) => {
  console.error("Server error:", error.message);
  process.exitCode = 1;
});
```

Try running a second server on port 3000 to observe `EADDRINUSE`.

Close gracefully when the terminal sends an interrupt:

```ts
process.on("SIGINT", () => {
  console.log("\nStopping server...");

  server.close((error) => {
    if (error) {
      console.error("Shutdown failed:", error);
      process.exitCode = 1;
      return;
    }

    console.log("Server stopped");
  });
});
```

`server.close` stops accepting new connections and waits for appropriate existing connections to close. Production shutdown also needs a deadline and cleanup for databases, queues, and other resources; keep today's version focused.

## Guided Practice — Small Read-Only Blog Server

Build a server with:

1. `GET /` returning a short HTML page;
2. `GET /health` returning JSON;
3. `GET /posts` returning an in-memory post array;
4. every other route returning a JSON 404;
5. correct `Content-Type` values;
6. one concise request log without secrets;
7. `EADDRINUSE` reporting;
8. graceful `SIGINT` handling.

Test every route with `curl -i`, including an unknown route and a non-GET method.

## Independent Exercises

1. Return plain text, HTML, and JSON from separate paths.
2. Echo safe request metadata as JSON.
3. Read two query parameters with `URL.searchParams`.
4. Add a reusable `sendJson` helper.
5. Compare string length and byte length for a Bangla JSON response.
6. Trigger `EADDRINUSE` and explain the error.
7. Observe the server's request and response stream types.
8. Stop the server with Ctrl+C and verify the port can be reused.

## Common Mistakes and Debugging Advice

- Run the server and `curl` in separate terminals.
- Always finish each ordinary response with `end`.
- Return after sending so later code cannot send a second response.
- Set a representation-appropriate `Content-Type`.
- Do not calculate byte lengths with `string.length`.
- Treat the URL, headers, method, and body as untrusted.
- Do not log authorization and cookie headers casually.
- A port already in use is an operational error, not a routing error.

## Review Questions

1. What objects reach the `createServer` callback?
2. Which stream role does each HTTP object play?
3. What normally appears in `request.url`?
4. Why provide a base to the `URL` constructor?
5. What does `response.end` do?
6. Why does a JSON response need a content type?
7. Why use `Buffer.byteLength` for content length?
8. What does `EADDRINUSE` indicate?

## Completion Checklist

- [ ] The raw server starts and responds.
- [ ] Request method, path, query, and selected headers are inspected.
- [ ] Text, HTML, and JSON responses work.
- [ ] Unknown routes return 404.
- [ ] Every response has a correct content type.
- [ ] Startup errors and Ctrl+C are handled.
- [ ] All exercises and review questions are complete.

## Official References

- Node.js HTTP API: https://nodejs.org/api/http.html
- Node.js URL API: https://nodejs.org/api/url.html
- Node.js process signals: https://nodejs.org/api/process.html#signal-events

## What to Send for Review

Send `server.ts`, `curl -i` output for every route, the port-conflict output, graceful-shutdown output, exercises, and review answers. Next: **Day 39 — Manual Routing and JSON Body Parsing**.

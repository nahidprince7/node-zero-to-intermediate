# Day 42 — Express Setup, First App, and Routing

> Core lesson: about 60–90 minutes. Rebuild the outer HTTP layer with Express 5 while keeping the protocol knowledge from raw Node.

## Learning Objectives

You will learn to:

- install Express 5 in a strict TypeScript project;
- create and start an Express application;
- register routes by method and path;
- send JSON, text, and bodyless responses;
- parse JSON with built-in middleware;
- identify what Express abstracts and what remains your responsibility.

## Setup

Express 5 requires Node 18 or newer. Use the active LTS selected earlier:

```bash
node --version
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-42/src
cd practice/day-42
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install express
npm install --save-dev typescript @types/node @types/express tsx
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.start="tsx src/server.ts"
```

Use a strict NodeNext `tsconfig.json`. The Express runtime and its community-maintained TypeScript declarations are separate packages.

## 0–15 Minutes — First Express App

Create `src/server.ts`:

```ts
import express from "express";

const app = express();
const host = "127.0.0.1";
const port = 3000;

app.get("/", (_request, response) => {
  response.type("text").send("Hello from Express\n");
});

const server = app.listen(port, host, () => {
  console.log(`Server listening at http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error("Server error:", error.message);
  process.exitCode = 1;
});
```

Test it:

```bash
npm run dev
curl -i http://127.0.0.1:3000/
```

`app` is an Express application. `app.listen` ultimately creates and starts a Node HTTP server, and returns that server. Express sits above—not instead of—Node HTTP.

## 15–30 Minutes — Route by Method and Path

```ts
interface Post {
  id: number;
  title: string;
  published: boolean;
}

const posts: Post[] = [
  { id: 1, title: "Raw Node", published: true },
  { id: 2, title: "Express", published: false },
];

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/posts", (_request, response) => {
  response.status(200).json({ data: posts });
});

app.post("/posts", (_request, response) => {
  response.status(501).json({
    error: { code: "NOT_IMPLEMENTED", message: "Coming shortly" },
  });
});
```

Express matches the method and route path, then invokes the handler with enhanced Node request and response objects. Route registration order matters when multiple patterns can match.

Return after sending when more code follows:

```ts
if (posts.length === 0) {
  response.status(404).json({ error: { message: "No posts" } });
  return;
}
```

Express cannot prevent your code from attempting a second response.

## 30–42 Minutes — Parse JSON

Register the parser before routes that need it:

```ts
app.use(express.json({ limit: "100kb" }));
```

Then inspect a body:

```ts
app.post("/posts", (request, response) => {
  const input: unknown = request.body;

  console.log(input);
  response.status(201).json({ data: input });
});
```

`express.json` checks applicable content types, reads and parses the body, applies a size limit, and assigns the result to `request.body`. Parsed content is still untrusted. Express parsing is not domain validation.

Do not register multiple body parsers without understanding which content types and routes each one handles.

## 42–52 Minutes — Response Methods

Common response methods map to raw HTTP operations:

```ts
response.status(200).json({ data: posts });
response.status(200).type("text").send("ready\n");
response.status(201).location(`/posts/${post.id}`).json({ data: post });
response.status(204).send();
```

- `status` selects the status code;
- `set`/`header` sets headers;
- `type` sets a content type;
- `json` serializes and sends JSON;
- `send` sends a response and ends it;
- `location` sets the `Location` header;
- `end` ends without a convenience body conversion.

You still choose the method semantics, status, representation, validation, and public error shape.

## 52–60 Minutes — 404 and Shutdown

Place a catch-all middleware after known routes:

```ts
app.use((request, response) => {
  response.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${request.method} ${request.path}`,
    },
  });
});
```

Add graceful local shutdown:

```ts
process.on("SIGINT", () => {
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
});
```

Error-handling middleware comes on Day 45. For now, observe Express's default behavior for malformed JSON, but do not mistake it for the final API error contract.

## Guided Practice — First Express Posts API

Create:

1. `GET /` returning text;
2. `GET /health` returning JSON;
3. `GET /posts` returning the in-memory collection;
4. `POST /posts` echoing parsed JSON with 201 and a temporary location;
5. a 100 KiB JSON limit;
6. a final JSON 404;
7. startup error reporting and Ctrl+C shutdown.

Compare its code with the equivalent parts of Day 41. Write down exactly what Express removed and what decisions it did not make.

## Independent Exercises

1. Add `GET /about` returning plain text.
2. Add a 204 route and confirm it has no body.
3. Send valid JSON, malformed JSON, text, and an oversized body.
4. Move `express.json` below the POST route and explain the result.
5. Put the catch-all 404 above a route and explain the result.
6. Inspect `response.headersSent` before and after sending.
7. Confirm `app.listen` returns a Node HTTP server.
8. List five raw Node tasks Express now performs.

## Common Mistakes and Debugging Advice

- Install `express` as a runtime dependency and types as dev dependencies.
- Register parsers before handlers that use parsed bodies.
- Treat `request.body` as untrusted input.
- Route and middleware order is executable behavior.
- Return after an early response.
- A final 404 is ordinary middleware, not error middleware.
- Do not send a body with 204.
- Express simplifies HTTP mechanics; it does not design the API for you.

## Review Questions

1. How does Express relate to Node's HTTP server?
2. How does Express identify a route?
3. What does `express.json` do?
4. What does it not do?
5. Why does registration order matter?
6. How do `json`, `send`, and `end` differ?
7. Where should the catch-all 404 be registered?
8. Which HTTP choices remain application responsibilities?

## Completion Checklist

- [ ] Express 5 runs in strict TypeScript.
- [ ] Method-specific routes return expected representations.
- [ ] JSON parsing has an explicit limit.
- [ ] Parsed bodies remain typed as untrusted at validation boundaries.
- [ ] 404 handling comes after known routes.
- [ ] Startup and shutdown behavior work.
- [ ] Raw Node and Express implementations are compared.
- [ ] All exercises and review questions are complete.

## Official References

- Express installation: https://expressjs.com/en/5x/starter/installing.html
- Express basic routing: https://expressjs.com/en/5x/starter/basic-routing.html
- Express 5 API: https://expressjs.com/en/5x/api.html

## What to Send for Review

Send the source, dependency list, route test output, malformed and oversized body output, raw-versus-Express comparison, exercises, and review answers. Next: **Day 43 — Route Params, Query Params, `req`, and `res`**.

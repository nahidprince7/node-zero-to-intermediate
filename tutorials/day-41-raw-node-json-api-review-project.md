# Day 41 — Review Project: Build a Raw Node JSON API

> Review lesson: about 90–120 minutes. Build from an empty folder before consulting Days 38–40.

## Learning Objectives

You will prove that you can:

- assemble a raw Node HTTP server independently;
- route three or more endpoints by method and pathname;
- parse, limit, and validate JSON request bodies;
- return accurate status codes, headers, and bodies;
- centralize expected and unexpected errors;
- test an API contract systematically.

## Rules for This Review

1. Work from memory for the first 45 minutes.
2. Use only Node built-ins—no Express and no body-parser package.
3. Keep data in memory; persistence is not today's concern.
4. Do not copy the Day 39 server. Consult it only after writing a first attempt.
5. Finish one working vertical slice before adding optional features.

## Setup

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-41/src
cd practice/day-41
npm init -y
npm pkg set private=true --json
npm pkg set type=module
npm install --save-dev typescript @types/node tsx
npm pkg set scripts.dev="tsx watch src/server.ts"
npm pkg set scripts.start="tsx src/server.ts"
```

Use the previous strict NodeNext `tsconfig.json`.

## The Required API

Build this contract:

| Method | Path | Success | Purpose |
|---|---|---:|---|
| `GET` | `/health` | 200 | Return service status and uptime |
| `GET` | `/posts` | 200 | Return every post |
| `GET` | `/posts/:id` | 200 | Return one post; 404 if absent |
| `POST` | `/posts` | 201 | Validate and create a post |

Use this domain model:

```ts
interface Post {
  id: number;
  title: string;
  body: string;
  published: boolean;
  createdAt: string;
}

interface CreatePostInput {
  title: string;
  body: string;
  published: boolean;
}
```

The process may reset the array on restart. That limitation must be documented, not hidden.

## Required Behavior

### Routing

- Match method and complete pathname.
- Parse the URL with `new URL`.
- Accept only positive safe-integer IDs.
- Return 404 for an unknown route or resource.
- Return 405 plus `Allow` when the path is known but the method is unsupported.

### Request bodies

- Require `Content-Type: application/json` for `POST /posts`.
- Limit the actual received body to 100 KiB.
- Reject an empty body.
- Distinguish malformed JSON from structurally invalid data.
- Treat parsed JSON as `unknown` until validated.
- Require trimmed title and body text; require a Boolean `published` value.

### Responses

- Send `application/json; charset=utf-8` for JSON.
- Use byte length if setting `Content-Length`.
- Return `Location: /posts/:id` after creation.
- Never send a second response for one request.
- Never expose an unexpected stack trace or internal error message.

Use one stable error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Post data is invalid",
    "details": []
  }
}
```

`details` can remain empty today. Day 50 will design field-level validation errors.

## Suggested Build Order

### 0–20 Minutes — Server and response helpers

Create the server, listen on `127.0.0.1:3000`, add a JSON response helper, and make `/health` work. Handle `EADDRINUSE` and Ctrl+C.

### 20–40 Minutes — Read routes

Add the collection and single-post routes. Test IDs such as `1`, `0`, `-1`, `1.5`, `abc`, and `1/more`.

### 40–65 Minutes — Body processing

Implement a byte-limited body reader, JSON parser, and `CreatePostInput` guard. Add creation only after each layer can fail clearly.

### 65–80 Minutes — Error boundary

Create an `HttpError` carrying a public status and code. Catch rejected request handling in the `createServer` callback. Log unexpected failures once and return a generic 500.

### 80–100 Minutes — Contract tests

Run every case in the test matrix. Fix behavior rather than changing expected results to match bugs.

## Minimum Test Matrix

```bash
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/posts
curl -i http://127.0.0.1:3000/posts/1
curl -i http://127.0.0.1:3000/posts/999
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Review API","body":"Built without Express","published":false}'
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: application/json' \
  -d '{bad}'
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Content-Type: text/plain' \
  -d 'hello'
curl -i -X PUT http://127.0.0.1:3000/posts
```

Add tests for an empty body, wrong field types, missing fields, unknown route, oversized body, and query string.

## Stretch Goals

Only begin these after every required test passes:

1. `DELETE /posts/:id` with a bodyless 204.
2. `PATCH /posts/:id` with separate partial-input validation.
3. Filtering `GET /posts?published=true`.
4. `HEAD /posts` with representation headers but no body.
5. An ETag and conditional GET.
6. A small `.http` file containing the test matrix.

## Self-Review Checklist

- [ ] The project uses only Node built-ins at runtime.
- [ ] At least four required routes work.
- [ ] URL path and query are not confused.
- [ ] IDs are strictly validated.
- [ ] Actual received bytes are limited.
- [ ] JSON syntax and value shape are checked separately.
- [ ] Every ordinary code path ends or delegates exactly once.
- [ ] 201 includes `Location`.
- [ ] 405 includes `Allow`.
- [ ] 500 responses hide internal details.
- [ ] Shutdown and port-conflict behavior are tested.
- [ ] The complete test matrix passes.

## Reflection Questions

1. Which raw concern required the most code?
2. Where did stream knowledge matter?
3. Which behavior was easiest to forget?
4. What code is infrastructure rather than blog-domain logic?
5. Which pieces should a framework supply?
6. Which responsibilities remain yours even with a framework?

## Official References

- Node.js HTTP API: https://nodejs.org/api/http.html
- Node.js stream API: https://nodejs.org/api/stream.html
- HTTP Semantics: https://www.rfc-editor.org/rfc/rfc9110

## What to Send for Review

Send the complete source, endpoint table, all test output, one deliberate unexpected-error test, self-review checklist, and reflection answers. Next: **Day 42 — Express Setup, First App, and Routing**.

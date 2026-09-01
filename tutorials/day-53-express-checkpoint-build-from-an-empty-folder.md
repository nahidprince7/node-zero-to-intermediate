# Day 53 — Express Checkpoint: Build an API from an Empty Folder

> Review lesson: about 90–120 minutes. Build unaided first; use Days 42–52 only during the review pass.

## Learning Objectives

You will prove that you can:

- initialize a strict Express 5 TypeScript project;
- design and implement a small resource API;
- structure routers, controllers, services, and middleware;
- validate every HTTP input boundary;
- return a consistent success and error contract;
- test and harden the result systematically.

## Rules

1. Start from an empty `practice/day-53` directory.
2. Do not copy Day 47.
3. Work without notes for the first hour.
4. Use an in-memory store; database work begins later.
5. Stop adding features if required failures are inconsistent.
6. Record problems you solved instead of hiding them.

## Required Product — Reading List API

Use a different domain so you cannot rename the posts example mechanically:

```ts
interface ReadingItem {
  id: number;
  title: string;
  url: string;
  status: "unread" | "reading" | "finished";
  createdAt: string;
}
```

Required endpoints:

| Method | Path | Success |
|---|---|---:|
| `GET` | `/health` | 200 |
| `GET` | `/reading-items` | 200 |
| `GET` | `/reading-items/:itemId` | 200 |
| `POST` | `/reading-items` | 201 + `Location` |
| `PATCH` | `/reading-items/:itemId` | 200 |
| `DELETE` | `/reading-items/:itemId` | 204 |

Support `GET /reading-items?status=unread|reading|finished` and return 200 with an empty array when nothing matches.

## Required Architecture

```text
src/
├── app.ts
├── server.ts
├── errors/
├── middleware/
└── reading-items/
    ├── reading-item.types.ts
    ├── reading-item.validation.ts
    ├── reading-item.service.ts
    ├── reading-item.controller.ts
    └── reading-item.router.ts
```

- `app.ts` composes without listening;
- `server.ts` owns port and shutdown;
- router maps methods, paths, and route middleware;
- controller translates HTTP input/output;
- service owns in-memory items and rules;
- validation converts unknown input into a trusted value;
- error middleware owns the public error envelope.

## Input Contract

Create input:

```json
{
  "title": "Node Streams Guide",
  "url": "https://nodejs.org/api/stream.html",
  "status": "unread"
}
```

Rules:

- title is trimmed and contains 3–150 characters;
- URL must parse and use `http:` or `https:`;
- status is one of the three exact literals;
- unknown fields are rejected;
- clients cannot set `id` or `createdAt`;
- PATCH accepts supplied valid fields but rejects `{}`;
- route IDs are positive safe integers;
- JSON body size is limited to 50 KiB.

Structural validation is separate from the service rule that URLs must be unique. Return 409 for a duplicate.

## Error Contract

Every failure returns:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [],
    "requestId": "generated-id"
  }
}
```

Required distinctions:

- malformed JSON → 400;
- invalid ID/query syntax → 400;
- missing item → 404;
- unknown route → 404 with another code;
- duplicate URL → 409;
- oversized body → 413;
- wrong media type → 415;
- invalid fields → 422;
- unsupported method on known collection → 405 plus `Allow`;
- unexpected error → generic 500.

## Suggested Timeline

### 0–20 Minutes — Initialize and compose

Create package metadata, dependencies, strict TypeScript config, scripts, app/server split, JSON parser, and health route.

### 20–45 Minutes — Read operations

Build the service, collection filtering, ID conversion, single-resource route, and not-found behavior.

### 45–75 Minutes — Write operations

Implement create, PATCH, delete, separate input validators, uniqueness, statuses, and `Location`.

### 75–95 Minutes — Cross-cutting behavior

Add request IDs, safe completion logs, CORS allowlist, Helmet, 404, parser-error mapping, and unexpected error handling.

### 95–120 Minutes — Contract testing

Create a `.http` file and exercise every success, failure, and boundary case.

## Security Requirements

- exact local CORS allowlist;
- `helmet` enabled and `x-powered-by` disabled;
- safe logs without full headers or bodies;
- no real `.env` committed;
- no unbounded request bodies or queries;
- no open redirect or remote fetching of submitted URLs;
- supported dependencies and committed lockfile.

Saving a URL is not permission to fetch it. Server-side fetching would introduce SSRF risks and is outside this checkpoint.

## Test Matrix Minimum

Test at least:

1. every successful endpoint;
2. empty filtered collection;
3. six ID edge cases;
4. malformed and oversized JSON;
5. every invalid field individually;
6. several invalid fields together;
7. empty PATCH and valid partial PATCH;
8. duplicate URL;
9. unknown route and unsupported method;
10. allowed/disallowed CORS preflight;
11. deliberate unexpected error without leaked details;
12. graceful shutdown and port conflict.

## Self-Review

After the first attempt, use Days 42–52 and answer:

1. Which error path was missing?
2. Did any controller own business rules?
3. Did any service import Express?
4. Can the app be imported without listening?
5. Can one request be answered twice?
6. Are all external values bounded?
7. Does any log or response leak data?
8. Which behavior needs automated tests later?

## Completion Checklist

- [ ] Project starts from a clean installation.
- [ ] All six resource operations work.
- [ ] Architecture boundaries are respected.
- [ ] Create and PATCH validation differ correctly.
- [ ] Error codes and statuses are consistent.
- [ ] CORS, headers, limits, and logs are hardened.
- [ ] Full `.http` matrix is repeatable.
- [ ] Review findings and fixes are recorded.

## Official References

- Express 5 API: https://expressjs.com/en/5x/api.html
- Express middleware: https://expressjs.com/en/guide/using-middleware.html
- Express security guidance: https://expressjs.com/en/advanced/best-practice-security.html

## What to Send for Review

Send the complete project, tree, contract table, `.http` suite, test output, security checks, self-review findings, and final checklist. Next: **Day 54 — Why NestJS Exists and Project Bootstrap**.

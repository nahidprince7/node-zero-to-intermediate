# Day 40 — HTTP Fundamentals: Methods, Status Codes, Headers, and Bodies

> Core lesson: about 60–90 minutes. Design and inspect HTTP messages deliberately before building a larger API.

## Learning Objectives

You will learn to:

- describe the structure of HTTP requests and responses;
- choose methods by operation semantics;
- select useful status codes accurately;
- use representation, negotiation, location, and caching headers;
- distinguish safety from idempotency;
- test message details with `curl`.

## Setup

Continue the Day 39 raw Node API. Keep two terminals open: one for the server and one for `curl`.

```bash
cd /home/nahid/Projects/Learning/app/practice/day-39
npm run dev
```

This lesson is about the protocol contract. The same concepts will apply in raw Node, Express, NestJS, browsers, mobile clients, and other languages.

## 0–12 Minutes — Messages and Representations

An HTTP request contains:

```text
method + request target + protocol version
headers
blank line
optional body
```

A response contains:

```text
protocol version + status code
headers
blank line
optional body
```

Use verbose `curl` output to see both directions:

```bash
curl -v http://127.0.0.1:3000/posts
```

HTTP transfers representations of resources. A post resource might be represented as JSON now and HTML elsewhere. The resource is the concept; the bytes in one response are its representation.

Headers are metadata about the message, representation, connection, caching, authentication, and more. The body carries the optional payload. A header is not a suitable place for an arbitrarily large application document.

## 12–27 Minutes — Method Semantics

| Method | Typical meaning | Safe | Idempotent |
|---|---|---:|---:|
| `GET` | Retrieve a representation | Yes | Yes |
| `HEAD` | Retrieve the headers a corresponding GET would send | Yes | Yes |
| `POST` | Submit/create or trigger resource-specific processing | No | No guarantee |
| `PUT` | Create or completely replace at a known URI | No | Yes |
| `PATCH` | Partially modify | No | No general guarantee |
| `DELETE` | Remove the target resource | No | Yes |
| `OPTIONS` | Describe communication options | Yes | Yes |

“Safe” means the client is not requesting a state change. Logging and metrics may still occur. “Idempotent” means repeating the same intended request has the same intended effect as making it once; the response can still differ because time and server state move on.

Idempotent does not mean harmless, and it does not mean the operation returns the same status forever. Repeating `DELETE /posts/7` should not delete additional resources, even if the first response is 204 and a later response is 404.

Do not use `GET` for deletion or publication merely because it is easy to trigger from a browser.

## 27–42 Minutes — Status Codes as Outcomes

Choose the code that describes the result, then send a body only when appropriate.

| Code | Meaning in this course | Example |
|---:|---|---|
| `200 OK` | Successful response with a representation | Read or update a post |
| `201 Created` | A new resource was created | Create a post |
| `204 No Content` | Success with no response body | Delete a post |
| `400 Bad Request` | Request syntax or framing is invalid | Malformed JSON |
| `401 Unauthorized` | Authentication is missing or invalid | Bad/absent token |
| `403 Forbidden` | Identity is known but action is not allowed | Edit another author's post |
| `404 Not Found` | Target resource or route is unavailable | Missing post |
| `405 Method Not Allowed` | Target exists but method is unsupported | `PUT` on a read-only route |
| `409 Conflict` | Request conflicts with current resource state | Duplicate unique slug |
| `413 Content Too Large` | Request content exceeds the accepted limit | Oversized JSON body |
| `415 Unsupported Media Type` | Payload format is unsupported | `text/plain` where JSON is required |
| `422 Unprocessable Content` | Syntax is understood but data rules fail | Title is missing |
| `429 Too Many Requests` | Rate limit was exceeded | Too many login attempts |
| `500 Internal Server Error` | Unexpected server failure | Unhandled infrastructure error |
| `503 Service Unavailable` | Service is temporarily unable to handle work | Dependency outage/readiness failure |

`401` is historically named “Unauthorized,” but it represents an authentication problem. `403` represents refusal despite understanding who is asking or regardless of authentication changes.

Do not return `200` for every outcome with an `{ error: ... }` body. Clients, proxies, monitoring, retries, and caches use status codes.

## 42–54 Minutes — Headers That Define the Contract

Common request headers:

- `Accept`: representations the client can process;
- `Content-Type`: media type of the request body;
- `Authorization`: credentials for the request;
- `If-None-Match`: conditional cache validation;
- `Origin`: origin involved in a browser cross-origin request.

Common response headers:

- `Content-Type`: media type of the response body;
- `Content-Length`: exact body length in bytes when supplied;
- `Location`: URI of a created resource or redirect target;
- `Allow`: methods supported by the target, especially with 405;
- `Cache-Control`: caching permissions and freshness policy;
- `ETag`: validator for a particular representation;
- `WWW-Authenticate`: authentication challenge associated with 401.

Header names are case-insensitive. Media types may have parameters:

```text
Content-Type: application/json; charset=utf-8
```

`Accept` and `Content-Type` answer different questions. `Accept` describes what the client wants back; `Content-Type` describes what the sender actually put in this message's body.

After creating a post, return its address:

```ts
response.setHeader("Location", `/posts/${post.id}`);
sendJson(response, 201, { data: post });
```

For a method mismatch on a known route:

```ts
response.setHeader("Allow", "GET, POST");
sendJson(response, 405, {
  error: { message: "Method not allowed" },
});
```

## 54–65 Minutes — Bodies, `HEAD`, and Bodyless Responses

A response to `HEAD` must not include a message body, while its headers should describe what a corresponding `GET` would have returned.

Statuses such as 204 and 304 do not carry a response body. Do not send JSON with 204:

```ts
response.statusCode = 204;
response.end();
```

Similarly, do not assume every request method normally has a body. Servers must define which endpoints accept content and in which format.

Implement `HEAD /posts` without sending the JSON bytes:

```ts
if (method === "GET" || method === "HEAD") {
  const body = JSON.stringify({ data: posts });

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(method === "HEAD" ? undefined : body);
  return;
}
```

Test it:

```bash
curl -i http://127.0.0.1:3000/posts
curl -I http://127.0.0.1:3000/posts
```

## 65–75 Minutes — Caching and Conditional Requests

Caching is part of HTTP, not only a performance trick inside application code. A server can attach an entity tag to a representation:

```ts
import { createHash } from "node:crypto";

function createEtag(body: string): string {
  const digest = createHash("sha256").update(body).digest("base64url");
  return `"${digest}"`;
}
```

Then compare the client's validator:

```ts
const body = JSON.stringify({ data: posts });
const etag = createEtag(body);

response.setHeader("ETag", etag);
response.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

if (request.headers["if-none-match"] === etag) {
  response.statusCode = 304;
  response.end();
  return;
}

sendJson(response, 200, { data: posts });
```

For this exercise, adjust `sendJson` so previously set headers are preserved, which `writeHead` does when its provided header names do not replace them. In production, use a well-tested ETag and conditional-request implementation that handles the full HTTP grammar.

A 304 tells the client to reuse its cached representation, so it has no response body.

## 75–90 Minutes — Inspect a Complete Exchange

Create a post and inspect every protocol choice:

```bash
curl -i -X POST http://127.0.0.1:3000/posts \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"title":"HTTP Contract","published":false}'
```

Ask:

1. Does the method match the intended action?
2. Does the request media type describe the body?
3. Does the status describe the outcome?
4. Does the response media type describe its body?
5. Does a created response include `Location`?
6. Are bodyless statuses actually bodyless?
7. Can clients distinguish authentication, authorization, validation, and conflict failures?

## Guided Practice — Strengthen the Raw API Contract

Update Day 39 so that:

1. `GET /posts` returns 200 JSON;
2. `HEAD /posts` returns matching representation headers without a body;
3. `POST /posts` returns 201 and `Location`;
4. `DELETE /posts/:id` returns 204 without a body;
5. known paths with unsupported methods return 405 and `Allow`;
6. malformed JSON, invalid data, unsupported media, and oversized bodies use distinct statuses;
7. unknown resources return 404;
8. unexpected failures return a generic 500.

Document each endpoint in a small table containing method, path, success code, request body, response body, and likely failure codes.

## Independent Exercises

1. Classify each standard method as safe and/or idempotent.
2. Demonstrate the difference between 401 and 403 with blog examples.
3. Add `Location` to successful creation.
4. Add a bodyless 204 delete response.
5. Distinguish unknown route 404 from known-route 405.
6. Implement and test `HEAD /posts`.
7. Compare `Accept` and `Content-Type` with two `curl` requests.
8. Add an ETag and test a conditional GET that returns 304.

## Common Mistakes and Debugging Advice

- Methods communicate semantics, not merely routing labels.
- Safe and idempotent are different properties.
- Do not put state-changing behavior behind `GET`.
- Do not use 200 for every success and failure.
- 401 and 403 are not interchangeable.
- `Accept` describes the desired response; `Content-Type` describes this body.
- 204 and 304 responses do not carry bodies.
- A 405 response should identify supported methods with `Allow`.
- Compute byte lengths from encoded bytes, not character counts.
- CORS is a browser access policy layered on HTTP; it is not authentication.

## Review Questions

1. What are the main parts of an HTTP request and response?
2. What is the difference between a resource and a representation?
3. How do safety and idempotency differ?
4. When should creation return 201 instead of 200?
5. How do 400, 415, and 422 differ in this API?
6. How do 401 and 403 differ?
7. What information belongs in `Location` and `Allow`?
8. Why do HEAD, 204, and 304 require special body handling?
9. What do `ETag` and `If-None-Match` accomplish together?

## Completion Checklist

- [ ] Request and response message anatomy is understood.
- [ ] Methods match their intended semantics.
- [ ] Safety and idempotency are distinguished.
- [ ] Success and failure status codes are deliberate.
- [ ] Representation headers are correct.
- [ ] HEAD and bodyless statuses behave correctly.
- [ ] Creation supplies `Location` and 405 supplies `Allow`.
- [ ] The API contract table and all exercises are complete.

## Official References

- HTTP Semantics (RFC 9110): https://www.rfc-editor.org/rfc/rfc9110
- MDN HTTP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview
- Node.js HTTP API: https://nodejs.org/api/http.html

## What to Send for Review

Send the updated server, endpoint contract table, representative `curl -i` output, HEAD/204/304 tests, method-property explanations, exercises, and review answers. Next: **Day 41 — Build a Raw Node JSON API with Three Working Endpoints**.

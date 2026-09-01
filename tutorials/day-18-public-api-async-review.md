# Day 18 ↻ — Fetch, Process, and Safely Handle Public API Data

> Review project: about 60–90 minutes. Internet access is required. This lesson uses Node.js's built-in stable `fetch` API and JSONPlaceholder's public practice API.

## Learning Objectives

You will combine Days 13–17 to:

- request JSON over HTTP with `fetch`;
- distinguish network rejection from non-success HTTP status;
- parse and validate external data defensively;
- run independent requests concurrently;
- tolerate optional-request failures;
- create a useful report with clear error ownership.

## Setup

Verify Node and create the project:

```bash
node --version
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-18/src
cd practice/day-18
code .
```

Create `package.json`:

```json
{
  "name": "day-18-api-report",
  "private": true,
  "type": "module"
}
```

Node.js provides `fetch` globally in supported modern releases, so no npm package is needed.

## 0–18 Minutes — Make a Safe Request

Create `src/api.js`:

```js
const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
```

`fetch` rejects for failures such as unusable network/DNS. It does not reject merely because the server returned 404 or 500, so check `response.ok` yourself.

Create `src/app.js`:

```js
import { fetchJson } from "./api.js";

async function main() {
  const post = await fetchJson("/posts/1");
  console.log(post);
}

main().catch((error) => {
  console.error("Application failed:", error.message);
  process.exitCode = 1;
});
```

Run:

```bash
node src/app.js
```

Test `/posts/999999` and a deliberately invalid hostname separately. Compare HTTP failure with network failure.

## 18–32 Minutes — Validate External Data

Never assume external JSON has the expected shape. Add to `src/api.js`:

```js
function isPost(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    Number.isInteger(value.id) &&
    Number.isInteger(value.userId) &&
    typeof value.title === "string" &&
    typeof value.body === "string"
  );
}

export async function fetchPost(id) {
  const data = await fetchJson(`/posts/${id}`);

  if (!isPost(data)) {
    throw new Error(`Invalid post data for ID ${id}`);
  }

  return data;
}
```

This is manual runtime validation. TypeScript types later help your own code but do not automatically validate network input.

Add similar lightweight checks for arrays returned from `/posts?userId=1` and `/posts/1/comments`.

## 32–48 Minutes — Concurrent Report

JSONPlaceholder supports posts, users, and nested comments. Build a report for one post:

```js
async function buildPostReport(postId) {
  const post = await fetchPost(postId);

  const [user, comments] = await Promise.all([
    fetchJson(`/users/${post.userId}`),
    fetchJson(`/posts/${post.id}/comments`),
  ]);

  return {
    id: post.id,
    title: post.title,
    author: user.name,
    commentCount: comments.length,
    commentEmails: comments.map((comment) => comment.email),
  };
}
```

The post request comes first because its IDs are needed. User and comment requests are independent after that, so they run concurrently.

Print the report with `console.log` and `console.table` for its email list.

## 48–60 Minutes — Partial Failure and Timeout

For optional panels, use `allSettled`:

```js
const outcomes = await Promise.allSettled([
  fetchJson("/posts?userId=1"),
  fetchJson("/users/1/todos"),
  fetchJson("/invalid-resource"),
]);

for (const outcome of outcomes) {
  if (outcome.status === "fulfilled") {
    console.log("Loaded items:", outcome.value.length);
  } else {
    console.error("Optional request failed:", outcome.reason.message);
  }
}
```

Optional timeout challenge using built-in abort support:

```js
export async function fetchJsonWithTimeout(path, milliseconds) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: AbortSignal.timeout(milliseconds),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

Unlike a plain `Promise.race` timeout, the abort signal asks `fetch` to cancel the request.

## Independent Project Requirements

Create a CLI-style report that:

1. fetches a chosen user;
2. fetches that user's posts;
3. fetches comments for at least three posts concurrently;
4. calculates total and average comment counts;
5. displays title and comment count with `console.table`;
6. handles missing user, bad status, malformed data, and network failure;
7. uses one clear application-level catch;
8. includes at least one `allSettled` partial-success section;
9. records request timing with `console.time`;
10. never leaves a floating Promise.

## Common Mistakes and Debugging Advice

- Always check `response.ok` before trusting the body as success data.
- `response.json()` is asynchronous and may itself fail.
- External data requires runtime checks even in a future TypeScript project.
- Do not run dependent requests concurrently before required IDs exist.
- Limit concurrency for large collections; three requests are safe practice, hundreds may not be.
- A public test API may be unavailable temporarily; distinguish your code bug from service/network failure.

## Review Questions

1. When does `fetch` reject?
2. Why check `response.ok`?
3. Why validate parsed JSON?
4. Which report requests are dependent?
5. Which can run concurrently?
6. When is `allSettled` useful here?
7. How does an abort timeout differ from a plain race?
8. Where is the final application error handled?

## Completion Checklist

- [ ] A single resource loads and validates.
- [ ] The post report loads independent resources concurrently.
- [ ] The independent project meets all ten requirements.
- [ ] Success, HTTP failure, and network failure were tested.
- [ ] No rejected Promise is left unhandled.

## Official References

- Node.js global `fetch`: https://nodejs.org/api/globals.html#fetch
- JSONPlaceholder guide: https://jsonplaceholder.typicode.com/guide/

## What to Send for Review

Send all source files, success output, sanitized failure output, timing results, review answers, and any API issue. Next: **Day 19 — Your First TypeScript Project**.

# Day 16 — Error Handling in Async Code

> Core lesson: about 60 minutes. Every rejected Promise must have a deliberate path to handling or propagation.

## Learning Objectives

You will learn to:

- handle awaited rejections with `try`/`catch`;
- use `finally` for cleanup;
- preserve useful error context when rethrowing;
- distinguish recovery from propagation;
- prevent floating Promises and unhandled rejections;
- design a safe async application boundary.

## Prerequisites and Setup

Recall Promise rejection, async functions, `await`, and `main().catch(...)`.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-16
cd practice/day-16
code .
```

Create `package.json`:

```json
{
  "name": "day-16-async-errors",
  "private": true,
  "type": "module"
}
```

## 0–18 Minutes — `try` and `catch`

Create `try-catch.js`:

```js
function findPostById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(id) || id <= 0) {
        reject(new Error("Post ID must be a positive integer"));
        return;
      }

      resolve({ id, title: "Handling Async Errors" });
    }, 200);
  });
}

async function showPost(id) {
  try {
    const post = await findPostById(id);
    console.log(post);
  } catch (error) {
    console.error("Post lookup failed:", error.message);
  }
}

await showPost(1);
await showPost(-1);
```

When an awaited Promise rejects, execution jumps to the nearest matching `catch`. Code after the failing await inside `try` is skipped.

Keep the `try` block focused. A huge `try` can hide which operation failed.

## 18–28 Minutes — `finally` and Cleanup

```js
let isLoading = false;

async function loadPost(id) {
  isLoading = true;

  try {
    return await findPostById(id);
  } catch (error) {
    console.error(error.message);
    return null;
  } finally {
    isLoading = false;
    console.log("Loading finished", { isLoading });
  }
}

console.log(await loadPost(-1));
```

`finally` runs after success, handled failure, or an early return. It is useful for cleanup such as releasing a resource or resetting state.

Do not return a new value from `finally`; that can unexpectedly override a prior return or error.

## 28–42 Minutes — Recover or Rethrow

Sometimes a function can recover:

```js
async function getOptionalPost(id) {
  try {
    return await findPostById(id);
  } catch (error) {
    console.warn("Using empty result:", error.message);
    return null;
  }
}
```

Sometimes it must add context and propagate:

```js
async function getRequiredPost(id) {
  try {
    return await findPostById(id);
  } catch (error) {
    throw new Error(`Unable to load required post ${id}`, {
      cause: error,
    });
  }
}
```

At the application boundary:

```js
async function main() {
  const post = await getRequiredPost(-1);
  console.log(post);
}

main().catch((error) => {
  console.error(error.message);

  if (error.cause instanceof Error) {
    console.error("Original cause:", error.cause.message);
  }

  process.exitCode = 1;
});
```

Use fallback values only when they are valid for the requirement. Returning `null` for a required post may merely move the crash elsewhere.

## 42–52 Minutes — Unhandled and Floating Promises

Create `unhandled.js`:

```js
async function failLater() {
  throw new Error("Async failure");
}

failLater();
console.log("A rejected Promise was started without handling");
```

This Promise is **floating**: it was neither awaited, returned, nor given a rejection handler. Depending on Node.js version and configuration, an unhandled rejection may terminate the process or be reported severely. Never depend on global behavior to save the operation.

Valid patterns:

```js
await failLater();
```

```js
return failLater();
```

```js
failLater().catch((error) => {
  console.error(error.message);
});
```

Use a process-level listener only as last-resort observability, not normal recovery:

```js
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
```

If this listener fires, the program has a bug in its Promise ownership.

## 52–60 Minutes — Guided Practice

Create `publish-post.js` with async functions that:

1. validate a post ID;
2. load a post;
3. reject if it is already published;
4. save a published copy;
5. log cleanup in `finally`;
6. wrap lower-level failure with `cause`;
7. handle the final failure once in `main().catch`.

Test invalid ID, already-published, simulated save failure, and success.

## Independent Exercises

1. Wrap Day 15's blog flow in focused `try`/`catch` blocks.
2. Write `safeDivideAsync` that recovers with `null` only for division by zero.
3. Add context and `cause` while rethrowing a simulated database error.
4. Find and fix three deliberately floating Promises.
5. Demonstrate that `finally` runs for both fulfillment and rejection.

## Common Mistakes and Debugging Advice

- `try` catches a rejection only when the Promise is awaited inside it.
- Logging and silently continuing is not always handling.
- Preserve the original error with `cause` when wrapping.
- Avoid duplicate logging at every layer; add context, then let a boundary log once.
- Never expose secret values in error messages.
- A global rejection listener does not make corrupted application state safe.

## Review Questions

1. How does an awaited rejection reach `catch`?
2. When does `finally` run?
3. What is the difference between recovery and propagation?
4. Why preserve an error cause?
5. What is a floating Promise?
6. Why can `try { failLater(); }` miss the rejection?
7. Where should an application log a fatal failure?
8. Why are unhandled rejections dangerous?

## Completion Checklist

- [ ] You handled fulfillment and rejection.
- [ ] You used `finally` without overriding the result.
- [ ] You wrapped an error with useful context and cause.
- [ ] No exercise leaves a floating Promise.
- [ ] `publish-post.js` passes four scenarios.

## What to Send for Review

Send `publish-post.js`, exercise code, failure outputs, and review answers. Next: **Day 17 — Sequential and Concurrent Promise Work**.

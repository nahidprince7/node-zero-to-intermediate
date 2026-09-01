# Day 17 — `Promise.all`, `allSettled`, and `race`

> Core lesson: about 60 minutes. Concurrency is useful only when operations are independent and resource limits are respected.

## Learning Objectives

You will learn to:

- distinguish sequential and concurrent async execution;
- run independent work with `Promise.all`;
- collect every outcome with `Promise.allSettled`;
- take the first settled outcome with `Promise.race`;
- understand failure and cancellation limitations;
- measure timing instead of guessing.

## Prerequisites and Setup

Recall async/await, rejection handling, and `finally`.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-17
cd practice/day-17
code .
```

Create `package.json`:

```json
{
  "name": "day-17-promise-concurrency",
  "private": true,
  "type": "module"
}
```

## 0–18 Minutes — Sequential vs Concurrent

Create `timing.js`:

```js
function delayResult(label, milliseconds, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`${label} failed`));
        return;
      }

      resolve(`${label} finished`);
    }, milliseconds);
  });
}

async function runSequentially() {
  console.time("sequential");

  const first = await delayResult("First", 500);
  const second = await delayResult("Second", 700);

  console.log(first, second);
  console.timeEnd("sequential");
}

await runSequentially();
```

The second operation starts only after the first finishes, so total time is roughly their sum.

Independent operations can start together:

```js
async function runConcurrently() {
  console.time("concurrent");

  const firstPromise = delayResult("First", 500);
  const secondPromise = delayResult("Second", 700);

  const [first, second] = await Promise.all([
    firstPromise,
    secondPromise,
  ]);

  console.log(first, second);
  console.timeEnd("concurrent");
}

await runConcurrently();
```

Total time is approximately the slowest operation, not the sum. This is concurrency of waiting operations; it does not imply multiple JavaScript threads.

## 18–32 Minutes — `Promise.all`

```js
const [user, posts, categories] = await Promise.all([
  delayResult("User", 300),
  delayResult("Posts", 500),
  delayResult("Categories", 200),
]);
```

`Promise.all`:

- fulfills when every input fulfills;
- preserves input order in its result array, regardless of completion order;
- rejects as soon as one input rejects.

Test failure:

```js
try {
  await Promise.all([
    delayResult("User", 300),
    delayResult("Posts", 100, true),
    delayResult("Categories", 500),
  ]);
} catch (error) {
  console.error(error.message);
}
```

Important: rejection of `Promise.all` does not automatically cancel other operations. They may continue in the background. Cancellation requires API support, commonly an `AbortSignal` for network requests.

Use `Promise.all` only when tasks are independent. If task B needs task A's result, keep them sequential.

## 32–44 Minutes — `Promise.allSettled`

```js
const outcomes = await Promise.allSettled([
  delayResult("Profile", 200),
  delayResult("Posts", 100, true),
  delayResult("Comments", 300),
]);

console.table(outcomes);
```

`allSettled` waits for every input and always fulfills with outcome objects:

```text
{ status: "fulfilled", value: ... }
{ status: "rejected", reason: ... }
```

Process them safely:

```js
for (const outcome of outcomes) {
  if (outcome.status === "fulfilled") {
    console.log("Success:", outcome.value);
  } else {
    console.error("Failure:", outcome.reason.message);
  }
}
```

Use it for independent tasks where partial success is useful, such as sending several notifications or loading optional dashboard panels.

## 44–52 Minutes — `Promise.race`

`Promise.race` settles with the first settled input—fulfillment or rejection:

```js
const winner = await Promise.race([
  delayResult("Fast", 100),
  delayResult("Slow", 500),
]);

console.log(winner);
```

A timeout pattern:

```js
function rejectAfter(milliseconds) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timed out after ${milliseconds}ms`));
    }, milliseconds);
  });
}

try {
  const result = await Promise.race([
    delayResult("API request", 1000),
    rejectAfter(300),
  ]);
  console.log(result);
} catch (error) {
  console.error(error.message);
}
```

Again, losing the race does not cancel the original operation. This pattern limits how long the caller waits, not necessarily how long underlying work continues.

## 52–60 Minutes — Guided Practice

Create `dashboard.js` simulating profile, posts, comments, and notifications:

1. Load required profile, posts, and comments concurrently with `Promise.all`.
2. Simulate three optional notification providers and collect all outcomes with `allSettled`.
3. Add a timeout race to one slow request.
4. Measure sequential and concurrent versions.
5. Explain why each group is dependent or independent.

## Independent Exercises

1. Run three independent delays sequentially and concurrently; compare times.
2. Show that `Promise.all` results preserve input order.
3. Process fulfilled and rejected `allSettled` outcomes into separate arrays.
4. Race a successful operation against a rejecting timeout.
5. Identify which steps in a user→posts→comments workflow can and cannot run concurrently.
6. Explain why launching thousands of operations at once may exhaust resources.

## Common Mistakes and Debugging Advice

- `await` inside separate consecutive lines is sequential.
- Create Promises before awaiting them when independent work should overlap.
- `Promise.all` fails fast but does not cancel siblings.
- `allSettled` requires inspecting each `status`.
- `race` means first settled, not first fulfilled.
- Unlimited concurrency can overwhelm databases, APIs, memory, or rate limits.

## Review Questions

1. When should operations remain sequential?
2. What does `Promise.all` return?
3. Does result order follow completion order?
4. What happens when one input rejects?
5. When is `allSettled` preferable?
6. What wins a Promise race?
7. Does race cancel losers?
8. Why can concurrency need limits?

## Completion Checklist

- [ ] You measured both execution styles.
- [ ] You tested all three Promise combinators.
- [ ] You handled partial failure explicitly.
- [ ] `dashboard.js` explains dependency choices.
- [ ] You completed all exercises and review questions.

## What to Send for Review

Send timing output, `dashboard.js`, exercise results, dependency explanation, and review answers. Next: **Day 18 — Public API Review Project**.

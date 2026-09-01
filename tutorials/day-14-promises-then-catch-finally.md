# Day 14 — Promises: `then`, `catch`, and `finally`

> Core lesson: about 60 minutes. Trace each chain slowly and always return from `then` callbacks.

## Learning Objectives

You will learn to:

- explain pending, fulfilled, and rejected promise states;
- create a Promise around simulated asynchronous work;
- consume results with `then`, `catch`, and `finally`;
- chain transformations and dependent async operations;
- propagate errors correctly through a chain;
- convert an error-first callback idea into a Promise.

## Prerequisites and Setup

Recall callbacks, timers, error objects, and the event-loop mental model.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-14
cd practice/day-14
code .
```

## 0–15 Minutes — Promise States

A Promise represents the eventual outcome of an operation. It starts **pending**, then settles exactly once as either:

- **fulfilled** with a value; or
- **rejected** with a reason, normally an `Error`.

Create `first-promise.js`:

```js
const promise = new Promise((resolve, reject) => {
  const shouldSucceed = true;

  setTimeout(() => {
    if (shouldSucceed) {
      resolve({ id: 1, title: "Promises" });
      return;
    }

    reject(new Error("Could not load the post"));
  }, 500);
});

console.log("Promise created");

promise.then((post) => {
  console.log("Fulfilled:", post);
});
```

Change `shouldSucceed` to false. Without a rejection handler, Node reports an unhandled rejection. Add:

```js
promise.catch((error) => {
  console.error("Rejected:", error.message);
});
```

## 15–28 Minutes — Return a Promise from a Function

Create `find-post.js`:

```js
function findPostById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Number.isInteger(id) || id <= 0) {
        reject(new Error("Post ID must be a positive integer"));
        return;
      }

      resolve({ id, title: "Learning Promises", authorId: 7 });
    }, 300);
  });
}

findPostById(1)
  .then((post) => {
    console.log(post);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

The function returns immediately with a Promise. The eventual post is delivered to `then`.

### `finally`

```js
findPostById(1)
  .then((post) => {
    console.log(post);
  })
  .catch((error) => {
    console.error(error.message);
  })
  .finally(() => {
    console.log("Lookup finished");
  });
```

`finally` runs after fulfillment or rejection. Use it for cleanup or hiding loading state, not for changing the main result.

## 28–43 Minutes — Promise Chaining

Each `then` returns a new Promise. A returned value becomes the next fulfillment value:

```js
findPostById(2)
  .then((post) => {
    return post.title;
  })
  .then((title) => {
    return title.toUpperCase();
  })
  .then((upperTitle) => {
    console.log(upperTitle);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

Concise callbacks can return implicitly:

```js
findPostById(2)
  .then((post) => post.title)
  .then((title) => title.toUpperCase())
  .then((title) => console.log(title))
  .catch((error) => console.error(error.message));
```

### Chain dependent asynchronous work

```js
function findAuthorById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: "Nahid" });
    }, 300);
  });
}

findPostById(3)
  .then((post) => {
    return findAuthorById(post.authorId);
  })
  .then((author) => {
    console.log(author);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

Returning the nested Promise makes the outer chain wait for it.

## 43–52 Minutes — Error Propagation

An exception thrown inside `then` rejects the Promise returned by that `then`:

```js
findPostById(1)
  .then((post) => {
    throw new Error(`Formatting failed for post ${post.id}`);
  })
  .then(() => {
    console.log("This is skipped");
  })
  .catch((error) => {
    console.error("Chain failed:", error.message);
  });
```

One final `catch` can handle rejection from the original operation or any earlier chain step.

Do not accidentally swallow errors:

```js
.catch((error) => {
  console.error(error.message);
  throw error;
});
```

Log and rethrow when the caller still needs to know the operation failed. Recover only when you can provide a valid fallback.

## 52–60 Minutes — Guided Practice

Create `blog-flow.js` with three Promise-returning functions:

```text
authenticateUser(token)
findUserPosts(userId)
formatPostTitles(posts)
```

Use timers to simulate delays. Build one chain that:

1. authenticates a token;
2. returns the user's posts;
3. converts them to title labels;
4. prints the labels;
5. catches any failure once;
6. prints `Request finished` in `finally`.

Test a valid and invalid token.

## Independent Exercises

1. Write `delay(milliseconds)` returning a Promise that fulfills after the delay.
2. Write `divideAsync(a, b)` that rejects division by zero.
3. Chain two transformations after `divideAsync`.
4. Convert Day 13's error-first `getPost` simulation into a Promise-returning function.
5. Demonstrate and fix a missing `return` in a dependent Promise chain.

## Common Mistakes and Debugging Advice

- The Promise executor runs immediately; the timer callback runs later.
- Call either `resolve` or `reject` for one outcome; settlement happens only once.
- Reject with `new Error(...)`, not a vague string.
- Return values and nested Promises from `then` callbacks.
- Attach error handling to every chain.
- `finally` receives neither the fulfillment value nor rejection reason as its main purpose.

## Review Questions

1. What three states can a Promise have?
2. Can a fulfilled Promise later become rejected?
3. What does `then` return?
4. How does a value returned from `then` reach the next step?
5. Why return a nested Promise?
6. What happens when `then` throws?
7. When does `finally` run?
8. What is an unhandled rejection?

## Completion Checklist

- [ ] You tested fulfillment and rejection.
- [ ] You built a dependent Promise chain.
- [ ] One final catch handles the chain.
- [ ] `blog-flow.js` handles valid and invalid tokens.
- [ ] You completed all exercises and review questions.

## What to Send for Review

Send `blog-flow.js`, exercise code and output, your explanation of returned Promises, and review answers. Next: **Day 15 — `async` and `await`**.

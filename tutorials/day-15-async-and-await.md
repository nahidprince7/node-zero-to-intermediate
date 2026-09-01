# Day 15 — `async` and `await`

> Core lesson: about 60 minutes. `async`/`await` changes Promise syntax, not the underlying asynchronous behavior.

## Learning Objectives

You will learn to:

- explain what an `async` function returns;
- pause an async function with `await` without blocking Node.js;
- rewrite Promise chains as readable sequential code;
- use returned values after `await`;
- identify unnecessary `await` and accidental sequential execution;
- call an async entry function safely.

## Prerequisites and Setup

You should understand Promise fulfillment, rejection, chaining, and `catch`.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-15
cd practice/day-15
code .
```

Create `package.json` so top-level `await` examples run as ES modules:

```json
{
  "name": "day-15-async-await",
  "private": true,
  "type": "module"
}
```

## 0–15 Minutes — Async Functions Return Promises

Create `async-functions.js`:

```js
async function getCourseName() {
  return "Node.js Backend";
}

const result = getCourseName();

console.log(result);

result.then((courseName) => {
  console.log(courseName);
});
```

Even though the function returns a string in its body, calling an `async` function returns a Promise fulfilled with that string.

Throwing rejects that Promise:

```js
async function failCourseLoad() {
  throw new Error("Course could not be loaded");
}

failCourseLoad().catch((error) => {
  console.error(error.message);
});
```

## 15–30 Minutes — Await a Promise

Create `await-basics.js`:

```js
function findPostById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("Invalid post ID"));
        return;
      }

      resolve({ id, title: "Async and Await", authorId: 7 });
    }, 300);
  });
}

async function showPost() {
  const post = await findPostById(1);
  console.log(post);
}

showPost().catch((error) => {
  console.error(error.message);
});
```

`await` pauses only the current async function until the Promise settles. It does not freeze the entire Node.js process.

Verify ordering:

```js
console.log("Before calling showPost");
showPost().catch((error) => console.error(error.message));
console.log("After calling showPost");
```

The outer synchronous code continues while `showPost` waits.

## 30–42 Minutes — Rewrite a Promise Chain

Promise chain:

```js
function findAuthorById(id) {
  return Promise.resolve({ id, name: "Nahid" });
}

findPostById(1)
  .then((post) => findAuthorById(post.authorId))
  .then((author) => console.log(author))
  .catch((error) => console.error(error.message));
```

Equivalent async flow:

```js
async function showAuthorForPost(postId) {
  const post = await findPostById(postId);
  const author = await findAuthorById(post.authorId);
  console.log(author);
}

showAuthorForPost(1).catch((error) => {
  console.error(error.message);
});
```

Async/await makes dependent steps read top to bottom. The second lookup needs the first result, so sequential awaiting is correct.

### Return from an async function

```js
async function getAuthorName(postId) {
  const post = await findPostById(postId);
  const author = await findAuthorById(post.authorId);
  return author.name;
}

const namePromise = getAuthorName(1);
namePromise.then((name) => console.log(name));
```

The caller still receives a Promise.

## 42–50 Minutes — Entry-Point Patterns

In an ES module, top-level `await` works:

```js
const post = await findPostById(1);
console.log(post);
```

However, an explicit entry function provides one clear place for application flow and error handling:

```js
async function main() {
  const post = await findPostById(1);
  console.log(post);
}

main().catch((error) => {
  console.error("Application failed:", error.message);
  process.exitCode = 1;
});
```

Setting `process.exitCode` communicates failure while allowing pending cleanup/output to finish. Avoid calling `process.exit()` casually.

## 50–60 Minutes — Guided Practice

Create `blog-flow.js`:

```js
function authenticateUser(token) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token !== "valid-token") {
        reject(new Error("Authentication failed"));
        return;
      }

      resolve({ id: 7, name: "Nahid" });
    }, 200);
  });
}

function findUserPosts(userId) {
  return Promise.resolve([
    { id: 1, authorId: userId, title: "Promises" },
    { id: 2, authorId: userId, title: "Async Await" },
  ]);
}
```

Write `main` that awaits authentication, awaits posts, maps title labels, and prints them. Attach one final catch to `main()`. Test valid and invalid tokens.

Then add a timer log outside `main` to prove that awaiting does not block all JavaScript.

## Independent Exercises

1. Rewrite three Day 14 Promise chains with `async`/`await`.
2. Write `waitAndReturn(value, milliseconds)` and await it.
3. Build `getPostSummary(id)` from two dependent async functions.
4. Show that calling an async function without `await` produces a Promise.
5. Compare two independent one-second waits performed sequentially; record the approximate total time. Day 17 will improve it.

## Common Mistakes and Debugging Advice

- `await` is valid inside `async` functions and at top level of ES modules.
- Forgetting `await` often leaves you accessing properties on a Promise.
- An async function always returns a Promise.
- `await` does not block the whole process.
- Do not add `await` to ordinary non-Promise expressions without a reason.
- Rejection still needs handling; readable syntax does not remove failure.

## Review Questions

1. What does an async function always return?
2. What happens when an async function returns a plain value?
3. What happens when it throws?
4. Does `await` block Node.js entirely?
5. When should two awaits be sequential?
6. Why attach `catch` to `main()`?
7. What happens if you forget `await`?
8. How is async/await related to Promises?

## Completion Checklist

- [ ] You proved that async functions return Promises.
- [ ] You rewrote a dependent Promise chain.
- [ ] `blog-flow.js` handles success and rejection.
- [ ] You observed outer code continuing during an await.
- [ ] You completed all exercises and review questions.

## What to Send for Review

Send `blog-flow.js`, rewritten chains, timing observation, review answers, and any confusing behavior. Next: **Day 16 — Error Handling in Async Code**.

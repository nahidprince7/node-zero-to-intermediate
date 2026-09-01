# Day 13 — Why Async Exists: Callbacks, the Call Stack, and the Event Loop

> Core lesson: about 60 minutes. The goal is an accurate mental model, not memorizing internal event-loop phases.

## Learning Objectives

You will learn to:

- distinguish synchronous and asynchronous work;
- explain why waiting synchronously hurts a server;
- trace the call stack for nested function calls;
- pass and invoke callback functions;
- predict timer ordering with the event loop;
- recognize nested-callback problems.

## Prerequisites and Setup

Recall functions, callbacks used by array methods, and stack traces.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-13
cd practice/day-13
code .
```

## 0–15 Minutes — Synchronous Execution and the Call Stack

Create `call-stack.js`:

```js
function third() {
  console.log("Inside third");
}

function second() {
  console.log("Inside second: start");
  third();
  console.log("Inside second: end");
}

function first() {
  console.log("Inside first: start");
  second();
  console.log("Inside first: end");
}

first();
```

JavaScript executes one instruction at a time on the main JavaScript thread. Each active function call is placed on the **call stack**:

```text
first → second → third
```

When `third` returns, it leaves the stack; then `second` continues; then `first` continues.

Add `console.trace("Current stack")` inside `third` and compare the trace to your prediction.

### Blocking work

```js
console.log("Start");

const endTime = Date.now() + 2000;
while (Date.now() < endTime) {
  // Deliberately block for about two seconds.
}

console.log("End");
```

During this loop, the JavaScript thread cannot handle another callback. A real server must not block while waiting for files, databases, or networks when asynchronous APIs are available.

## 15–28 Minutes — Callbacks

A callback is a function passed to other code to be called later or for each item.

Create `callbacks.js`:

```js
function processUser(name, callback) {
  console.log(`Processing ${name}`);
  callback(name);
}

function announceCompletion(name) {
  console.log(`${name} is complete`);
}

processUser("Nahid", announceCompletion);
```

Pass the function as `announceCompletion`, not `announceCompletion()`. The receiver decides when to invoke it.

Callbacks are not automatically asynchronous:

```js
[1, 2, 3].map((number) => number * 2);
```

`map` calls its callback synchronously. A timer callback is asynchronous because the timer API schedules it for later.

## 28–45 Minutes — Event Loop Mental Model

Create `timer-order.js`:

```js
console.log("A: script starts");

setTimeout(() => {
  console.log("B: timer callback");
}, 0);

console.log("C: script ends");
```

Predict, then run:

```bash
node timer-order.js
```

The order is A, C, B. A zero-millisecond delay means “eligible after at least this delay,” not “run immediately.” The callback cannot execute until current synchronous code finishes and the event loop schedules it.

A useful simplified model:

1. synchronous code enters and leaves the call stack;
2. Node.js delegates supported waiting work to runtime/operating-system facilities;
3. completed work makes callbacks eligible in an appropriate queue;
4. the event loop schedules eligible callbacks when JavaScript can run them.

This model is intentionally simplified. Later Node.js lessons can explore phases and microtasks more deeply.

### Multiple timers

```js
console.log("Start");

setTimeout(() => console.log("Timer 100"), 100);
setTimeout(() => console.log("Timer 0"), 0);

console.log("Finish synchronous work");
```

Timer delay is a minimum threshold, not an exact execution appointment.

## 45–55 Minutes — Async Results Arrive Later

Create `fake-database.js`:

```js
function findPostById(id, callback) {
  console.log(`Starting lookup for ${id}`);

  setTimeout(() => {
    const post = { id, title: "Async Node.js" };
    callback(post);
  }, 500);
}

findPostById(7, (post) => {
  console.log("Lookup result:", post);
});

console.log("Lookup request sent");
```

The result cannot be returned normally from the timer callback to the outer caller after the outer function has already finished. The callback receives it later.

Add error-first behavior:

```js
function findUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error("Invalid user ID"), null);
      return;
    }

    callback(null, { id, name: "Nahid" });
  }, 300);
}

findUser(1, (error, user) => {
  if (error) {
    console.error(error.message);
    return;
  }

  console.log(user);
});
```

This error-first callback convention appears in older and low-level Node.js APIs.

## 55–60 Minutes — Nested Callback Problem

```js
getUser(1, (userError, user) => {
  if (userError) return handleError(userError);

  getPosts(user.id, (postError, posts) => {
    if (postError) return handleError(postError);

    getComments(posts[0].id, (commentError, comments) => {
      if (commentError) return handleError(commentError);
      console.log(comments);
    });
  });
});
```

You do not need to run this incomplete illustration. Deep nesting, repeated error handling, and difficult composition are often called **callback hell**. Promises provide a more composable structure on Day 14.

## Independent Exercises

1. Draw the call stack for three nested functions and verify it with `console.trace`.
2. Predict output order for three timers with delays 0, 50, and 10 milliseconds.
3. Write `performTask(taskName, callback)` that completes after a timer.
4. Write an error-first `getPost(id, callback)` that rejects invalid IDs.
5. Explain why `setTimeout(callback, 0)` does not interrupt current code.

## Common Mistakes and Debugging Advice

- Passing `callback()` invokes it now; passing `callback` gives the function to other code.
- A timer delay is not a guaranteed exact time.
- Asynchronous does not automatically mean parallel JavaScript execution.
- Do not use busy `while` loops to wait.
- Return immediately after invoking an error callback to avoid calling the success callback too.

## Review Questions

1. What does the call stack represent?
2. What is blocking work?
3. Are all callbacks asynchronous?
4. Why does a zero-delay timer run after synchronous logs?
5. What does the event loop schedule?
6. Why can timer execution be later than requested?
7. What is an error-first callback?
8. What makes nested callbacks difficult?

## Completion Checklist

- [ ] You traced synchronous calls correctly.
- [ ] You predicted timer order before running it.
- [ ] You created a successful and failed callback result.
- [ ] You completed all exercises.
- [ ] You can explain the event loop without saying that timers “run in parallel.”

## What to Send for Review

Send timer predictions and outputs, callback exercises, your event-loop explanation, and review answers. Next: **Day 14 — Promises**.

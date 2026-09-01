# Day 11 — Errors, Stack Traces, and Debugging

> Core lesson: about 60 minutes. Today, errors are learning material: create them deliberately, read them, and fix them methodically.

## Learning Objectives

You will learn to:

- distinguish syntax, reference, and type errors;
- read a Node.js stack trace from the top useful frame;
- reproduce and isolate a bug;
- use `console.log`, `console.error`, `console.table`, and timers deliberately;
- pause code and inspect state with the VS Code debugger;
- describe a repeatable debugging process.

## Prerequisites and Setup

You should be able to run ES modules from Day 10. Create today's project:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-11
cd practice/day-11
code .
```

Create `package.json`:

```json
{
  "name": "day-11-debugging",
  "private": true,
  "type": "module"
}
```

## 0–18 Minutes — Know the Main Error Types

Create `errors.js`. Test one example at a time; comment out or fix one before trying the next.

### Syntax error

```js
const title = "Node.js"

if (title === "Node.js" {
  console.log(title);
}
```

The missing `)` prevents JavaScript from parsing the file. The program cannot begin.

### Reference error

```js
const userName = "Nahid";
console.log(username);
```

JavaScript is case-sensitive. `username` was never declared.

### Type error

```js
const post = null;
console.log(post.title);
```

The variable exists, but `null` has no `title` property.

### Logical bug

```js
function isAdult(age) {
  return age > 18;
}

console.log(isAdult(18));
```

This program runs, but the boundary is probably wrong. Logical bugs often require tests, careful examples, and domain understanding rather than an exception.

## 18–30 Minutes — Read a Stack Trace

Create `stack-trace.js`:

```js
function formatAuthor(author) {
  return author.name.toUpperCase();
}

function formatPost(post) {
  return `${post.title} by ${formatAuthor(post.author)}`;
}

function printPost(post) {
  console.log(formatPost(post));
}

printPost({
  title: "Debugging Node.js",
  author: null,
});
```

Run:

```bash
node stack-trace.js
```

Read the output in this order:

1. **Error name and message:** what failed.
2. **First frame in your file:** the immediate failure location.
3. **Later frames in your file:** how execution reached that location.
4. Ignore Node internal frames until they are relevant.

The call path is `printPost` → `formatPost` → `formatAuthor`. Fix the input or handle a missing author deliberately:

```js
function formatAuthor(author) {
  if (author === null) {
    return "Unknown author";
  }

  return author.name.toUpperCase();
}
```

Do not merely silence an error without deciding what missing data should mean.

## 30–40 Minutes — Use Console Tools Deliberately

Create `console-tools.js`:

```js
const posts = [
  { id: 1, title: "Node", status: "published" },
  { id: 2, title: "Functions", status: "draft" },
];

console.log("Normal information");
console.warn("Example warning");
console.error("Example error message");
console.table(posts);
console.dir(posts[0], { depth: null });

console.time("post-search");
const found = posts.find((post) => post.id === 2);
console.timeEnd("post-search");

console.assert(found !== undefined, "Expected a post to be found");
```

Useful logging includes context:

```js
console.log("Searching for post", { requestedId: 2 });
```

Avoid scattering unexplained logs such as `console.log("here")`. Remove temporary debugging noise after the bug is understood.

## 40–53 Minutes — Use the VS Code Debugger

Create `debug-target.js`:

```js
const prices = [100, 250, 50];

function calculateTotal(values, discount) {
  const subtotal = values.reduce((sum, price) => sum + price, 0);
  const finalTotal = subtotal - discount;
  return finalTotal;
}

const result = calculateTotal(prices, 75);
console.log(result);
```

Then:

1. Click beside the line number containing `const subtotal` to create a red breakpoint.
2. Open **Run and Debug** in VS Code.
3. Choose **Run and Debug**, then select **Node.js** if prompted.
4. Execution pauses before the marked line.
5. Inspect `values` and `discount` in the Variables panel.
6. Use **Step Over** to execute one line.
7. Watch `subtotal` and `finalTotal` appear.
8. Continue until the program finishes.

Also try adding `result` to the Watch panel. A debugger shows actual runtime state without repeatedly editing log statements.

## 53–60 Minutes — A Debugging Routine

Use this order:

1. **Reproduce:** find exact input and command that always triggers the problem.
2. **Read:** capture the full error and first useful stack frame.
3. **Reduce:** isolate the smallest failing function or value.
4. **Inspect:** log or debug inputs, types, branches, and outputs.
5. **Form one hypothesis:** state what you think is wrong.
6. **Test one change:** do not change five things at once.
7. **Verify boundaries:** test normal, empty, missing, minimum, and maximum cases.
8. **Clean up:** remove temporary logs and keep a regression test later.

## Guided Practice

Create `broken-report.js` and debug it without rewriting everything:

```js
const posts = [
  { id: 1, title: "Node", views: 100 },
  { id: 2, title: "Functions", views: 50 },
  { id: 3, title: "Arrays" },
];

function calculateAverageViews(items) {
  const total = items.reduce((sum, item) => sum + item.views, 0);
  return total / items.length;
}

console.log(calculateAverageViews(posts));
```

Determine why it produces `NaN`, decide how missing views should be handled, fix it, and test an empty array.

## Independent Exercises

1. Create and fix one `SyntaxError`, `ReferenceError`, and `TypeError`; record the useful message and frame.
2. Debug a grade function with incorrect boundary conditions.
3. Use `console.table` to inspect five users and find one invalid record.
4. Debug a nested three-function call using a breakpoint and Step Into/Step Over.
5. Write your personal debugging checklist in `debugging-notes.md`.

## Common Mistakes and Debugging Advice

- Fix the first meaningful error before chasing later output.
- Do not assume the last edited line caused the bug; follow evidence.
- `typeof null` is `"object"`, so check `value === null` explicitly.
- Logging an object and later mutating it can confuse browser tools; in Node's terminal output, still log at meaningful points.
- An empty array can create division by zero or missing initial-value errors.

## Review Questions

1. How do syntax, reference, type, and logical errors differ?
2. Which stack-trace frame should you inspect first?
3. Why is reproducibility important?
4. When is `console.table` useful?
5. What does a breakpoint do?
6. How do Step Into and Step Over differ?
7. Why should you change one thing at a time?
8. Which boundary inputs should you test?

## Completion Checklist

- [ ] You created and fixed three error types.
- [ ] You traced the three-function call path.
- [ ] You inspected variables in VS Code.
- [ ] `broken-report.js` handles missing views and empty input deliberately.
- [ ] You completed all exercises and review questions.

## What to Send for Review

Send the fixed report, captured error summaries, debugging notes, review answers, and anything you could not explain. Next: **Day 12 — JavaScript Foundations Review Project**.

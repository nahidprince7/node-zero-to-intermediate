# Day 3 — Control Flow: `if`, `switch`, Loops, and Truthiness

> Core lesson: about 60 minutes. Stop after an hour if needed and finish the exercises in the next session.

## Learning Objectives

You will learn to:

- make decisions with `if`, `else if`, and `else`;
- combine conditions with comparison and logical operators;
- use `switch` for exact-value branches;
- repeat work with `for` and `while` loops;
- explain truthy and falsy values;
- avoid infinite loops and common condition mistakes.

## Prerequisites and Setup

Recall without notes: when to use `const` or `let`, what `===` does, and what `&&`, `||`, and `!` mean.

Create today's workspace:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-03
cd practice/day-03
code .
```

## 0–20 Minutes — Decisions with `if`

A condition produces `true` or `false`. An `if` statement runs code only when its condition is true.

Create `conditions.js`:

```js
const age = 20;

if (age >= 18) {
  console.log("You are an adult.");
}
```

Run it:

```bash
node conditions.js
```

The parentheses contain the condition. The braces contain the block that may run.

### `if` and `else`

```js
const isLoggedIn = false;

if (isLoggedIn) {
  console.log("Welcome back!");
} else {
  console.log("Please log in.");
}
```

Exactly one branch runs.

### Multiple branches

```js
const score = 76;

if (score >= 80) {
  console.log("Grade A");
} else if (score >= 70) {
  console.log("Grade B");
} else if (score >= 60) {
  console.log("Grade C");
} else {
  console.log("Needs more practice");
}
```

Conditions are checked from top to bottom. Put the most restrictive condition first. If `score >= 60` came first, a score of 90 would stop there.

### Combine conditions

```js
const hasAccount = true;
const hasCorrectPassword = true;
const isBlocked = false;

if (hasAccount && hasCorrectPassword && !isBlocked) {
  console.log("Login allowed");
} else {
  console.log("Login denied");
}
```

Change one input at a time and predict the result before running it.

## 20–30 Minutes — Truthiness

JavaScript can treat non-Boolean values as true or false inside a condition.

These values are **falsy**:

```text
false, 0, -0, 0n, "", null, undefined, NaN
```

Most other values are **truthy**, including `"false"`, `"0"`, empty arrays, and empty objects.

Create `truthiness.js`:

```js
const displayName = "Nahid";

if (displayName) {
  console.log(`Welcome, ${displayName}`);
} else {
  console.log("A display name is required.");
}
```

Try `""`, `"0"`, `0`, `null`, and `undefined` as the value.

Truthiness is convenient, but be precise when `0` is valid:

```js
const commentCount = 0;

if (commentCount === 0) {
  console.log("There are no comments yet.");
}
```

## 30–38 Minutes — `switch`

Use `switch` when one value is compared against several exact choices.

Create `roles.js`:

```js
const role = "author";

switch (role) {
  case "admin":
    console.log("Manage all content");
    break;
  case "author":
    console.log("Create and edit own posts");
    break;
  case "reader":
    console.log("Read and comment");
    break;
  default:
    console.log("Unknown role");
}
```

`break` exits the switch. Remove one `break` temporarily and observe how execution falls into the next case, then restore it.

Use `if` for ranges or complex logic. Use `switch` for multiple exact matches.

## 38–52 Minutes — Loops

### `for` loop

Create `loops.js`:

```js
for (let day = 1; day <= 5; day += 1) {
  console.log(`Study day ${day}`);
}
```

A `for` loop has three parts:

1. `let day = 1` runs once at the beginning.
2. `day <= 5` is checked before each repetition.
3. `day += 1` runs after each repetition.

### Countdown

```js
for (let count = 5; count >= 1; count -= 1) {
  console.log(count);
}

console.log("Start learning!");
```

### `while` loop

Use `while` when repetition depends on a condition and the number of repetitions is not the main idea:

```js
let remainingTasks = 3;

while (remainingTasks > 0) {
  console.log(`Tasks remaining: ${remainingTasks}`);
  remainingTasks -= 1;
}

console.log("All tasks complete");
```

The variable must eventually make the condition false. Otherwise the loop never ends.

### `break` and `continue`

```js
for (let number = 1; number <= 10; number += 1) {
  if (number === 3) {
    continue;
  }

  if (number === 8) {
    break;
  }

  console.log(number);
}
```

`continue` skips the current repetition. `break` ends the entire loop.

## 52–60 Minutes — Guided Practice

Create `access-report.js`:

```js
const role = "author";
const isActive = true;
const postCount = 4;

if (!isActive) {
  console.log("Account inactive");
} else if (role === "admin") {
  console.log("Full access");
} else if (role === "author") {
  console.log("Author access");
} else {
  console.log("Reader access");
}

for (let postNumber = 1; postNumber <= postCount; postNumber += 1) {
  console.log(`Checking post ${postNumber}`);
}
```

Predict the output, run it, then test different roles, activity states, and post counts.

## Independent Exercises

1. **Number classifier:** Create `number-check.js`. Print whether a number is positive, negative, or zero; then print whether it is even or odd.
2. **Grade calculator:** Create `grade.js`. Validate that a score is between 0 and 100, then print A, B, C, D, or F.
3. **Multiplication table:** Create `table.js`. Use a loop to print the multiplication table for a chosen number from 1 through 10.
4. **Role permissions:** Create `permissions.js`. Use `switch` to print permissions for `admin`, `author`, `reader`, and an unknown role.
5. **FizzBuzz challenge:** Print numbers 1–30. Print `Fizz` for multiples of 3, `Buzz` for multiples of 5, and `FizzBuzz` for multiples of both.

## Common Mistakes and Debugging

- `=` assigns; `===` compares. Do not write `if (role = "admin")`.
- A condition like `score >= 60` must not appear before `score >= 80` in a grade chain.
- Missing braces make control flow difficult to see. Use braces consistently.
- A missing `break` in `switch` causes fall-through.
- If a loop never stops, press `Ctrl+C`, then inspect its condition and update.
- Check boundaries: should 18 pass `age >= 18`? Test exact edge values.

## Review Questions

1. When does an `else` block run?
2. Why does the order of `else if` conditions matter?
3. Name five falsy values.
4. Is the string `"false"` truthy or falsy?
5. When is `switch` clearer than `if`?
6. What are the three parts of a `for` loop?
7. What is the difference between `break` and `continue`?
8. Why can a `while` loop become infinite?

## Completion Checklist

- [ ] All five example files run.
- [ ] You tested boundary values and different roles.
- [ ] You completed Exercises 1–4.
- [ ] You attempted FizzBuzz without searching for a solution.
- [ ] You can answer at least six review questions without notes.

## Next Blog Milestone

There is no blog code yet. The conditions learned today will later control login, ownership, publication status, and permissions.

## What to Send for Review

Send the code and output for Exercises 1–4, your FizzBuzz attempt, your review answers, and any confusing error. Next: **Day 4 — Functions, Parameters, Scope, and Closures**.

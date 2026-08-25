# Day 4 — Functions, Parameters, Scope, and Closures

> Core lesson: about 60 minutes, followed by independent exercises if needed.

## Learning Objectives

You will learn to:

- define and call functions;
- use parameters, arguments, default values, and return values;
- write function declarations and arrow functions;
- distinguish printing from returning;
- understand global, function, and block scope;
- recognize a simple closure.

## Prerequisites and Setup

Recall: `const` versus `let`, comparisons, template literals, and `if` statements.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-04
cd practice/day-04
code .
```

## 0–18 Minutes — Define and Call Functions

A function groups reusable behavior. Create `functions.js`:

```js
function greet() {
  console.log("Welcome to the Node.js course!");
}

greet();
greet();
```

Defining a function does not run it. `greet()` is the function call.

### Parameters and arguments

```js
function greetStudent(name) {
  console.log(`Welcome, ${name}!`);
}

greetStudent("Nahid");
greetStudent("Rafi");
```

`name` is a parameter: a local name in the function definition. `"Nahid"` is an argument: the value passed during a call.

```js
function printPostSummary(title, author) {
  console.log(`"${title}" by ${author}`);
}

printPostSummary("Learning Node.js", "Nahid");
```

Argument order matters.

### Default parameters

```js
function greetUser(name = "Guest") {
  console.log(`Hello, ${name}`);
}

greetUser("Mina");
greetUser();
```

The default is used when no argument, or `undefined`, is passed.

## 18–30 Minutes — Return Values

Create `returns.js`:

```js
function add(firstNumber, secondNumber) {
  return firstNumber + secondNumber;
}

const total = add(10, 5);
console.log(total);
console.log(add(7, 3));
```

`return` sends a value back to the caller and immediately stops that function.

### Printing is not returning

```js
function printTotal(a, b) {
  console.log(a + b);
}

function calculateTotal(a, b) {
  return a + b;
}

const printedResult = printTotal(2, 3);
const calculatedResult = calculateTotal(2, 3);

console.log(`Printed result variable: ${printedResult}`);
console.log(`Calculated result variable: ${calculatedResult}`);
```

`printTotal` displays `5` but returns nothing, so `printedResult` is `undefined`. Prefer returning from reusable calculation functions; the caller decides whether to print, store, or combine the result.

### Guard clauses

```js
function divide(a, b) {
  if (b === 0) {
    return "Cannot divide by zero";
  }

  return a / b;
}

console.log(divide(10, 2));
console.log(divide(10, 0));
```

The early return handles an invalid case and keeps the main path clear.

## 30–40 Minutes — Arrow Functions

Functions can be stored in variables:

```js
const multiply = function (a, b) {
  return a * b;
};

console.log(multiply(4, 5));
```

An arrow function is shorter:

```js
const multiplyArrow = (a, b) => {
  return a * b;
};

console.log(multiplyArrow(4, 5));
```

For one returned expression, omit braces and `return`:

```js
const square = (number) => number * number;
const isEven = (number) => number % 2 === 0;

console.log(square(6));
console.log(isEven(10));
```

Both declarations and arrow functions are common. Arrow functions behave differently with `this`; that topic comes later. Do not assume they are identical in every situation.

## 40–52 Minutes — Scope

Scope determines where a variable can be accessed. Create `scope.js`:

```js
const courseName = "Node.js Backend";

function showCourse() {
  const message = `Course: ${courseName}`;
  console.log(message);
}

showCourse();
```

`courseName` has global/module scope here, so the function can read it. `message` has function scope and cannot be read outside `showCourse`.

Deliberately add this, run it, read the `ReferenceError`, and remove it:

```js
console.log(message);
```

### Block scope

```js
if (true) {
  const insideBlock = "Only inside the block";
  let count = 1;
  console.log(insideBlock, count);
}

// console.log(insideBlock); // ReferenceError if uncommented
```

`const` and `let` are block-scoped. Prefer variables close to where they are used instead of unnecessary globals.

### Shadowing

```js
const topic = "Node.js";

function showTopic() {
  const topic = "Functions";
  console.log(topic);
}

showTopic();
console.log(topic);
```

The inner variable shadows the outer variable. It is valid, but overusing the same names can confuse readers.

## 52–60 Minutes — Closure Introduction

A closure happens when an inner function remembers variables from the surrounding function even after the outer function has finished.

Create `closure.js`:

```js
function createCounter() {
  let count = 0;

  return function () {
    count += 1;
    return count;
  };
}

const nextCount = createCounter();

console.log(nextCount());
console.log(nextCount());
console.log(nextCount());
```

Expected output:

```text
1
2
3
```

`createCounter` finished, but the returned function still remembers its own `count`. That remembered surrounding state is the closure. Today, understanding the mental model is enough.

## Guided Practice — Blog Helpers

Create `blog-helpers.js`:

```js
function createSlug(title) {
  return title.toLowerCase().replaceAll(" ", "-");
}

const canEditPost = (userRole, isOwner) => {
  if (userRole === "admin") {
    return true;
  }

  return userRole === "author" && isOwner;
};

console.log(createSlug("My First Node Post"));
console.log(canEditPost("author", true));
console.log(canEditPost("author", false));
console.log(canEditPost("admin", false));
```

Explain each return value before changing the inputs.

## Independent Exercises

1. Write `calculateArea(width, height)` and `calculatePerimeter(width, height)`.
2. Write `getGrade(score)` that rejects scores outside 0–100 and otherwise returns A–F.
3. Write `formatUser(name, role = "reader")` returning a template-literal message.
4. Write arrow functions `celsiusToFahrenheit`, `isAdult`, and `getRemainder`.
5. Write `createMultiplier(multiplier)` that returns a function. Use it to make `double` and `triple` functions.

## Common Mistakes and Debugging

- `return` outside a function is invalid.
- Code after an unconditional `return` is unreachable.
- Calling `greet` references the function; calling `greet()` executes it.
- A parameter exists only inside its function.
- A variable declared in a block cannot be used outside it.
- If a result is `undefined`, check whether the function forgot to return.

## Review Questions

1. What is the difference between defining and calling a function?
2. What is the difference between a parameter and an argument?
3. What does `return` do?
4. Why is printing not the same as returning?
5. When can an arrow function omit `return`?
6. What are global, function, and block scope?
7. What is shadowing?
8. In simple words, what does a closure remember?

## Completion Checklist

- [ ] All example files run.
- [ ] You produced and fixed the scope error.
- [ ] You can explain why `printedResult` is `undefined`.
- [ ] You completed all five exercises.
- [ ] You can explain the counter closure in your own words.

## Next Blog Milestone

These function skills later become controllers, services, validation helpers, and authorization rules.

## What to Send for Review

Send your five exercise solutions, output, review answers, and closure explanation. Next: **Day 5 — Arrays and Objects**.

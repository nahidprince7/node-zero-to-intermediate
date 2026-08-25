# Day 2 — Values, Variables, Data Types, and Operators

> Core lesson: about 60 minutes. The independent exercises may need another 30–45 minutes. If your hour ends, stop and continue in the next session; do not rush or skip them. Type every example yourself, run it, and observe the output before continuing.

## What You Will Learn

By the end of this tutorial, you will be able to:

- explain the difference between a value and a variable;
- create variables with `const` and `let`;
- identify JavaScript's basic data types;
- inspect a value with `typeof`;
- perform arithmetic, comparison, and logical operations;
- use template literals to build readable messages;
- understand and fix a few common beginner errors.

## Prerequisites

Before starting, you should be able to:

- open a terminal and move between directories with `cd`;
- use `pwd` and `ls`;
- run a JavaScript file with `node filename.js`;
- recognize the file name and line number in a Node.js error.

If any of these still feels confusing, revisit Day 1 before continuing.

---

## 0–10 Minutes — Recall and Prepare

### Recall Day 1 without notes

Answer aloud:

1. What is Node.js?
2. What does `nvm` do?
3. Which command runs a file named `app.js`?
4. What do `pwd`, `ls`, and `cd` do?
5. Why did `console.log(hello)` cause a `ReferenceError`?

Now verify your environment:

```bash
node --version
npm --version
```

### Create today's practice directory

Run:

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-02
cd practice/day-02
pwd
```

Expected final output:

```text
/home/nahid/Projects/Learning/app/practice/day-02
```

Open this directory in VS Code:

```bash
code .
```

If the `code` command is unavailable, open the directory through VS Code's **File → Open Folder** menu.

Create a file named:

```text
values.js
```

---

## 10–20 Minutes — Values and Data Types

### What is a value?

A **value** is a piece of data used by a program. These are all values:

```js
"Nahid"
25
true
```

They represent different kinds of information:

- `"Nahid"` is text;
- `25` is a number;
- `true` is a yes/no value.

The kind of a value is called its **data type**.

### The basic data types

Type this into `values.js`:

```js
console.log("Backend developer");
console.log(2026);
console.log(true);
console.log(undefined);
console.log(null);
```

Save and run it:

```bash
node values.js
```

The values above use these types:

| Type | Example | Meaning |
|---|---|---|
| String | `"Backend developer"` | Text |
| Number | `2026` | Integer or decimal number |
| Boolean | `true` | Either `true` or `false` |
| Undefined | `undefined` | A value has not been assigned |
| Null | `null` | An intentionally empty value |

JavaScript also has `bigint` and `symbol`. They are valid primitive types, but ordinary backend code uses them less often. You only need to recognize them today:

```js
console.log(9007199254740993n);
console.log(Symbol("id"));
```

The `n` creates a `bigint`. A `Symbol` creates a unique identifier. Do not perform normal number arithmetic with a `bigint` yet.

### Inspect types with `typeof`

Replace the content of `values.js` with:

```js
console.log(typeof "Backend developer");
console.log(typeof 2026);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof 9007199254740993n);
console.log(typeof Symbol("id"));
```

Run it:

```bash
node values.js
```

Expected output:

```text
string
number
boolean
undefined
bigint
symbol
```

Now add:

```js
console.log(typeof null);
```

It prints `object`. This is an old JavaScript behavior, not proof that `null` is really an object. Treat `null` as an intentionally empty primitive value.

### Strings need quotation marks

All of these are strings:

```js
console.log("Node.js");
console.log('PostgreSQL');
console.log(`NestJS`);
```

Without quotation marks, JavaScript treats the text as a variable name.

---

## 20–35 Minutes — Variables with `const` and `let`

### What is a variable?

A variable gives a name to a value so the program can use that value later.

Create a new file named `variables.js`. Type:

```js
const courseName = "Node.js Backend";
const lessonNumber = 2;
const isLearning = true;

console.log(courseName);
console.log(lessonNumber);
console.log(isLearning);
```

Run it:

```bash
node variables.js
```

Read the first statement from left to right:

```js
const courseName = "Node.js Backend";
```

- `const` creates a variable that cannot be reassigned;
- `courseName` is the variable's name;
- `=` assigns the value on the right to the name on the left;
- `"Node.js Backend"` is the stored value.

### Use `const` by default

Use `const` when the variable will not be assigned a different value:

```js
const studentName = "Nahid";
const studyHours = 1;
```

Try to reassign a `const` deliberately:

```js
const currentDay = 2;
currentDay = 3;
```

Run the file. You should see an error similar to:

```text
TypeError: Assignment to constant variable.
```

Read the error and its line number. Then remove those two lines before continuing.

### Use `let` when reassignment is necessary

Type:

```js
let completedLessons = 1;
console.log(completedLessons);

completedLessons = 2;
console.log(completedLessons);
```

The same variable first stores `1`, then stores `2`. That is reassignment.

`let` does not mean “a better version of `const`.” The rule is:

> Use `const` by default. Use `let` only when you know the variable must be reassigned.

Older JavaScript uses `var`. You may see it in old code, but do not use it in this course. Its scope rules are easier to misuse; scope will be covered properly on Day 4.

### Variable naming rules

Good variable names describe their values:

```js
const authorName = "Nahid";
const publishedPostCount = 5;
const isAdmin = false;
```

Use **camelCase**: start with a lowercase word and capitalize later words.

Variable names:

- may contain letters, digits, `_`, and `$`;
- cannot start with a digit;
- cannot contain spaces or hyphens;
- are case-sensitive;
- cannot be reserved words such as `const`, `let`, or `if`.

Examples:

```js
const userName = "Rafi"; // Good
const user2 = "Karim"; // Valid, but not very descriptive
const UserName = "Mina"; // Different variable from userName
```

These would be invalid, so only read them—do not leave them in your runnable file:

```js
// const 2users = 2;
// const user-name = "Rafi";
// const user name = "Rafi";
```

### Declared but not assigned

Type:

```js
let nextTopic;
console.log(nextTopic);
console.log(typeof nextTopic);
```

Because no value was assigned, `nextTopic` contains `undefined`.

---

## 35–50 Minutes — Operators

An **operator** takes one or more values and produces a result.

Create a file named `operators.js`.

### Arithmetic operators

Type:

```js
const firstNumber = 10;
const secondNumber = 3;

console.log(firstNumber + secondNumber);
console.log(firstNumber - secondNumber);
console.log(firstNumber * secondNumber);
console.log(firstNumber / secondNumber);
console.log(firstNumber % secondNumber);
console.log(firstNumber ** secondNumber);
```

Run it:

```bash
node operators.js
```

The operators mean:

| Operator | Operation | Example result |
|---|---|---|
| `+` | Addition | `10 + 3` → `13` |
| `-` | Subtraction | `10 - 3` → `7` |
| `*` | Multiplication | `10 * 3` → `30` |
| `/` | Division | `10 / 3` → approximately `3.33` |
| `%` | Remainder | `10 % 3` → `1` |
| `**` | Exponent | `10 ** 3` → `1000` |

The remainder operator is useful for detecting even numbers:

```js
console.log(10 % 2);
console.log(11 % 2);
```

An even number leaves a remainder of `0` when divided by `2`.

### Operator precedence

Type:

```js
console.log(2 + 3 * 4);
console.log((2 + 3) * 4);
```

Multiplication happens before addition. Parentheses make the intended order explicit. Use parentheses when they make your calculation easier to understand.

### Assignment operators

Type:

```js
let score = 10;
score = score + 5;
console.log(score);

score += 5;
console.log(score);

score -= 2;
console.log(score);
```

`score += 5` is a shorter form of `score = score + 5`.

### Comparison operators

Add:

```js
const age = 20;

console.log(age > 18);
console.log(age >= 20);
console.log(age < 18);
console.log(age === 20);
console.log(age !== 20);
```

Every comparison produces a Boolean: `true` or `false`.

Use strict equality `===` and strict inequality `!==` in this course. Avoid loose equality `==` and `!=`, because they may convert values before comparing them:

```js
console.log(5 === 5);
console.log(5 === "5");
```

The second result is `false`: one value is a number and the other is a string.

### Logical operators

Logical operators combine or reverse Boolean values:

```js
const hasAccount = true;
const hasCorrectPassword = true;
const isBlocked = false;

console.log(hasAccount && hasCorrectPassword);
console.log(hasAccount || hasCorrectPassword);
console.log(!isBlocked);
```

For Boolean values:

- `&&` means **and**—both sides must be true;
- `||` means **or**—at least one side must be true;
- `!` means **not**—it reverses true and false.

You will use these operators with `if` statements on Day 3.

---

## 50–55 Minutes — Build Readable Messages

### String concatenation

The `+` operator can join strings:

```js
const name = "Nahid";
const topic = "Node.js";

console.log("My name is " + name + ". I am learning " + topic + ".");
```

This works, but punctuation and spaces are easy to get wrong.

### Template literals

Template literals use backticks and insert values with `${...}`:

```js
const name = "Nahid";
const topic = "Node.js";

console.log(`My name is ${name}. I am learning ${topic}.`);
```

The backtick character is `` ` ``, not a single quotation mark.

Expressions can also go inside `${...}`:

```js
const price = 500;
const quantity = 3;

console.log(`Total price: ${price * quantity}`);
```

### A common `+` surprise

Run:

```js
console.log(5 + 2);
console.log("5" + 2);
```

The results are different:

```text
7
52
```

When one side is a string, `+` joins the values as text. This is why knowing your data types matters.

---

## 55–60 Minutes — Guided Mini-Project

Create a file named `study-summary.js` and type the following program:

```js
const studentName = "Nahid";
const courseName = "Node.js Backend";
const completedDays = 2;
const totalDays = 110;
const dailyStudyHours = 1;

const remainingDays = totalDays - completedDays;
const completedHours = completedDays * dailyStudyHours;
const isCourseFinished = completedDays === totalDays;

console.log(`Student: ${studentName}`);
console.log(`Course: ${courseName}`);
console.log(`Completed days: ${completedDays}`);
console.log(`Remaining days: ${remainingDays}`);
console.log(`Hours studied: ${completedHours}`);
console.log(`Course finished: ${isCourseFinished}`);
```

Run it:

```bash
node study-summary.js
```

Before changing anything, predict what each line will print. Then change `completedDays` and run the program again. Observe which results change automatically.

## Independent Exercises

Complete these without copying a finished solution.

### Exercise 1 — Personal profile

Create `profile.js`. Store these values in well-named variables:

- your name;
- your age;
- whether you like JavaScript;
- the backend technology you want to learn.

Print one readable sentence using a template literal. Also print the type of every variable.

### Exercise 2 — Rectangle calculator

Create `rectangle.js` with `width` and `height` variables. Calculate and print:

- area: `width * height`;
- perimeter: `2 * (width + height)`.

Change the width and height and confirm that the answers update.

### Exercise 3 — Even-number checker

Create `even-check.js` with a variable named `number`. Without using `if`, create another variable whose value becomes:

- `true` when the number is even;
- `false` when the number is odd.

Hint: combine `%` and `===`.

Test it with at least one even and one odd number.

### Exercise 4 — Access checker

Create `access.js` with these variables:

```js
const hasAccount = true;
const hasCorrectPassword = true;
const isBlocked = false;
```

Create `canLogin`. It should be true only when the user has an account, has the correct password, and is not blocked. Use `&&` and `!`.

Change the three input values one at a time and predict the result before running the program.

### Optional challenge — Temperature converter

Create `temperature.js`. Store a Celsius temperature and convert it to Fahrenheit:

```text
fahrenheit = celsius × 9 ÷ 5 + 32
```

Print a sentence like:

```text
25°C is 77°F.
```

Use a template literal and calculate the value instead of typing `77` directly.

## Common Problems

### `SyntaxError: Identifier 'name' has already been declared`

You declared the same variable twice in the same file:

```js
const name = "Nahid";
const name = "Rafi";
```

Declare it once. If the value truly needs to change, use one `let` declaration and then reassign it.

### `TypeError: Assignment to constant variable`

You tried to assign a new value to a `const`. Decide whether:

- the value should remain unchanged—in that case, remove the reassignment; or
- reassignment is genuinely required—in that case, declare it with `let`.

### `ReferenceError: something is not defined`

Check for:

- a missing declaration;
- a spelling mistake;
- different capitalization;
- missing quotation marks around text.

### A calculation produces `NaN`

`NaN` means **Not a Number**. One of the values in the calculation was probably not usable as a number. Print both the value and its type:

```js
console.log(value);
console.log(typeof value);
```

### Template literal prints `${name}` literally

You probably used quotes instead of backticks:

```js
console.log("Hello ${name}"); // Wrong for interpolation
console.log(`Hello ${name}`); // Correct
```

## Review Questions

Answer without running code first. Then use Node.js to verify your predictions.

1. What is the difference between a value and a variable?
2. When should you use `const`, and when should you use `let`?
3. What does `typeof` do?
4. What is the difference between `undefined` and `null`?
5. What are the results of `10 % 3` and `10 ** 2`?
6. Why is `5 === "5"` false?
7. What is the difference between `&&`, `||`, and `!`?
8. What does `score += 5` mean?
9. Why does `"5" + 2` produce `"52"` instead of `7`?
10. What is a template literal, and which characters does it use?

## Predict the Output

Write down your answers before running this code:

```js
const price = 100;
const quantity = 3;
const discount = 50;
const total = price * quantity - discount;

console.log(total);
console.log(total >= 250);
console.log(typeof total);
console.log(`Final total: ${total}`);
```

Now predict this one:

```js
let lessons = 1;
lessons += 2;

const target = 5;
const hasReachedTarget = lessons >= target;

console.log(lessons);
console.log(hasReachedTarget);
console.log(!hasReachedTarget);
```

Run both examples only after writing your predictions.

## Completion Checklist

Day 2 is complete only when all of these are true:

- [ ] You completed the Day 1 recall questions.
- [ ] You can explain value, variable, and data type in your own words.
- [ ] You know when to choose `const` or `let`.
- [ ] You ran the data-type and operator examples.
- [ ] You deliberately produced and fixed the `const` reassignment error.
- [ ] `study-summary.js` runs successfully.
- [ ] You completed Exercises 1–4.
- [ ] You predicted both output examples before running them.
- [ ] You can answer at least eight of the ten review questions without notes.

## What to Send for Review

Before starting Day 3, send:

1. the code from `profile.js`, `rectangle.js`, `even-check.js`, and `access.js`;
2. the output of each program;
3. your answers to the ten review questions;
4. your predictions and actual output from both prediction exercises;
5. anything that felt confusing.

I will review the variable names, data types, calculations, and Boolean logic step by step. After that, the next lesson is **Day 3 — Control Flow: `if`, `switch`, Loops, and Truthiness**.

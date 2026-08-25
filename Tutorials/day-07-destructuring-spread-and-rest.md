# Day 7 — Destructuring, Spread, and Rest

> Core lesson: about 60 minutes, followed by independent exercises if needed.

## Learning Objectives

You will learn to:

- extract array and object values with destructuring;
- rename properties and provide defaults;
- use destructuring in function parameters;
- copy and combine arrays and objects with spread;
- gather remaining values with rest;
- explain why spread creates only a shallow copy.

## Prerequisites and Setup

Recall array indexes, object properties, nested data, functions, and reference behavior.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-07
cd practice/day-07
code .
```

## 0–18 Minutes — Array Destructuring

Create `array-destructuring.js`:

```js
const technologies = ["Node.js", "PostgreSQL", "Docker"];

const [runtime, database, deploymentTool] = technologies;

console.log(runtime);
console.log(database);
console.log(deploymentTool);
```

Array destructuring matches by position. Variable names are your choice.

Skip an item with an empty position:

```js
const colors = ["red", "green", "blue"];
const [firstColor, , thirdColor] = colors;

console.log(firstColor, thirdColor);
```

Use a default when an element is missing:

```js
const roles = ["admin"];
const [primaryRole, secondaryRole = "reader"] = roles;

console.log(primaryRole, secondaryRole);
```

Swap two variables without a temporary variable:

```js
let first = "A";
let second = "B";

[first, second] = [second, first];

console.log(first, second);
```

## 18–34 Minutes — Object Destructuring

Create `object-destructuring.js`:

```js
const user = {
  id: 7,
  name: "Nahid",
  role: "author",
  isActive: true,
};

const { name, role } = user;

console.log(name);
console.log(role);
```

Object destructuring matches by property name, not position.

### Rename and default

```js
const { name: displayName, email = "Not provided" } = user;

console.log(displayName);
console.log(email);
```

`name: displayName` reads the `name` property into a new variable named `displayName`.

### Nested destructuring

```js
const post = {
  title: "Node.js Basics",
  author: {
    name: "Nahid",
    country: "Bangladesh",
  },
};

const {
  title,
  author: { name: authorName },
} = post;

console.log(title);
console.log(authorName);
```

The destructured `author` object is not automatically stored as a variable here; only `authorName` is created.

### Function parameter destructuring

```js
function printUser({ name, role = "reader" }) {
  console.log(`${name} is a ${role}.`);
}

printUser(user);
printUser({ name: "Mina" });
```

Use this when the function clearly expects an object. Do not destructure dozens of properties in one parameter list.

## 34–48 Minutes — Spread Syntax

Spread uses `...` to expand values.

### Copy and combine arrays

Create `spread.js`:

```js
const coreTopics = ["JavaScript", "Node.js"];
const extraTopics = ["PostgreSQL", "Docker"];

const copiedTopics = [...coreTopics];
const allTopics = [...coreTopics, ...extraTopics];

console.log(copiedTopics);
console.log(allTopics);
console.log(copiedTopics === coreTopics);
```

The copied array has the same elements but a different top-level reference.

Add without mutating the original:

```js
const withNest = [...coreTopics, "NestJS"];

console.log(coreTopics);
console.log(withNest);
```

### Copy, update, and combine objects

```js
const originalPost = {
  id: 1,
  title: "Draft title",
  status: "draft",
};

const publishedPost = {
  ...originalPost,
  title: "Final title",
  status: "published",
};

console.log(originalPost);
console.log(publishedPost);
```

Later properties overwrite earlier properties. Order matters:

```js
const wrongOrder = {
  status: "published",
  ...originalPost,
};

console.log(wrongOrder.status);
```

`originalPost.status` comes later, so it overwrites `"published"`.

## 48–56 Minutes — Rest Syntax

Rest also uses `...`, but it gathers remaining values.

### Rest in array destructuring

```js
const [firstTopic, ...remainingTopics] = [
  "JavaScript",
  "Node.js",
  "NestJS",
];

console.log(firstTopic);
console.log(remainingTopics);
```

### Rest in object destructuring

```js
const account = {
  id: 1,
  name: "Nahid",
  password: "secret-example",
  role: "author",
};

const { password, ...safeAccount } = account;

console.log(safeAccount);
```

This demonstrates excluding a field from a new object. It does not erase the password from `account` or from memory.

### Rest parameters

```js
function sum(...numbers) {
  let total = 0;

  for (const number of numbers) {
    total += number;
  }

  return total;
}

console.log(sum(2, 3));
console.log(sum(1, 2, 3, 4));
```

A rest parameter gathers any number of arguments into an array and must be the last parameter.

## 56–60 Minutes — Shallow Copy Warning

Spread copies only the first level:

```js
const original = {
  title: "Node.js",
  author: {
    name: "Nahid",
  },
};

const copy = { ...original };
copy.title = "NestJS";
copy.author.name = "Changed name";

console.log(original.title);
console.log(original.author.name);
```

The top-level title is independent, but both objects still share the nested `author` object. This is a **shallow copy**.

Copy the nested level when it must also be independent:

```js
const saferCopy = {
  ...original,
  author: {
    ...original.author,
  },
};
```

## Guided Practice — Safe Blog Response

```js
const databaseUser = {
  id: 5,
  name: "Nahid",
  email: "nahid@example.com",
  passwordHash: "not-for-api-response",
  role: "author",
};

const { passwordHash, ...publicUser } = databaseUser;
const response = {
  ...publicUser,
  profileUrl: `/users/${publicUser.id}`,
};

console.log(response);
```

Explain why `passwordHash` is absent and confirm the original object still has it.

## Independent Exercises

1. Destructure the first and third items from an array and gather the rest.
2. Destructure a user's name, rename `role` to `userRole`, and default a missing country.
3. Create an updated post with spread without mutating the original.
4. Merge default settings and user settings so user settings win.
5. Write `average(...numbers)` using a loop.
6. Demonstrate a shallow-copy bug, then fix the nested level with spread.

## Common Mistakes and Debugging

- Arrays destructure by position; objects destructure by property name.
- In `{ name: displayName }`, the new variable is `displayName`, not `name`.
- Object spread order determines which value wins.
- Rest must be last: `[first, ...rest]` is valid.
- Spread is shallow; nested references remain shared.
- Removing a password from a response object is not the same as securely handling stored passwords.

## Review Questions

1. How do array and object destructuring match values?
2. How do you rename a destructured object property?
3. What is the difference between spread and rest?
4. Does `[...array]` create a new top-level array?
5. Why does object spread order matter?
6. What does shallow copy mean?
7. What does a rest parameter receive?
8. Why might a backend exclude `passwordHash` from a response?

## Completion Checklist

- [ ] All examples run.
- [ ] You can distinguish spread from rest by context.
- [ ] You completed all six exercises.
- [ ] You reproduced and fixed a shallow-copy problem.
- [ ] You answered at least six review questions without notes.

## Next Blog Milestone

Destructuring and spread will be used constantly in request data, configuration, DTO-like objects, and safe response shaping.

## What to Send for Review

Send all exercise code, output, review answers, and your shallow-copy explanation. Next: **Day 8 — `map`, `filter`, `find`, `some`, and `every`**.

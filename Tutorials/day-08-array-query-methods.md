# Day 8 — Array Methods: `map`, `filter`, `find`, `some`, and `every`

> Core lesson: about 60 minutes. Complete the independent exercises before moving on.

## Learning Objectives

You will learn to:

- pass callback functions to array methods;
- transform every item with `map`;
- select matching items with `filter`;
- locate one item with `find`;
- test arrays with `some` and `every`;
- choose the correct method from the desired result.

## Prerequisites and Setup

Recall arrays of objects, functions, arrow functions, returns, comparisons, and spread.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-08
cd practice/day-08
code .
```

## 0–12 Minutes — Callbacks and Shared Data

Create `posts.js`:

```js
const posts = [
  { id: 1, title: "Node Basics", status: "published", views: 120 },
  { id: 2, title: "Functions", status: "draft", views: 40 },
  { id: 3, title: "Arrays", status: "published", views: 200 },
  { id: 4, title: "Objects", status: "draft", views: 75 },
];
```

An array method receives a **callback**—a function it calls for array items.

```js
const printTitle = (post) => {
  console.log(post.title);
};

posts.forEach(printTitle);
```

The method controls when the callback runs. `forEach` is useful for side effects such as printing, but it does not build a useful result array. Today's five query methods do.

## 12–24 Minutes — Transform with `map`

Append to `posts.js`:

```js
const titles = posts.map((post) => {
  return post.title;
});

console.log(titles);
console.log(posts);
```

`map` returns a new array with exactly one output for every input.

Concise form:

```js
const labels = posts.map((post) => `${post.id}: ${post.title}`);
console.log(labels);
```

Transform objects without mutating them:

```js
const postsWithLabels = posts.map((post) => ({
  ...post,
  label: `${post.title} (${post.views} views)`,
}));

console.log(postsWithLabels);
```

Parentheses around the object literal tell the arrow function to return that object.

## 24–34 Minutes — Select with `filter`

```js
const publishedPosts = posts.filter((post) => {
  return post.status === "published";
});

const popularPosts = posts.filter((post) => post.views >= 100);

console.log(publishedPosts);
console.log(popularPosts);
```

`filter` returns a new array containing zero, one, or many matching items. The callback must produce a Boolean-like decision.

Combine conditions:

```js
const publishedAndPopular = posts.filter(
  (post) => post.status === "published" && post.views >= 100,
);
```

## 34–42 Minutes — Locate with `find`

```js
const requestedId = 3;
const foundPost = posts.find((post) => post.id === requestedId);

console.log(foundPost);
```

`find` returns the first matching item, not an array. If nothing matches, it returns `undefined`:

```js
const missingPost = posts.find((post) => post.id === 999);
console.log(missingPost);
```

Handle that possibility:

```js
if (missingPost === undefined) {
  console.log("Post not found");
}
```

Do not use `filter(...)[0]` when you only need the first match; `find` communicates the intent directly and can stop searching early.

## 42–50 Minutes — Test with `some` and `every`

```js
const hasDraft = posts.some((post) => post.status === "draft");
const hasVeryPopularPost = posts.some((post) => post.views >= 1000);

console.log(hasDraft);
console.log(hasVeryPopularPost);
```

`some` returns true when at least one item passes.

```js
const allHaveTitles = posts.every((post) => post.title.length > 0);
const allArePublished = posts.every(
  (post) => post.status === "published",
);

console.log(allHaveTitles);
console.log(allArePublished);
```

`every` returns true only when all items pass.

Useful empty-array behavior:

```js
console.log([].some(() => true));
console.log([].every(() => false));
```

The results are `false` and `true`. There is no item satisfying `some`, and no item violating `every`. When emptiness matters, check `array.length` separately.

## 50–60 Minutes — Choose the Correct Method

Ask what result you need:

| Need | Method | Result |
|---|---|---|
| One transformed output per item | `map` | New array, same length |
| All matching items | `filter` | New array, length may differ |
| First matching item | `find` | Item or `undefined` |
| Whether at least one matches | `some` | Boolean |
| Whether all match | `every` | Boolean |

Create `user-queries.js`:

```js
const users = [
  { id: 1, name: "Nahid", role: "author", isActive: true },
  { id: 2, name: "Mina", role: "reader", isActive: true },
  { id: 3, name: "Rafi", role: "admin", isActive: false },
];

const names = users.map((user) => user.name);
const activeUsers = users.filter((user) => user.isActive);
const admin = users.find((user) => user.role === "admin");
const hasInactiveUser = users.some((user) => !user.isActive);
const allHaveNames = users.every((user) => user.name.length > 0);

console.log({ names, activeUsers, admin, hasInactiveUser, allHaveNames });
```

Predict the type and shape of every result before running it.

## Guided Practice — Public Post List

Create `public-posts.js`. Starting from the shared `posts` data:

1. select published posts;
2. turn them into objects containing only `id`, `title`, and `views`;
3. check whether at least one result has 150 or more views;
4. check whether every result has a non-empty title.

Use separate named variables so every step is visible. Chaining comes tomorrow.

## Independent Exercises

1. Given numbers 1–10, create their squares with `map` and their even values with `filter`.
2. Find a user by ID and handle the missing case.
3. Check whether any user is an admin and whether every user is active.
4. From an array of products, select in-stock products and map them to display labels.
5. Given comments with `isApproved`, build approved comments and check whether any unapproved comment remains.

## Common Mistakes and Debugging

- A callback with braces needs `return`: `(item) => { return item.id; }`.
- `map` always returns an array; `find` returns one item or `undefined`.
- `filter` keeps original items; it does not turn them into Booleans.
- Use `===` when matching IDs; string `"3"` and number `3` differ.
- Avoid mutating objects inside `map`; return a spread copy when adding fields.
- `forEach` returns `undefined`; do not assign it expecting a transformed array.

## Review Questions

1. What is a callback?
2. Which method returns the same number of elements as the input?
3. How do `filter` and `find` differ?
4. What does `find` return when nothing matches?
5. How do `some` and `every` differ?
6. Why might `[].every(...)` return true?
7. Why do object-returning concise arrows use parentheses?
8. Which method would you use to test whether an admin exists?

## Completion Checklist

- [ ] You ran every method against the shared data.
- [ ] You predicted each result's type and shape.
- [ ] `public-posts.js` works.
- [ ] You completed all five exercises.
- [ ] You can choose a method without trial and error.

## Next Blog Milestone

These methods will shape API responses, select records, locate resources, and verify permissions. Database queries later perform similar work closer to the data.

## What to Send for Review

Send `public-posts.js`, five exercise solutions and outputs, review answers, and any confusing result. Next: **Day 9 — `reduce` and Method Chaining**.

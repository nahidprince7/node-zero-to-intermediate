# Day 9 — `reduce` and Method Chaining

> Core lesson: about 60 minutes. `reduce` often needs more than one session to feel natural; do not rush it.

## Learning Objectives

You will learn to:

- explain accumulator, current item, and initial value;
- combine an array into one result with `reduce`;
- calculate totals and build grouped data;
- chain array methods in a readable order;
- choose a loop or simpler method when `reduce` would obscure intent;
- debug missing returns and incorrect initial values.

## Prerequisites and Setup

Recall arrow functions, arrays of objects, spread, and the result shapes of `map`, `filter`, `find`, `some`, and `every`.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-09
cd practice/day-09
code .
```

## 0–12 Minutes — Why `reduce` Exists

`reduce` processes an array and carries one accumulated result from item to item. The final result can be a number, string, object, array, or another value.

Create `sum.js`:

```js
const numbers = [10, 20, 30, 40];

const total = numbers.reduce((accumulator, currentNumber) => {
  return accumulator + currentNumber;
}, 0);

console.log(total);
```

On each step:

| Step | Accumulator before | Current number | Returned accumulator |
|---|---:|---:|---:|
| 1 | 0 | 10 | 10 |
| 2 | 10 | 20 | 30 |
| 3 | 30 | 30 | 60 |
| 4 | 60 | 40 | 100 |

The callback's returned value becomes the next accumulator. `0` is the initial value.

Concise form:

```js
const conciseTotal = numbers.reduce(
  (accumulator, number) => accumulator + number,
  0,
);
```

## 12–24 Minutes — Initial Values and Common Calculations

Use an explicit initial value. It makes the accumulator's starting type clear and handles empty arrays safely.

```js
console.log([].reduce((total, number) => total + number, 0));
```

Without an initial value, reducing an empty array throws a `TypeError`.

### Total object properties

Create `orders.js`:

```js
const orderItems = [
  { name: "Book", price: 300, quantity: 2 },
  { name: "Pen", price: 20, quantity: 5 },
  { name: "Notebook", price: 120, quantity: 1 },
];

const orderTotal = orderItems.reduce((total, item) => {
  return total + item.price * item.quantity;
}, 0);

console.log(orderTotal);
```

### Find maximum carefully

```js
const values = [12, 7, 45, 20];

const maximum = values.reduce((largest, value) => {
  if (value > largest) {
    return value;
  }

  return largest;
}, values[0]);

console.log(maximum);
```

This assumes the array is non-empty. In production code, decide explicitly what an empty input should return or reject it first.

## 24–38 Minutes — Build Objects with `reduce`

Create `grouping.js`:

```js
const posts = [
  { id: 1, title: "Node Basics", status: "published" },
  { id: 2, title: "Functions", status: "draft" },
  { id: 3, title: "Arrays", status: "published" },
  { id: 4, title: "Objects", status: "draft" },
];

const countByStatus = posts.reduce((counts, post) => {
  counts[post.status] = (counts[post.status] ?? 0) + 1;
  return counts;
}, {});

console.log(countByStatus);
```

Expected result:

```js
{ published: 2, draft: 2 }
```

`??` uses the right side only when the left side is `null` or `undefined`. The first time a status appears, its count starts at zero.

This reducer mutates its local accumulator object and returns the same object. That is acceptable when deliberate and contained inside the reduction. A spread copy on every item is more immutable-looking but creates many short-lived objects.

### Index records by ID

```js
const postsById = posts.reduce((index, post) => {
  index[post.id] = post;
  return index;
}, {});

console.log(postsById[3]);
```

The result makes repeated lookup by ID direct. Later you will also learn `Map` and database indexes; choose data structures according to the real need.

## 38–50 Minutes — Method Chaining

Each method can feed its result into the next method. Create `chaining.js`:

```js
const posts = [
  { id: 1, title: "Node Basics", status: "published", views: 120 },
  { id: 2, title: "Functions", status: "draft", views: 40 },
  { id: 3, title: "Arrays", status: "published", views: 200 },
  { id: 4, title: "Objects", status: "published", views: 75 },
];

const popularPublishedLabels = posts
  .filter((post) => post.status === "published")
  .filter((post) => post.views >= 100)
  .map((post) => `${post.title}: ${post.views} views`);

console.log(popularPublishedLabels);
```

Read a chain from top to bottom:

1. start with all posts;
2. keep published posts;
3. keep posts with at least 100 views;
4. turn each remaining post into a label.

Combine the two filter conditions when that is clearer:

```js
const labels = posts
  .filter(
    (post) => post.status === "published" && post.views >= 100,
  )
  .map((post) => `${post.title}: ${post.views} views`);
```

### Chain into `reduce`

```js
const totalPublishedViews = posts
  .filter((post) => post.status === "published")
  .reduce((total, post) => total + post.views, 0);

console.log(totalPublishedViews);
```

The filter returns an array; reduce turns that array into one number.

## 50–60 Minutes — Readability and Guided Practice

The shortest code is not automatically the clearest. Use named intermediate values when debugging or when steps represent meaningful concepts:

```js
const publishedPosts = posts.filter(
  (post) => post.status === "published",
);

const publishedViews = publishedPosts.map((post) => post.views);

const totalViews = publishedViews.reduce(
  (total, views) => total + views,
  0,
);

console.log(totalViews);
```

Use `reduce` when the goal is genuinely “combine into one result.” Prefer:

- `map` for one transformed result per item;
- `filter` for matching items;
- `find` for one match;
- `some`/`every` for Boolean questions;
- a plain loop when it communicates complex state more clearly.

## Guided Practice — Blog Analytics

Create `blog-analytics.js` with at least five posts containing `status`, `author`, and `views`. Produce:

1. total views across all posts;
2. total views for published posts only;
3. a count grouped by status;
4. an object mapping post IDs to titles;
5. labels for published posts with at least 100 views.

Predict every result before running it.

## Independent Exercises

1. Calculate a shopping-cart subtotal from price and quantity.
2. Calculate the average of an array. Decide what an empty array should produce.
3. Count how many times each word occurs in an array.
4. Group users by role into arrays: `{ admin: [...], author: [...], reader: [...] }`.
5. Chain `filter`, `map`, and `reduce` to total the prices of in-stock products.
6. Rewrite one complicated reducer as a plain loop and state which version is clearer.

## Common Mistakes and Debugging

- With braces, a reducer callback must return the next accumulator.
- A number total should normally start at `0`; an object result at `{}`; an array result at `[]`.
- Omitting an initial value makes empty arrays throw and changes the first callback step.
- Do not use `reduce` just to appear clever.
- A chain's method order changes both meaning and available data.
- Log intermediate values or split the chain when debugging.

## Review Questions

1. What are the accumulator, current item, and initial value?
2. What becomes the next accumulator?
3. Why should an explicit initial value usually be provided?
4. What initial value fits a sum? A grouped object?
5. When is `reduce` more appropriate than `map`?
6. How do you read a method chain?
7. Why might named intermediate variables be preferable?
8. What happens if a reducer callback forgets to return?

## Completion Checklist

- [ ] You traced a reduction step by step on paper.
- [ ] `blog-analytics.js` produces all five results.
- [ ] You completed all six exercises.
- [ ] You tested an empty array deliberately.
- [ ] You can explain when not to use `reduce`.

## Next Blog Milestone

Aggregation and pipelines will later power analytics, response shaping, and reusable query logic. Large database aggregations should usually happen in the database rather than loading everything into Node.js.

## What to Send for Review

Send `blog-analytics.js`, exercise solutions and output, review answers, and your reducer-versus-loop comparison. Next: **Day 10 — ES Modules and Clean File Organization**.

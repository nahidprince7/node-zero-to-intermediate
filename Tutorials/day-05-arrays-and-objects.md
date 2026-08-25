# Day 5 — Arrays and Objects

> Core lesson: about 60 minutes, followed by independent exercises if needed.

## Learning Objectives

You will learn to:

- create, read, and update arrays;
- use indexes, `length`, and basic array methods;
- create, read, update, and delete object properties;
- choose dot or bracket notation;
- work with nested arrays and objects;
- understand reference behavior at an introductory level.

## Prerequisites and Setup

Recall: values, `const`/`let`, loops, functions, parameters, and return values.

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-05
cd practice/day-05
code .
```

## 0–22 Minutes — Arrays

An array stores an ordered collection of values. Create `arrays.js`:

```js
const topics = ["JavaScript", "Node.js", "NestJS"];

console.log(topics);
console.log(topics[0]);
console.log(topics[1]);
console.log(topics[2]);
console.log(topics.length);
```

Indexes begin at `0`, so the last valid index is `length - 1`:

```js
console.log(topics[topics.length - 1]);
```

An invalid index returns `undefined`:

```js
console.log(topics[99]);
```

### Update and add elements

```js
topics[1] = "Node.js Runtime";
topics.push("PostgreSQL");
topics.unshift("Git");

console.log(topics);
```

- assignment updates a known index;
- `push` adds to the end;
- `unshift` adds to the beginning.

### Remove elements

```js
const lastTopic = topics.pop();
const firstTopic = topics.shift();

console.log(lastTopic);
console.log(firstTopic);
console.log(topics);
```

`pop` and `shift` both mutate the array and return the removed value.

### Why can a `const` array change?

`const` prevents assigning a completely different value to `topics`:

```js
// topics = ["Different array"]; // TypeError
```

It does not freeze the existing array. Its contents can still be changed.

### Loop through an array

```js
const tools = ["Node.js", "PostgreSQL", "Docker"];

for (const tool of tools) {
  console.log(`I will learn ${tool}.`);
}
```

Use `for...of` when you need each value. Array transformation methods arrive on Day 8.

## 22–42 Minutes — Objects

An object groups related values using named properties. Create `objects.js`:

```js
const user = {
  name: "Nahid",
  age: 25,
  role: "author",
  isActive: true,
};

console.log(user);
console.log(user.name);
console.log(user.role);
```

Unlike an array index, an object property name describes the value.

### Dot and bracket notation

```js
console.log(user.name);
console.log(user["name"]);

const requestedProperty = "role";
console.log(user[requestedProperty]);
```

Use dot notation for a known normal property. Use bracket notation when the property name comes from a variable or is not a valid dot-notation identifier.

```js
const settings = {
  "dark-mode": true,
};

console.log(settings["dark-mode"]);
```

### Update, add, and delete

```js
user.role = "admin";
user.email = "nahid@example.com";
delete user.age;

console.log(user);
```

Deletion is available, but real backend code often creates a new deliberate shape instead of repeatedly deleting properties.

### Check for a property

```js
console.log("email" in user);
console.log("age" in user);
console.log(Object.hasOwn(user, "name"));
```

`Object.hasOwn` checks whether the property belongs directly to this object.

### Object methods

A property can store a function:

```js
const post = {
  title: "Learning Node.js",
  status: "draft",
  publish() {
    this.status = "published";
  },
};

console.log(post.status);
post.publish();
console.log(post.status);
```

Here `this` refers to the object before the dot in `post.publish()`. This is only an introduction; `this` has more rules that will be taught later when needed.

## 42–52 Minutes — Nested Data

Create `nested-data.js`:

```js
const blogPost = {
  id: 1,
  title: "My First Post",
  author: {
    id: 7,
    name: "Nahid",
  },
  tags: ["node", "backend"],
  comments: [
    {
      id: 101,
      body: "Helpful post!",
      isApproved: true,
    },
    {
      id: 102,
      body: "Please add examples.",
      isApproved: false,
    },
  ],
};

console.log(blogPost.title);
console.log(blogPost.author.name);
console.log(blogPost.tags[0]);
console.log(blogPost.comments[1].body);
```

Read nested access from left to right. `blogPost.comments[1].body` means: get the comments array, get its second object, then get that object's body.

Loop over comments:

```js
for (const comment of blogPost.comments) {
  console.log(`${comment.id}: ${comment.body}`);
}
```

Update nested data:

```js
blogPost.comments[1].isApproved = true;
blogPost.tags.push("javascript");
```

## 52–60 Minutes — Reference Behavior

Arrays and objects are reference values. Create `references.js`:

```js
const originalUser = {
  name: "Nahid",
  role: "reader",
};

const sameUser = originalUser;
sameUser.role = "author";

console.log(originalUser.role);
console.log(sameUser.role);
console.log(originalUser === sameUser);
```

Both variables refer to the same object, so changing through one name is visible through the other. On Day 7, spread syntax will create shallow copies.

Compare two separate objects:

```js
console.log({ name: "Nahid" } === { name: "Nahid" });
```

The result is `false` because they are two different objects, even though their contents look equal.

## Guided Practice — Blog Summary

Create `blog-summary.js`:

```js
const posts = [
  { id: 1, title: "Node Basics", status: "published" },
  { id: 2, title: "Functions", status: "draft" },
  { id: 3, title: "Arrays", status: "published" },
];

console.log(`Total posts: ${posts.length}`);

for (const post of posts) {
  console.log(`${post.id}. ${post.title} [${post.status}]`);
}
```

Add a fourth post with `push`, update the second post's status, and run it again.

## Independent Exercises

1. **Shopping list:** Create an array, add two items, remove one, update one, and print every item with `for...of`.
2. **Student record:** Create an object with identity, subjects array, address object, and active status. Read and update nested values.
3. **Blog post:** Model a post with author, tags, and at least two comments. Print a readable summary without hardcoding values outside the object.
4. **Reference experiment:** Assign one object to two variables, mutate it, and explain the output in a comment.

## Common Mistakes and Debugging

- Arrays start at index `0`, not `1`.
- `array.length` is a property; do not write `array.length()`.
- `user[role]` reads the variable `role`; `user["role"]` reads the literal property.
- `const` does not make an object immutable.
- `user.address.city` fails if `address` does not exist. Inspect each level.
- `pop()` changes the original array; it does not merely inspect the last item.

## Review Questions

1. What is the first index of an array?
2. How do `push`, `pop`, `unshift`, and `shift` differ?
3. When should bracket notation be used?
4. Can a `const` object's properties change? Why?
5. How do you read the title of the first object in a `posts` array?
6. Why are two identical-looking object literals not strictly equal?
7. What does `for...of` provide on each repetition?
8. What does `Object.hasOwn` check?

## Completion Checklist

- [ ] All example files run.
- [ ] You can navigate nested blog data without guessing.
- [ ] You completed all four exercises.
- [ ] You can explain reference behavior in your own words.
- [ ] You answered at least six review questions without notes.

## Next Blog Milestone

Users, posts, tags, and comments will later be database records. Today you learned their in-memory JavaScript shapes.

## What to Send for Review

Send all exercise code, output, review answers, and your reference-behavior explanation. Next: **Day 6 — Git Basics**.

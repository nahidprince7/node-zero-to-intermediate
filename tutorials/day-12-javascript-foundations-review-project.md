# Day 12 ↻ — JavaScript Foundations Review Project

> This is a review and practice day. No new concept is required. Budget 60–90 minutes and continue next session if necessary.

## Learning Objectives

You will prove that you can combine Days 1–11 by building a modular **Blog Content Report** without copying a finished solution.

The project must use:

- values, `const`/`let`, and operators;
- conditions and loops;
- functions with parameters and return values;
- arrays and nested objects;
- destructuring, spread, and rest;
- `map`, `filter`, `find`, `some`, `every`, and `reduce`;
- ES module imports and exports;
- deliberate debugging and readable output.

## Project Rules

- Build in small working steps and run after every step.
- Use no external packages.
- Do not search for or request a complete solution before attempting it.
- Commit only when a milestone works.
- If a requirement is unclear, write your assumption in `README.md` inside the project.

## Setup

```bash
cd /home/nahid/Projects/Learning/app
mkdir -p practice/day-12/src/data
mkdir -p practice/day-12/src/utils
cd practice/day-12
code .
```

Create `package.json`:

```json
{
  "name": "day-12-blog-report",
  "private": true,
  "type": "module"
}
```

Target structure:

```text
practice/day-12/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── posts.js
    └── utils/
        ├── posts.js
        └── index.js
```

## 0–15 Minutes — Model the Data

In `src/data/posts.js`, export an array containing at least six post objects. Every post needs:

```text
id, title, status, author, tags, views, comments
```

Requirements:

- use both `published` and `draft` statuses;
- use at least two authors;
- make `author` a nested object with `id` and `name`;
- make `tags` an array;
- make `comments` an array of objects with `id`, `body`, and `isApproved`;
- include one post with zero views and one with no comments.

Example shape for one item—not a full dataset:

```js
{
  id: 1,
  title: "Learning Node.js",
  status: "published",
  author: { id: 10, name: "Nahid" },
  tags: ["node", "backend"],
  views: 120,
  comments: [
    { id: 101, body: "Helpful!", isApproved: true },
  ],
}
```

Export the array with a named export. Import it into `app.js` and print it with `console.table` before continuing.

## 15–35 Minutes — Build Utility Functions

In `src/utils/posts.js`, implement these functions one at a time:

1. `getPublishedPosts(posts)` → published post array.
2. `findPostById(posts, id)` → one post or `undefined`.
3. `getPostLabels(posts)` → strings such as `1: Learning Node.js`.
4. `getTotalViews(posts)` → one number.
5. `hasDraft(posts)` → Boolean.
6. `allPostsHaveTitles(posts)` → Boolean.
7. `countPostsByStatus(posts)` → object such as `{ published: 4, draft: 2 }`.
8. `getApprovedComments(post)` → approved comments for one post.
9. `createPublicPost(post)` → a new object containing `id`, `title`, author name, tags, views, and approved-comment count.

Use the array method that best communicates each job. Every function must return a value; utilities should not print.

Export them through `src/utils/index.js`.

## 35–50 Minutes — Produce the Report

In `src/app.js`, import the data and utilities. Print a readable report containing:

```text
BLOG CONTENT REPORT
Total posts: ...
Published posts: ...
Draft exists: ...
All posts have titles: ...
Total views: ...
Posts by status: ...
```

Then:

- print public versions of published posts with `console.table`;
- look up one existing ID and one missing ID;
- use an `if` statement to print either the found title or `Post not found`;
- loop over published posts and print their approved-comment counts.

Do not hardcode calculated answers in output strings.

## 50–60 Minutes — Validate and Debug

Test at least these cases:

- empty post array;
- missing post ID;
- post with no comments;
- post with zero views;
- draft-only array;
- title set to an empty string.

Use breakpoints or focused console output to inspect one unexpected result. Record the bug and fix in the project `README.md`:

```markdown
## Debugging Note

- Symptom:
- Cause:
- Fix:
- Test used to verify:
```

## Independent Extensions

Complete at least three:

1. `getPostsByAuthor(posts, authorId)`.
2. `getUniqueTags(posts)` without returning duplicate tags.
3. `getMostViewedPost(posts)` with explicit empty-array behavior.
4. `searchPosts(posts, searchTerm)` with case-insensitive title matching.
5. `createUpdatedPost(post, updates)` using spread without mutating the original.
6. Produce an author summary containing post count and total views.

## Common Mistakes and Debugging Advice

- Do not print inside reusable calculation functions.
- Do not mutate the original dataset unless the requirement says so.
- `find` may return `undefined`; handle it before property access.
- Give every `reduce` an intentional initial value.
- Import paths are relative to the importing file and require `.js`.
- Split a long chain into named steps when debugging.

## Review Questions

1. Which method did you use for each utility, and why?
2. Which functions return arrays, objects, Booleans, or numbers?
3. Where did destructuring improve readability?
4. Where did spread prevent mutation?
5. Which edge case exposed the most useful bug?
6. How does module organization improve this project?
7. What would you refactor if the dataset grew to one million posts?
8. Which Day 1–11 topic still feels weakest?

## Completion Checklist

- [ ] The required structure and six-post dataset exist.
- [ ] All nine utility functions work.
- [ ] The report is calculated rather than hardcoded.
- [ ] All six edge cases were tested.
- [ ] At least three extensions are complete.
- [ ] A debugging note explains one real issue.
- [ ] The code has a meaningful Git commit.

## What to Send for Review

Send the directory tree, all source files, output, edge-case results, debugging note, and review answers. Next: **Day 13 — Callbacks and the Event Loop Mental Model**.

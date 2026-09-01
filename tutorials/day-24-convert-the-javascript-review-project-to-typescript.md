# Day 24 ↻ — Convert the JavaScript Review Project to TypeScript

> Review project: about 60–90 minutes. Introduce no new feature unless the migration exposes a gap. Convert the Day 12 project without changing its behavior.

## Learning Objectives

You will prove that you can combine Days 19–23 by:

- migrating a multi-file JavaScript project to strict TypeScript;
- designing types from real data and function contracts;
- handling missing values and finite states safely;
- preserving NodeNext ES-module imports;
- removing every implicit or explicit `any`;
- verifying that behavior remains unchanged.

## Project Rules

- Keep the Day 12 project intact; work in `practice/day-24`.
- Migrate in small, compiling steps rather than renaming everything at once.
- Preserve the report's behavior before adding improvements.
- Do not use `any`, unsafe assertions, `@ts-ignore`, or weakened compiler settings.
- Commit only after the build and runtime checks succeed.

## 0–12 Minutes — Copy and Configure

Copy your completed Day 12 project:

```bash
cd /home/nahid/Projects/Learning/app
cp -R practice/day-12 practice/day-24
cd practice/day-24
npm install --save-dev typescript
```

Change the package name and scripts:

```bash
npm pkg set name=day-24-typescript-blog-report
npm pkg set private=true --json
npm pkg set type=module
npm pkg set scripts.build=tsc
npm pkg set scripts.start="node dist/app.js"
```

Create the strict `tsconfig.json` used since Day 19:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Ensure `.gitignore` contains `node_modules/` and `dist/`.

## 12–25 Minutes — Model the Domain First

Create `src/types.ts` before renaming the other files:

```ts
export type PostStatus = "draft" | "published";

export interface Author {
  readonly id: number;
  name: string;
}

export interface Comment {
  readonly id: number;
  body: string;
  isApproved: boolean;
}

export interface Post {
  readonly id: number;
  title: string;
  status: PostStatus;
  author: Author;
  tags: string[];
  views: number;
  comments: Comment[];
}

export interface PublicPost {
  id: number;
  title: string;
  authorName: string;
  tags: string[];
  views: number;
  approvedCommentCount: number;
}

export type PostCounts = Record<PostStatus, number>;
```

These types reflect the actual Day 12 data. Do not make a required field optional just because one object is incomplete; fix the object or intentionally change the domain contract.

## 25–38 Minutes — Migrate Data and Modules

Rename one file at a time:

```bash
mv src/data/posts.js src/data/posts.ts
mv src/utils/posts.js src/utils/posts.ts
mv src/utils/index.js src/utils/index.ts
mv src/app.js src/app.ts
```

Annotate the dataset:

```ts
import type { Post } from "../types.js";

export const posts: Post[] = [
  // Your original six or more posts
];
```

Keep local import specifiers ending in `.js`:

```ts
import { posts } from "./data/posts.js";
import { getPublishedPosts } from "./utils/index.js";
```

With NodeNext ESM, those specifiers describe the emitted runtime files. TypeScript resolves them back to the `.ts` source while building.

Run after each migrated file:

```bash
npm run build
```

## 38–52 Minutes — Type Every Utility Contract

Import domain types with `import type`, then annotate parameters and exported returns:

```ts
import type { Comment, Post, PostCounts, PublicPost } from "../types.js";

export function getPublishedPosts(posts: Post[]): Post[] {
  return posts.filter((post) => post.status === "published");
}

export function findPostById(
  posts: Post[],
  id: number,
): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function getApprovedComments(post: Post): Comment[] {
  return post.comments.filter((comment) => comment.isApproved);
}
```

Write the remaining contracts yourself. For `reduce`, give the accumulator an intentional type and initial value. A status counter starts with both required keys:

```ts
const initialCounts: PostCounts = { draft: 0, published: 0 };
```

Handle `findPostById` with narrowing before reading `.title`. Do not use `!` to pretend the result exists.

## 52–60 Minutes — Verify Behavior, Not Only Types

Build and run:

```bash
npm run build
npm start
```

Compare Day 12 and Day 24 output. Type checking can succeed while calculations are wrong, so rerun all original edge cases:

- empty post array;
- missing ID;
- no comments;
- zero views;
- draft-only input;
- empty title.

Record each migration error in `README.md`:

```markdown
## Migration Note

- Diagnostic:
- What the type exposed:
- Fix:
- Runtime check used:
```

## Independent Project Requirements

1. All Day 12 source is migrated to `.ts`.
2. Every domain object has a reusable named type.
3. All nine original utilities have explicit public contracts.
4. Missing `find` results are narrowed safely.
5. Statuses use a literal union rather than unrestricted `string`.
6. Status counts use `Record<PostStatus, number>`.
7. At least three Day 12 extensions are migrated.
8. All six edge cases still pass.
9. Search the project and confirm no `any`, `@ts-ignore`, or non-null assertion was used.
10. Clean `dist`, rebuild, and run the emitted JavaScript.

## Common Mistakes and Debugging Advice

- Do not rename every file before getting one compiling slice.
- A type error often reveals a real missing-data case; read it before editing.
- Under NodeNext ESM, keep `.js` in relative import specifiers.
- `import type` makes a type-only dependency explicit.
- Do not solve a missing key by making most of the model optional.
- Type assertions and non-null assertions provide no runtime evidence.
- Preserve behavior first; refactor only after the migration works.

## Review Questions

1. Which Day 12 bug or ambiguity did TypeScript expose?
2. Why is `PostStatus` narrower than `string`?
3. Why can `findPostById` return `undefined`?
4. Why do source imports still end in `.js`?
5. Which types exist only during compilation?
6. Where did inference remove unnecessary annotations?
7. Why must runtime edge cases still be tested?
8. What would be unsafe about using `as Post` on unknown JSON?

## Completion Checklist

- [ ] Strict build and runtime execution succeed.
- [ ] Day 12 behavior and output are preserved.
- [ ] All ten project requirements are complete.
- [ ] No `any`, ignore comment, or unsafe assertion remains.
- [ ] Migration diagnostics and fixes are documented.
- [ ] A meaningful Git commit records the completed conversion.

## What to Send for Review

Send the directory tree, `package.json`, `tsconfig.json`, all source files, clean build output, edge-case results, migration notes, and review answers. Next: **Day 25 — Classes, Constructors, Access Modifiers, and `readonly`**.

# Day 29 ↻ — TypeScript Review: Fix Every Error Without `any`

> Review project: about 60–90 minutes. No new TypeScript feature is required. Diagnose each error and improve the model instead of escaping the type system.

## Learning Objectives

You will prove that you can:

- read a diagnostic from the innermost mismatch outward;
- distinguish compile-time, lint, and runtime failures;
- repair incorrect models and unsafe control flow;
- validate `unknown` external input;
- preserve useful generic relationships;
- finish with zero `any`, ignore comments, and unsafe assertions.

## Setup

Copy the completed Day 24 TypeScript report so the original remains intact:

```bash
cd /home/nahid/Projects/Learning/app
cp -R practice/day-24 practice/day-29
cd practice/day-29
npm pkg set name=day-29-typescript-review
```

Bring over Day 28's ESLint, Prettier, and npm-script setup if it is not already present.

Before changing code, run and save the baseline:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm start
```

## The Error-Fixing Loop

For every failure:

1. Read the file, line, error code, expected type, and actual type.
2. State what guarantee the compiler cannot prove.
3. Decide whether the data, type, function contract, or control flow is wrong.
4. Make the smallest honest fix.
5. Rerun the narrowest relevant check.
6. run the full suite after the group is fixed;
7. record what you learned.

Use this note format:

```markdown
### TSxxxx — Short title

- Compiler could not prove:
- Root cause:
- Fix:
- Why `any` would hide the problem:
- Runtime case tested:
```

## 0–15 Minutes — Contract Errors

Introduce and then repair examples of:

- a string assigned to a numeric ID;
- a missing required property;
- an unsupported status literal;
- an excess property caused by a misspelling;
- a function returning a value outside its declared return type.

Do not widen `PostStatus` to `string`. Do not make a field optional unless absence is valid in the domain.

## 15–28 Minutes — Missing Values and Narrowing

Test these unsafe patterns and fix them without `!`:

```ts
const selectedPost = posts.find((post) => post.id === 999);
console.log(selectedPost.title);

const firstTag = posts[0].tags[0];
console.log(firstTag.toUpperCase());
```

There are multiple possibly missing steps. Narrow each one, use optional chaining where absence should flow through, or redesign the function to return a deliberate result.

Also test empty string and zero values so a truthiness check does not incorrectly treat valid data as absent.

## 28–42 Minutes — Unknown Runtime Data

Pretend one post came from JSON:

```ts
const incoming: unknown = JSON.parse(
  '{"id":1,"title":"Review","status":"published"}',
);
```

Do not cast it to `Post`. Write or reuse guards that validate every required nested field before admitting it to the report. Test:

- `null`;
- an array instead of an object;
- missing comments;
- a string view count;
- an unknown status;
- one invalid nested comment.

Explain why `JSON.parse` and a TypeScript annotation cannot make external data trustworthy.

## 42–54 Minutes — Generics and Utility Types

Repair these design mistakes:

- a generic `findById` that loses the concrete item type;
- a property helper that accepts any string key;
- `Partial<Post>` used as an update type, allowing ID or author changes;
- a `Record<PostStatus, number>` missing one status;
- a generic type parameter used only once with no relationship to preserve.

Derive narrow create, update, summary, and count models. Favor readable aliases over one giant nested utility expression.

## 54–60 Minutes — Classes and Final Verification

Check one class from Day 25 for:

- directly mutable state that should be private;
- a `readonly` property whose nested array is still mutable;
- a constructor that accepts invalid empty data;
- a method that allows an impossible state transition;
- inheritance that composition would express more clearly.

Then run:

```bash
rg -n '\bany\b|@ts-ignore|@ts-expect-error|\w+!' src
npm run typecheck
npm run lint
npm run format:check
npm run build
npm start
```

Review every search result manually; a search can find comments or valid punctuation and can miss disguised unsafe assertions.

## Independent Project Requirements

1. Fix at least fifteen deliberate errors across the categories above.
2. Record at least eight distinct TypeScript diagnostic codes.
3. Include one runtime validation failure that static types alone cannot catch.
4. Preserve finite states with literal unions or discriminated unions.
5. Narrow all possibly missing array and `find` results.
6. Validate nested `unknown` input fully.
7. Use all four Day 27 utility types appropriately.
8. Preserve one useful generic relationship and remove one needless generic.
9. Protect one class invariant.
10. End with all Day 28 checks passing.

## Forbidden Shortcuts

- explicit or implicit `any`;
- `@ts-ignore` or `@ts-expect-error` left in final source;
- non-null assertions;
- assertions used instead of validation;
- disabling `strict` or its supporting options;
- making most properties optional;
- changing correct runtime behavior merely to satisfy a type.

## Common Mistakes and Debugging Advice

- Fix the earliest root diagnostic; later errors may be consequences.
- A wider type is not automatically a more accurate type.
- Separate untrusted input models from trusted domain models.
- A successful build does not prove runtime validation works.
- Run focused checks frequently instead of accumulating many edits.
- When inference is correct, extra annotations can add noise.
- Treat linter and formatter failures separately from type diagnostics.

## Review Questions

1. Which diagnostic was hardest to understand, and what did it mean?
2. When was narrowing the correct fix?
3. When was changing the model the correct fix?
4. Why is `unknown` safer than `any`?
5. Which assertion was tempting, and what evidence replaced it?
6. Which utility type was easiest to misuse?
7. What useful relationship did a generic preserve?
8. Which error represented a real runtime bug?

## Completion Checklist

- [ ] At least fifteen deliberate errors were honestly fixed.
- [ ] Eight diagnostic codes and explanations are recorded.
- [ ] Runtime validation rejects malformed nested input.
- [ ] No forbidden shortcut remains.
- [ ] Typecheck, lint, format check, build, and start all succeed.
- [ ] Runtime behavior and edge cases remain correct.
- [ ] Review answers and a Git commit are complete.

## What to Send for Review

Send the error journal, before/after snippets, final source, search output, all verification output, runtime failure tests, and review answers. Next: **Day 30 — What Node.js Is: Runtime, Browser Differences, Use Cases, and Version Management**.

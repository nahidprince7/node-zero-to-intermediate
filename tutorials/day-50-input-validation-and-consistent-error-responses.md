# Day 50 — Input Validation and Consistent Error Responses

> Core lesson: about 60–90 minutes. Convert untrusted HTTP input into trusted application data or one predictable failure shape.

## Learning Objectives

You will learn to:

- distinguish parsing, validation, normalization, and business rules;
- validate an unknown JSON body without `any`;
- collect useful field-level errors;
- create reusable Express validation middleware;
- keep error responses consistent across input channels;
- reject unknown or server-owned fields deliberately.

## 0–15 Minutes — The Validation Boundary

The pipeline is:

```text
bytes -> JSON parsing -> unknown value -> structural validation
      -> normalized input -> business rules -> domain operation
```

- Parsing asks whether bytes form valid JSON.
- Structural validation asks whether required fields and types match the endpoint contract.
- Normalization performs documented conversions such as trimming text.
- Business validation checks application state, such as unique slug or existing category.

Do not bury all four under “bad request.” Distinguishing them improves status codes, testing, and ownership.

## 15–35 Minutes — Validate and Collect Details

Create `src/posts/post.validation.ts`:

```ts
import type { CreatePostInput } from "./post.types.js";

export interface ValidationDetail {
  field: string;
  message: string;
}

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; details: ValidationDetail[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCreatePost(value: unknown): ValidationResult<CreatePostInput> {
  if (!isRecord(value)) {
    return {
      success: false,
      details: [{ field: "body", message: "Expected a JSON object" }],
    };
  }

  const details: ValidationDetail[] = [];
  const title = typeof value.title === "string" ? value.title.trim() : undefined;
  const body = typeof value.body === "string" ? value.body.trim() : undefined;

  if (!title || title.length < 3 || title.length > 120) {
    details.push({ field: "title", message: "Title must contain 3 to 120 characters" });
  }

  if (!body || body.length < 10 || body.length > 50_000) {
    details.push({ field: "body", message: "Body must contain 10 to 50000 characters" });
  }

  if (typeof value.published !== "boolean") {
    details.push({ field: "published", message: "Published must be a Boolean" });
  }

  const allowed = new Set(["title", "body", "published"]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      details.push({ field: key, message: "Unknown field" });
    }
  }

  if (details.length > 0 || !title || !body || typeof value.published !== "boolean") {
    return { success: false, details };
  }

  return {
    success: true,
    data: { title, body, published: value.published },
  };
}
```

The final checks make TypeScript's narrowing explicit after errors are collected. The validated object contains only allowed normalized fields, preventing mass assignment of values such as `authorId` or `createdAt`.

## 35–50 Minutes — Reusable Middleware

Use `res.locals` to pass validated data:

```ts
import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const validateCreatePostBody: RequestHandler = (
  request,
  response,
  next,
) => {
  const result = validateCreatePost(request.body as unknown);

  if (!result.success) {
    next(new AppError(
      422,
      "VALIDATION_ERROR",
      "Request validation failed",
      result.details,
    ));
    return;
  }

  response.locals.createPostInput = result.data;
  next();
};
```

Compose it after JSON parsing and media-type checks:

```ts
postsRouter.post(
  "/",
  requireJson,
  validateCreatePostBody,
  controller.create,
);
```

The controller consumes the validated value, not the raw body:

```ts
const input = response.locals.createPostInput as CreatePostInput;
const post = service.create(input);
response.location(`/posts/${post.id}`).status(201).json({ data: post });
```

For a larger project, type `res.locals` through Express declaration merging instead of repeating assertions. The assertion here is local to a middleware invariant that your tests must protect.

## 50–62 Minutes — Validate Every Input Channel

Bodies are not the only input:

- route parameters require conversion and bounds;
- query values require normalization, allowed values, and maximum limits;
- selected headers may require format checks;
- uploaded files require type, name, and size controls later;
- environment configuration was validated on Day 33.

Use the same detail shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "limit", "message": "Limit must be an integer from 1 to 100" },
      { "field": "sort", "message": "Sort must be title or createdAt" }
    ]
  }
}
```

Do not echo rejected secret values. A password error can name the field and rule without returning the password.

## 62–72 Minutes — Status and Rule Ownership

Use the course convention:

| Failure | Status | Example code |
|---|---:|---|
| Malformed JSON | 400 | `MALFORMED_JSON` |
| Invalid path/query syntax | 400 | `INVALID_QUERY` |
| Unsupported body media | 415 | `UNSUPPORTED_MEDIA_TYPE` |
| Valid JSON, invalid fields | 422 | `VALIDATION_ERROR` |
| State conflict | 409 | `SLUG_ALREADY_EXISTS` |
| Missing related resource | 404 | `CATEGORY_NOT_FOUND` |

A unique-slug check needs application/database state, so it belongs in the service or persistence boundary rather than the structural body validator. Validation cannot eliminate database constraints; concurrent requests can pass a pre-check simultaneously.

## 72–82 Minutes — Create Versus Update

Do not reuse create validation unchanged for PATCH:

- create requires all mandatory fields;
- update permits a documented subset;
- update rejects an empty object;
- missing means unchanged;
- explicit null is accepted only where removal is allowed;
- every supplied value still receives full validation.

For example, a PATCH title is optional but, when present, must still contain 3–120 characters.

## Guided Practice — Validate the Posts API

Implement:

1. a discriminated validation result;
2. strict object-only create-body validation;
3. trimmed title/body values with length bounds;
4. Boolean validation without coercion;
5. unknown-field rejection;
6. validation middleware storing normalized input;
7. a consistent error handler producing field details;
8. separate route/query validation for ID, limit, and sort.

Test every rule independently and at least one request containing several invalid fields.

## Independent Exercises

1. Reject `null`, arrays, strings, and numbers as post bodies.
2. Test boundary lengths immediately below, at, and above limits.
3. Confirm whitespace is normalized before length validation.
4. Reject `published: "false"` rather than coercing it.
5. Reject `authorId` and `createdAt` as unknown fields.
6. Write separate PATCH validation and reject `{}`.
7. Validate `limit` from 1 through 100 without accepting decimals.
8. Map a simulated duplicate slug to 409 outside the structural validator.

## Common Mistakes and Debugging Advice

- Parsed JSON is still untrusted.
- Do not use `any` at the request boundary.
- Validate before destructuring into trusted types.
- Normalize only when the contract promises normalization.
- Boolean coercion accepts surprising values; validate exact types.
- Reject or explicitly strip unknown fields—choose and document one.
- Keep state-dependent rules out of structural validation.
- Create and PATCH inputs have different requiredness semantics.
- Never include secret rejected values in errors or logs.

## Review Questions

1. How do parsing and validation differ?
2. What does normalization do?
3. Why begin with `unknown`?
4. Why create a new validated object rather than return the raw body?
5. What does unknown-field rejection prevent?
6. Why does unique-slug enforcement need a database constraint later?
7. How should create and PATCH validation differ?
8. When would 400, 415, 422, and 409 apply?

## Completion Checklist

- [ ] Validation begins from `unknown`.
- [ ] Object shape, types, and bounds are checked.
- [ ] Normalized data contains only permitted fields.
- [ ] Multiple field errors can be returned together.
- [ ] Middleware passes validated input explicitly.
- [ ] Route and query inputs are also validated.
- [ ] PATCH semantics are separate from create.
- [ ] All exercises and review questions are complete.

## Official References

- Express JSON parser: https://expressjs.com/en/5x/api.html#express.json
- Express middleware guide: https://expressjs.com/en/guide/using-middleware.html
- OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

## What to Send for Review

Send validation code, middleware composition, normalized success output, complete failure matrix, PATCH validator, duplicate-slug mapping, exercises, and review answers. Next: **Day 51 — Testing APIs with `curl`, API Clients, and `.http` Files**.

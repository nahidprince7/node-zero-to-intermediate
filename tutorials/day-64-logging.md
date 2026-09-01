# Day 64 — Logging in NestJS

> Core lesson: about 60–90 minutes. Produce useful, correlated logs without exposing secrets or confusing expected client errors with incidents.

## Learning Objectives

You will learn to:

- use Nest's system and application logger;
- choose appropriate log levels;
- add request IDs and completion logs;
- prefer structured fields over interpolated blobs;
- redact sensitive data;
- configure development versus production output.

## 0–15 Minutes — System and Application Logs

Nest logs framework bootstrap and caught unexpected exceptions. Application code can use `Logger` with a context:

```ts
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  publish(postId: number, actorId: number): void {
    this.logger.log({ event: "post_published", postId, actorId });
  }
}
```

Log domain-relevant facts, not every line of control flow. A log should help answer what happened, where, when, and which request or resource was involved.

## 15–28 Minutes — Levels

Nest supports `fatal`, `error`, `warn`, `log`, `debug`, and `verbose`.

| Level | Use |
|---|---|
| `fatal` | Process cannot continue safely |
| `error` | Unexpected operation failure requiring attention |
| `warn` | Abnormal/recoverable condition worth review |
| `log` | Important normal lifecycle or domain event |
| `debug` | Diagnostic detail useful during investigation |
| `verbose` | Very detailed trace, normally disabled |

A validation 422 or missing post 404 is usually expected client behavior, not an application error. Avoid flooding incident logs with ordinary outcomes.

Configure enabled levels at bootstrap:

```ts
const app = await NestFactory.create(AppModule, {
  logger: ["fatal", "error", "warn", "log", "debug"],
});
```

Choose levels from validated environment configuration rather than hardcoding production verbosity.

## 28–48 Minutes — Request IDs and Completion Logs

For the default Express adapter, add a small middleware in `main.ts`:

```ts
import { Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

interface RequestWithId extends Request {
  requestId: string;
}

const httpLogger = new Logger("HTTP");

app.use((request: Request, response: Response, next: NextFunction) => {
  const requestWithId = request as RequestWithId;
  requestWithId.requestId = randomUUID();
  response.setHeader("X-Request-Id", requestWithId.requestId);

  const startedAt = performance.now();

  response.once("finish", () => {
    httpLogger.log({
      event: "request_completed",
      requestId: requestWithId.requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Number((performance.now() - startedAt).toFixed(1)),
    });
  });

  next();
});
```

Generate IDs server-side instead of blindly trusting an incoming identifier. Completion logging records the final status and duration. A production implementation should also account for aborted/closed responses without double logging.

## 48–60 Minutes — Safe Structured Fields

Useful fields include:

```text
event, requestId, method, route/path, statusCode, durationMs,
userId, resourceId, operation, errorType
```

Do not log by default:

```text
Authorization, Cookie, passwords, access/refresh tokens,
full request/response bodies, DATABASE_URL, payment or private profile data
```

Prefer stable event names and separate fields. Searching `event=post_published postId=42` is easier than parsing many sentence formats.

Logs may become sensitive production data themselves. Apply access control, retention, and deletion policies.

## 60–72 Minutes — JSON Output

Nest's built-in console logger supports JSON output:

```ts
import { ConsoleLogger } from "@nestjs/common";

const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({
    json: process.env.NODE_ENV === "production",
    colors: process.env.NODE_ENV !== "production",
  }),
});
```

In the real app, use validated configuration instead of raw `process.env`. JSON logs are easier for collectors to parse, but merely serializing text as JSON is not enough—keep the event fields structured and consistent.

External logging systems and correlation across async work arrive in production-quality lessons. Today establish safe habits and one request ID.

## 72–80 Minutes — Error Ownership

Log unexpected failures at the exception boundary once. Do not log the same stack in service, controller, interceptor, and filter. Lower layers may add a cause or context, then let the owned boundary decide severity and output.

Expected domain conflicts may deserve an audit/domain event, but that differs from an error incident. Authentication and moderation audit design comes later.

## Guided Practice — Observable Posts API

Add:

1. generated request ID and response header;
2. one completion event per request;
3. method, path, status, and duration fields;
4. context-specific service logger;
5. a publication domain event;
6. unexpected exception logging in the global filter;
7. development level selection;
8. a log audit proving secrets are absent.

## Independent Exercises

1. Trigger 200, 404, 422, and 500 and compare logs.
2. Verify every response has a request ID.
3. Simulate an aborted request and design one close log.
4. Replace an interpolated sentence with structured fields.
5. Disable debug output and verify behavior.
6. Enable JSON output and parse one line.
7. Redact a sample sensitive object.
8. Find and remove duplicate error logging.

## Common Mistakes and Debugging Advice

- Do not use `console.log` as an unstructured default.
- Expected 4xx responses are not automatically incidents.
- Generate or strictly validate correlation identifiers.
- Log completion rather than only request arrival.
- Never dump headers, bodies, environment, or user records blindly.
- Give loggers meaningful contexts and events stable names.
- Log an unexpected stack once at its owned boundary.
- Treat stored logs as sensitive data.

## Review Questions

1. What is a logger context?
2. How do warn and error differ?
3. Why log response completion?
4. What does a request ID connect?
5. Which fields are unsafe by default?
6. Why prefer structured events?
7. What does JSON logging improve?
8. Why avoid duplicate stack logs?

## Completion Checklist

- [ ] Application logs use Nest `Logger`.
- [ ] Levels match event severity.
- [ ] Requests receive generated IDs.
- [ ] Completion events contain useful fields.
- [ ] Unexpected errors are logged once.
- [ ] Logs contain no known secrets.
- [ ] All exercises and review questions are complete.

## Official References

- Nest logger: https://docs.nestjs.com/techniques/logger
- Nest middleware: https://docs.nestjs.com/middleware
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

## What to Send for Review

Send logger configuration, request middleware, representative logs, redaction audit, aborted-request design, exercises, and review answers. Next: **Day 65 — Swagger and OpenAPI**.

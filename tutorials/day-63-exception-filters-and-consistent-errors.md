# Day 63 — Exception Filters and Consistent Errors

> Core lesson: about 60–90 minutes. Translate known and unexpected failures into one stable public contract.

## Learning Objectives

You will learn to:

- use Nest's built-in HTTP exceptions;
- create a structured application exception;
- format validation failures consistently;
- implement a catch-all exception filter;
- register a filter through dependency injection;
- hide unexpected internal details while retaining useful logs.

## 0–15 Minutes — Built-In Exceptions

Nest provides exceptions such as:

```ts
throw new BadRequestException("Invalid post ID");
throw new NotFoundException("Post not found");
throw new ConflictException("Slug already exists");
throw new ForbiddenException("You cannot edit this post");
```

They extend `HttpException` and are handled by Nest's built-in exception layer. Unknown thrown values produce a generic 500 response.

Built-in exceptions are useful defaults, but their response shape differs from the course contract. A custom filter should add consistency without turning every programmer bug into a client error.

## 15–30 Minutes — Define an API Exception

Create `src/common/errors/api.exception.ts`:

```ts
import { HttpException } from "@nestjs/common";

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export class ApiException extends HttpException {
  constructor(
    status: number,
    readonly code: string,
    message: string,
    readonly details: ApiErrorDetail[] = [],
  ) {
    super({ code, message, details }, status);
  }
}
```

Throw it for expected public outcomes:

```ts
throw new ApiException(404, "POST_NOT_FOUND", "Post not found");
```

Do not attach SQL messages, stack traces, database URLs, or secrets to public exception details. An internal `cause` can be logged separately at the owned boundary.

## 30–45 Minutes — Format Validation Failures

Flatten `class-validator` results:

```ts
import type { ValidationError } from "class-validator";

function flattenValidationErrors(
  errors: ValidationError[],
  parent = "",
): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => ({
      field,
      message,
    }));

    return [
      ...own,
      ...flattenValidationErrors(error.children ?? [], field),
    ];
  });
}
```

Customize the global pipe:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new ApiException(
        422,
        "VALIDATION_ERROR",
        "Request validation failed",
        flattenValidationErrors(errors),
      ),
  }),
);
```

Keep malformed JSON at 400 and DTO field failure at 422 according to the course convention.

## 45–65 Minutes — Catch-All Filter

Create `src/common/filters/api-exception.filter.ts`:

```ts
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ApiException } from "../errors/api.exception.js";

interface RequestLike {
  method: string;
  url: string;
  requestId?: string;
}

const publicHttpErrors: Record<number, { code: string; message: string }> = {
  400: { code: "INVALID_REQUEST", message: "Request is invalid" },
  401: { code: "UNAUTHENTICATED", message: "Authentication is required" },
  403: { code: "FORBIDDEN", message: "Operation is not allowed" },
  404: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  409: { code: "CONFLICT", message: "Request conflicts with current state" },
  413: { code: "BODY_TOO_LARGE", message: "Request body is too large" },
  415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Media type is not supported" },
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestLike>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const knownHttpError = publicHttpErrors[status];
    const payload = exception instanceof ApiException
      ? exception.getResponse()
      : exception instanceof HttpException
        ? {
            code: knownHttpError?.code ?? "HTTP_ERROR",
            message: knownHttpError?.message ?? "Request failed",
            details: [],
          }
        : {
            code: "INTERNAL_ERROR",
            message: "Internal server error",
            details: [],
          };

    if (!(exception instanceof HttpException)) {
      this.logger.error({
        event: "unexpected_request_error",
        requestId: request.requestId,
        method: request.method,
        path: request.url,
        error: exception instanceof Error ? exception.stack : String(exception),
      });
    }

    this.adapterHost.httpAdapter.reply(
      context.getResponse(),
      {
        error: {
          ...(typeof payload === "object" ? payload : { message: payload }),
          requestId: request.requestId,
        },
      },
      status,
    );
  }
}
```

This first filter maps course-owned `ApiException` values plus common built-in HTTP statuses. Extend the mapping deliberately when the application adopts another public outcome.

Using the HTTP adapter keeps reply logic compatible with the configured Nest platform instead of importing an Express response.

## 65–75 Minutes — Register with DI

Register globally in a common/core module or `AppModule`:

```ts
import { APP_FILTER } from "@nestjs/core";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
```

This lets Nest inject `HttpAdapterHost`. Method- or controller-scoped filters can use `@UseFilters`, but one global error contract should not depend on every controller remembering a decorator.

## Guided Practice — Error Contract

Implement and test:

1. DTO validation → 422 details;
2. malformed JSON → mapped 400;
3. invalid pipe input → mapped 400;
4. missing post → `POST_NOT_FOUND` 404;
5. unknown route → `ROUTE_NOT_FOUND` 404;
6. duplicate slug → 409;
7. unexpected `Error` → generic 500 plus internal log;
8. no stack or secret in public responses.

## Independent Exercises

1. Map every built-in exception currently used by the app.
2. Flatten nested DTO field paths.
3. Add an internal cause without serializing it.
4. Throw a string and verify generic handling.
5. Compare filter registration with `useGlobalFilters(new ...)`.
6. Include request IDs after Day 64 middleware runs.
7. Ensure expected 4xx errors are not logged as incidents.
8. Test that one exception generates one response.

## Common Mistakes and Debugging Advice

- Filters handle uncaught exceptions, not ordinary returned errors.
- Do not expose unknown `error.message` values.
- Preserve distinct 400, 404, 409, 413, 415, and 422 outcomes.
- Register a DI-dependent global filter with `APP_FILTER`.
- Keep validation detail paths useful and stable.
- Map supported built-in exceptions explicitly.
- Log unexpected failures once.
- Keep platform response access behind `HttpAdapterHost`.

## Review Questions

1. What does Nest do with an unknown exception by default?
2. Why define `ApiException`?
3. What does `exceptionFactory` customize?
4. Why flatten nested validation errors?
5. Why hide unexpected messages?
6. What does `HttpAdapterHost` avoid?
7. Why use `APP_FILTER`?
8. Which errors should be logged at error level?

## Completion Checklist

- [ ] Expected failures use stable codes.
- [ ] Validation produces field details.
- [ ] Catch-all filter hides unexpected internals.
- [ ] Platform adapter sends responses.
- [ ] Global registration supports DI.
- [ ] Complete error matrix is tested.
- [ ] All exercises and review questions are complete.

## Official References

- Nest exception filters: https://docs.nestjs.com/exception-filters
- Nest validation: https://docs.nestjs.com/techniques/validation
- Nest HTTP adapter: https://docs.nestjs.com/faq/http-adapter

## What to Send for Review

Send exception/filter code, validation factory, complete error responses, unexpected-error log, leak audit, exercises, and review answers. Next: **Day 64 — Logging**.

# Day 58 — The NestJS Request Lifecycle End to End

> Core lesson: about 60–90 minutes. Place each cross-cutting concern in the correct stage instead of treating decorators as an unordered collection.

## Learning Objectives

You will learn to:

- trace a request through Nest's major lifecycle stages;
- distinguish middleware, guards, interceptors, pipes, and filters;
- explain global, controller, and route binding levels;
- understand the interceptor return path;
- choose the appropriate stage for common concerns;
- debug ordering with a controlled trace.

## 0–15 Minutes — The Lifecycle Map

The general HTTP flow is:

```text
incoming request
  -> middleware
  -> guards
  -> interceptors (before)
  -> pipes
  -> controller handler -> provider calls
  -> interceptors (after, reverse order)
  -> response

uncaught exception -> exception filters
```

More precisely, global bindings generally run before controller bindings, which run before route bindings. Middleware has application/module binding rules. Parameter-level pipe ordering has additional details; use the official lifecycle reference when order is critical.

The service is not an automatic lifecycle hook. It runs because the controller or another provider calls it.

## 15–30 Minutes — Stage Responsibilities

| Stage | Good fit | Poor fit |
|---|---|---|
| Middleware | request ID, low-level logging, adapter-style preprocessing | route metadata authorization |
| Guard | authentication and authorization decisions | transforming request fields |
| Interceptor | timing, response mapping, caching, before/after wrapping | field validation |
| Pipe | validation and transformation of handler arguments | user permission decisions |
| Controller | transport coordination | database infrastructure |
| Provider | use cases and business rules | raw response handling |
| Exception filter | translating uncaught exceptions | ordinary successful response logic |

Several stages can technically perform similar code. Choose by intent so future readers can predict where behavior lives.

## 30–45 Minutes — Binding Levels and Order

Components can be bound globally, at a controller, or at a route:

```ts
app.useGlobalPipes(globalPipe);
```

```ts
@UseGuards(ControllerGuard)
@Controller("posts")
export class PostsController {
  @UseGuards(RouteGuard)
  @Get()
  findAll() {}
}
```

Guards run global → controller → route in binding order. Pipes generally follow the same binding-level direction. Interceptors run global → controller → route before the handler, then unwind route → controller → global after it because they wrap the execution stream.

Exception filters run only for uncaught exceptions. Once an exception is handled by a matching filter, processing does not continue through other filters as if they were middleware.

## 45–58 Minutes — Build a Trace

Start with middleware using the underlying adapter pipeline:

```ts
import type { NextFunction, Request, Response } from "express";

app.use((request: Request, _response: Response, next: NextFunction) => {
  console.log("1 middleware");
  next();
});
```

Create a simple interceptor:

```ts
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import { tap, type Observable } from "rxjs";

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log("2 interceptor before");

    return next.handle().pipe(
      tap(() => console.log("5 interceptor after")),
    );
  }
}
```

Bind it temporarily with `@UseInterceptors(TraceInterceptor)` and log in a pipe, controller, and service. Predict the order before calling the route.

Do not turn production code into numbered logs. This is a disposable learning trace.

## 58–70 Minutes — Failure Paths

Consider failures at different stages:

- middleware can end the response before Nest routing continues;
- a guard returning false prevents the handler;
- a pipe throwing prevents the controller method;
- a service exception bubbles through the controller call;
- an interceptor can observe/map errors in its execution stream;
- an uncaught exception reaches a matching exception filter.

Errors do not continue through every later normal stage. Debug by identifying the last stage entered and the first stage that could have transformed or stopped the request.

Avoid catching an exception merely to throw the same value. Catch only when adding context, recovering, translating at an owned boundary, or cleaning up.

## Guided Practice — Trace Three Requests

Create temporary trace components and run:

1. a successful request;
2. a request rejected by a guard;
3. a request rejected by a pipe;
4. a request whose service throws;
5. an exception filter that records the final error path.

For each, draw which stages executed and which did not. Include interceptor before/after behavior and remove noisy trace code when finished.

## Independent Exercises

1. Put the same trace at global, controller, and route levels.
2. Bind two guards and predict their order.
3. Bind two interceptors and observe reverse unwinding.
4. Throw from a pipe and confirm the handler does not run.
5. Throw from a service and observe the filter.
6. Catch an exception inside the controller and explain why a filter no longer sees it.
7. Assign five cross-cutting concerns to stages.
8. Compare Nest middleware with Day 44 Express middleware.

## Common Mistakes and Debugging Advice

- The lifecycle has an inbound and interceptor outbound path.
- A service runs because application code calls it.
- Guards decide access; pipes validate/transform arguments.
- Filters handle uncaught exceptions, not all responses.
- Binding scope affects ordering.
- Middleware can terminate before later Nest stages.
- Avoid duplicate handling across several stages.
- Remove disposable trace logging after learning.

## Review Questions

1. What is the general inbound order?
2. Why do interceptors unwind in reverse order?
3. How do guards and pipes differ?
4. What triggers an exception filter?
5. Is a service an automatic framework stage?
6. How do global, controller, and route bindings relate?
7. What happens after a guard denies access?
8. How can a trace locate a lifecycle bug?

## Completion Checklist

- [ ] Major request stages are ordered correctly.
- [ ] Each stage has a clear responsibility.
- [ ] Binding levels are understood.
- [ ] Interceptor reverse unwinding is demonstrated.
- [ ] Success and failure traces are documented.
- [ ] Disposable tracing is removed afterward.
- [ ] All exercises and review questions are complete.

## Official References

- Nest request lifecycle: https://docs.nestjs.com/faq/request-lifecycle
- Nest execution context: https://docs.nestjs.com/fundamentals/execution-context
- Nest interceptors: https://docs.nestjs.com/interceptors

## What to Send for Review

Send lifecycle diagrams, trace components, observed logs for each path, concern-placement exercise, cleaned source, and review answers. Next: **Day 59 — Configuration and Blog Module Planning**.

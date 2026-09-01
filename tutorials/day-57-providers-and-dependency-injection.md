# Day 57 — Providers and Dependency Injection

> Core lesson: about 60–90 minutes. Let Nest compose object relationships instead of constructing dependencies inside consumers.

## Learning Objectives

You will learn to:

- define and register an injectable provider;
- use constructor injection;
- explain dependency inversion and inversion of control;
- use class and custom provider tokens;
- substitute a provider without changing its consumer;
- understand default provider lifetime and module visibility.

## 0–15 Minutes — From Manual Wiring to a Container

In Day 46 you wired dependencies manually:

```ts
const service = new PostService();
const controller = createPostController(service);
```

Nest's container performs this composition from module metadata and constructor types. The controller declares what it needs; it does not decide how to build it.

This is inversion of control: object construction and wiring move to the framework container. Dependency injection is the mechanism used to supply those collaborators.

## 15–32 Minutes — Create and Inject a Service

`src/posts/posts.service.ts`:

```ts
import { Injectable } from "@nestjs/common";

export interface Post {
  id: number;
  title: string;
  published: boolean;
}

@Injectable()
export class PostsService {
  private readonly posts: Post[] = [
    { id: 1, title: "Dependency Injection", published: false },
  ];

  findAll(): Post[] {
    return this.posts.map((post) => ({ ...post }));
  }

  findById(id: number): Post | undefined {
    const post = this.posts.find((candidate) => candidate.id === id);
    return post ? { ...post } : undefined;
  }
}
```

Register it:

```ts
@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

Inject it:

```ts
@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return { data: this.postsService.findAll() };
  }
}
```

The shorthand provider registration is equivalent to `{ provide: PostsService, useClass: PostsService }`. The class acts as both construction target and injection token.

## 32–45 Minutes — Why Injection Helps

Avoid this inside a controller:

```ts
private readonly postsService = new PostsService();
```

Manual construction:

- hides the dependency from the module graph;
- couples the controller to one implementation;
- bypasses Nest lifecycle and scope management;
- makes substitution in tests harder;
- can create accidental duplicate state or connections.

Constructor injection makes requirements visible and allows the container to reject an incomplete graph at startup.

## 45–60 Minutes — Custom Tokens

TypeScript interfaces disappear at runtime, so they cannot be injection tokens by themselves. Use a symbol or string token:

```ts
export interface Clock {
  now(): Date;
}

export const CLOCK = Symbol("CLOCK");

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
```

Register and inject:

```ts
@Module({
  providers: [
    PostsService,
    { provide: CLOCK, useClass: SystemClock },
  ],
})
export class PostsModule {}
```

```ts
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class PostsService {
  constructor(@Inject(CLOCK) private readonly clock: Clock) {}
}
```

Custom provider forms also include `useValue`, `useFactory`, and `useExisting`. They support configuration, adapters, and test substitutes without changing consumers.

## 60–70 Minutes — Lifetimes and Visibility

Providers are singleton-scoped by default within the application/provider graph: Nest normally creates and reuses an instance rather than one per request. This is efficient, but mutable request-specific state must not be stored on singleton provider fields.

Request and transient scopes exist, but they add lifecycle and performance complexity. Use the default unless the problem genuinely requires another lifetime.

Injection also obeys module boundaries. A provider is visible inside its module and to modules that import the host module after the provider is exported.

## Guided Practice — Injectable Posts Feature

Build:

1. `PostsService` with list, find, and create operations;
2. controller constructor injection;
3. provider registration in `PostsModule`;
4. a `Clock` abstraction with a symbol token;
5. creation timestamps supplied by the clock;
6. a fixed fake clock registered through `useValue`;
7. no manual service construction;
8. no request-specific data on singleton fields.

Switch between system and fake clocks by changing module composition only.

## Independent Exercises

1. Remove `PostsService` registration and inspect the startup error.
2. Inject the service into two consumers and observe shared state.
3. Replace the clock with `useValue`.
4. Create a provider with `useFactory`.
5. Alias a provider with `useExisting`.
6. Attempt to inject a TypeScript interface directly and explain why it fails.
7. Move a provider across a module boundary and fix visibility with export/import.
8. Identify unsafe mutable state on a singleton provider.

## Common Mistakes and Debugging Advice

- `@Injectable` does not register a provider by itself; module metadata does.
- Constructor dependencies must be resolvable in the module context.
- Do not manually instantiate injected services.
- Interfaces need runtime tokens.
- Prefer symbols or well-managed constants over scattered string tokens.
- Export a provider before another module can inject it.
- Default singleton providers must not hold current-request state.
- Change scopes only for a demonstrated requirement.

## Review Questions

1. What is inversion of control?
2. What does constructor injection make visible?
3. Why is a class a convenient provider token?
4. Why can an interface not be a runtime token?
5. How do `useClass` and `useValue` differ?
6. What is the default provider lifetime?
7. Why is request state dangerous on a singleton?
8. How do module exports affect injection?

## Completion Checklist

- [ ] Posts service is injectable and registered.
- [ ] Controller uses constructor injection.
- [ ] Missing dependency failure is understood.
- [ ] A symbol-token clock is substituted successfully.
- [ ] Module visibility is respected.
- [ ] Singleton state rules are understood.
- [ ] All exercises and review questions are complete.

## Official References

- Nest providers: https://docs.nestjs.com/providers
- Nest custom providers: https://docs.nestjs.com/fundamentals/custom-providers
- Nest injection scopes: https://docs.nestjs.com/fundamentals/injection-scopes

## What to Send for Review

Send service/controller/module code, system and fake clock output, dependency failure, provider-form exercises, and review answers. Next: **Day 58 — The Request Lifecycle End to End**.

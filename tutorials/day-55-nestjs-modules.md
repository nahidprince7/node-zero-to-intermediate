# Day 55 — NestJS Modules

> Core lesson: about 60–90 minutes. Organize related capabilities and make dependency boundaries explicit.

## Learning Objectives

You will learn to:

- explain the root and feature module roles;
- use `@Module` metadata correctly;
- register controllers and providers;
- import modules and export selected providers;
- treat module exports as a public interface;
- avoid unnecessary global modules and circular dependencies.

## 0–15 Minutes — The Application Graph

Every Nest application has a root module. Nest begins there and builds a graph from module imports, controllers, and provider dependencies.

```ts
import { Module } from "@nestjs/common";

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
```

The metadata means:

| Property | Purpose |
|---|---|
| `imports` | Modules whose exported capabilities this module needs |
| `controllers` | HTTP controllers owned by this module |
| `providers` | Injectable services/factories/values available in this module |
| `exports` | Selected providers or imported modules made available to importers |

Classes are not registered merely because files exist. The module graph tells Nest what to create and where dependencies are visible.

## 15–30 Minutes — Create a Feature Module

From `practice/day-54`:

```bash
npx nest generate module posts
```

The generated `src/posts/posts.module.ts`:

```ts
import { Module } from "@nestjs/common";

@Module({})
export class PostsModule {}
```

The CLI normally adds `PostsModule` to the root imports:

```ts
import { Module } from "@nestjs/common";
import { PostsModule } from "./posts/posts.module.js";

@Module({
  imports: [PostsModule],
})
export class AppModule {}
```

A feature module groups one cohesive capability. For the blog, likely modules include posts, users, comments, categories, tags, auth, configuration, and database integration. Do not create a module for every class.

## 30–45 Minutes — Own Controllers and Providers

Generate the related components:

```bash
npx nest generate controller posts --no-spec
npx nest generate service posts --no-spec
```

Review `posts.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller.js";
import { PostsService } from "./posts.service.js";

@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

The module owns the controller and provider. `PostsController` can inject `PostsService` because both participate in the same module context.

Common registration mistakes produce startup errors: placing a provider in `imports`, a module in `providers`, or forgetting to register a constructor dependency.

## 45–58 Minutes — Import and Export

Suppose another feature needs a post lookup. Export only the service:

```ts
@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

Then import the module:

```ts
@Module({
  imports: [PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
```

`CommentsModule` can now inject the exported `PostsService`. Importing the class file directly is not equivalent to making the provider visible through the Nest module graph.

Exports form the module's public interface. Keep internal helpers private unless another module has a real use case.

## 58–68 Minutes — Shared and Global Choices

Modules are shared by default: importing the same module allows consumers to use the provider instances managed in that module context. Do not instantiate service classes manually.

`@Global()` can make a module's exports available without repeated imports, but global availability hides dependency relationships. Prefer explicit imports for feature capabilities. Reserve global configuration or infrastructure only when the project has a clear reason.

Circular imports—Posts imports Comments while Comments imports Posts—often signal tangled ownership. First redesign the dependency direction or extract a smaller shared capability. `forwardRef` exists for unavoidable cycles, but it is not the first design tool.

## Guided Practice — Blog Module Skeleton

Create empty feature modules for:

1. posts;
2. users;
3. comments;
4. categories;
5. tags;
6. auth.

Import them into `AppModule`. Add controller/service pairs only to posts for now. Export `PostsService`, import `PostsModule` into `CommentsModule`, and verify the application starts. Then remove the export temporarily and read the dependency-resolution error.

## Independent Exercises

1. Explain every `@Module` property in your own words.
2. Generate a module with a CLI dry run first.
3. Forget a controller registration and observe the missing route.
4. Forget a provider registration and inspect startup failure.
5. Export one provider and consume it from another module.
6. Keep an internal helper provider unexported.
7. Draw the initial blog module graph.
8. Identify one likely circular-dependency risk and redesign it.

## Common Mistakes and Debugging Advice

- Files do not join the Nest graph automatically.
- Put modules in `imports`, controllers in `controllers`, and providers in `providers`.
- A provider must be local or exported by an imported module.
- Export only a feature's intended public capabilities.
- Do not instantiate injectable services with `new` in consumers.
- Avoid making everything global.
- Treat circular dependencies as a design signal.
- Review CLI changes to module metadata.

## Review Questions

1. Why does every Nest app need a root module?
2. What does the module graph describe?
3. What is a feature module?
4. When can a controller inject a provider?
5. Why must an external provider be exported?
6. How do imports differ from TypeScript imports?
7. Why avoid excessive global modules?
8. What can a circular module dependency reveal?

## Completion Checklist

- [ ] Root and feature modules are understood.
- [ ] Posts controller and service are registered correctly.
- [ ] Blog feature skeleton is imported by `AppModule`.
- [ ] Provider export/import behavior is demonstrated.
- [ ] Module public interfaces remain narrow.
- [ ] Initial dependency graph is documented.
- [ ] All exercises and review questions are complete.

## Official References

- Nest modules: https://docs.nestjs.com/modules
- Nest CLI generate: https://docs.nestjs.com/cli/usages#nest-generate
- Nest circular dependencies: https://docs.nestjs.com/fundamentals/circular-dependency

## What to Send for Review

Send module files, generated tree, module graph, successful and deliberate-failure output, export decision, exercises, and review answers. Next: **Day 56 — Controllers and HTTP Method Decorators**.

# Day 26 — Decorators and How NestJS Uses Them

> Core lesson: about 60 minutes. This lesson explains the legacy TypeScript decorator model used by NestJS; it does not start a Nest application yet.

## Learning Objectives

You will learn to:

- explain a decorator as a function applied to a declaration;
- distinguish a decorator from a decorator factory;
- attach and inspect simple class and method metadata;
- understand evaluation timing and stacked decorators;
- recognize NestJS class, method, and parameter decorators;
- explain why Nest enables decorator metadata.

## Setup and an Important Distinction

Create `practice/day-26/src` with the strict Day 19 setup. Add these compiler options:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Merge them into the existing `compilerOptions`; do not replace the other settings.

Modern TypeScript also supports the newer standard decorator proposal with different signatures and behavior. NestJS's current starter configuration enables `experimentalDecorators` and `emitDecoratorMetadata`, so today's examples deliberately use that legacy model. Do not mix examples from the two models.

## 0–15 Minutes — A Class Decorator

A decorator is called when the class declaration is evaluated, not every time an instance is created.

Create `src/decorators.ts`:

```ts
const labels = new WeakMap<Function, string>();

function Label(name: string): ClassDecorator {
  return (target) => {
    labels.set(target, name);
  };
}

@Label("posts-service")
class PostsService {
  findAll(): string[] {
    return ["First post", "Second post"];
  }
}

console.log(labels.get(PostsService));
console.log(new PostsService().findAll());
```

`@Label("posts-service")` calls the factory first. The returned decorator then receives the class constructor and records metadata outside the class.

## 15–30 Minutes — Method Metadata

```ts
interface RouteDefinition {
  method: "GET" | "POST";
  path: string;
}

const routes = new WeakMap<object, Map<string | symbol, RouteDefinition>>();

function Route(
  method: RouteDefinition["method"],
  path: string,
): MethodDecorator {
  return (target, propertyKey) => {
    const controllerRoutes = routes.get(target) ?? new Map();
    controllerRoutes.set(propertyKey, { method, path });
    routes.set(target, controllerRoutes);
  };
}

class PostsController {
  @Route("GET", "/posts")
  findAll(): string {
    return "All posts";
  }

  @Route("POST", "/posts")
  create(): string {
    return "Created";
  }
}

console.log(routes.get(PostsController.prototype));
```

This only stores descriptions. It does not create an HTTP server. A framework later reads similar metadata and connects it to routing behavior.

## 30–40 Minutes — Evaluation and Composition

For multiple decorators on one declaration, factory expressions are evaluated top-to-bottom; the returned decorator functions are applied bottom-to-top.

```ts
function Trace(name: string): ClassDecorator {
  console.log(`evaluate ${name}`);

  return () => {
    console.log(`apply ${name}`);
  };
}

@Trace("outer")
@Trace("inner")
class Example {}
```

Predict the four lines before running the file. Keep decorators small: hidden mutation and complicated ordering make code hard to debug.

## 40–52 Minutes — How NestJS Reads

You will later see code shaped like this:

```ts
import { Controller, Get, Injectable, Param } from "@nestjs/common";

@Injectable()
class PostsService {
  findOne(id: string): string {
    return `Post ${id}`;
  }
}

@Controller("posts")
class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(":id")
  findOne(@Param("id") id: string): string {
    return this.postsService.findOne(id);
  }
}
```

Do not add this snippet to today's runnable project unless Nest dependencies are installed. Read it as a preview:

- `@Injectable()` marks a provider class for Nest's dependency-injection system;
- `@Controller("posts")` gives a class a route prefix;
- `@Get(":id")` associates a method with an HTTP route;
- `@Param("id")` describes how a parameter receives request data;
- emitted design metadata helps Nest inspect constructor dependency types at runtime.

Decorators attach descriptions. Nest's bootstrap, router, and dependency-injection container interpret those descriptions.

## 52–60 Minutes — What Decorators Do Not Do

Decorators do not automatically:

- validate request data;
- make an ordinary class injectable without a container;
- turn TypeScript interfaces into runtime values;
- replace the method body;
- guarantee correct metadata.

`emitDecoratorMetadata` emits limited design-type metadata and is commonly paired with `reflect-metadata`; it does not preserve every TypeScript type. Unions, interfaces, and generics cannot all be reconstructed perfectly at runtime.

## Guided Practice

1. Create a class decorator factory that records a controller prefix.
2. Create `Get` and `Post` method decorator factories that record routes.
3. Decorate a small controller with three methods.
4. Print the collected metadata.
5. Add two trace decorators and predict evaluation/application order.
6. Explain which part a framework would need to implement next.

## Independent Exercises

1. Write a simple decorator and a configurable decorator factory.
2. Record a role requirement on a class without mutating its instances.
3. Record route metadata for a symbol or string method key.
4. Compare class, method, and parameter decorator targets.
5. Inspect the emitted JavaScript from `tsc`.
6. Explain why a TypeScript interface cannot be a runtime injection token.
7. Annotate the NestJS preview line by line in your notes.

## Common Mistakes and Debugging Advice

- Match examples to the configured decorator model.
- A decorator runs around declaration evaluation, not per request.
- A decorator factory returns the actual decorator.
- Avoid `any` in custom decorator code where built-in decorator types suffice.
- Metadata has no effect until other code reads it.
- Do not expect emitted metadata to represent complex TypeScript types exactly.
- NestJS concepts are previewed here; framework setup starts on Day 54.

## Review Questions

1. What is a decorator?
2. What is a decorator factory?
3. When is a class decorator applied?
4. In what order are stacked factories evaluated and applied?
5. What does each decorator in the Nest preview describe?
6. Who turns route metadata into working HTTP behavior?
7. Why does Nest enable decorator metadata?
8. Why can an interface not be inspected at runtime?

## Completion Checklist

- [ ] The correct compiler options are enabled.
- [ ] Class and method metadata examples run.
- [ ] Decorator factory and application timing are understood.
- [ ] The NestJS preview can be explained without running Nest.
- [ ] Emitted JavaScript was inspected.
- [ ] All exercises and review questions are complete.

## Official References

- TypeScript decorators: https://www.typescriptlang.org/docs/handbook/decorators
- NestJS TypeScript starter: https://github.com/nestjs/typescript-starter
- NestJS custom decorators: https://docs.nestjs.com/custom-decorators

## What to Send for Review

Send `tsconfig.json`, runnable decorator source, output showing metadata and order, emitted JavaScript observations, and review answers. Next: **Day 27 — Generics and Utility Types**.

# Day 25 — Classes, Constructors, Access Modifiers, and `readonly`

> Core lesson: about 60 minutes, followed by exercises. Use classes when state and behavior belong together—not merely to replace every object.

## Learning Objectives

You will learn to:

- create instances from a class;
- initialize state with a constructor;
- use constructor parameter properties;
- distinguish `public`, `private`, and `protected`;
- protect stable references with `readonly`;
- implement an interface and choose composition over unnecessary inheritance.

## Setup

Continue the strict TypeScript project or create `practice/day-25/src` using Day 19's configuration.

## 0–15 Minutes — Class and Constructor

Create `src/post.ts`:

```ts
export class Post {
  title: string;
  body: string;
  views: number;

  constructor(title: string, body: string) {
    this.title = title;
    this.body = body;
    this.views = 0;
  }

  addView(): void {
    this.views += 1;
  }

  getSummary(): string {
    return `${this.title} — ${this.views} views`;
  }
}

const post = new Post("TypeScript Classes", "State meets behavior.");
post.addView();
console.log(post.getSummary());
```

A class is both a runtime constructor value and a TypeScript instance type. `new Post(...)` allocates an object and runs its constructor.

## 15–28 Minutes — Parameter Properties and `readonly`

TypeScript can declare and initialize a property directly from a constructor parameter:

```ts
export class Author {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}

  rename(name: string): void {
    const cleanedName = name.trim();

    if (cleanedName === "") {
      throw new Error("Author name cannot be empty");
    }

    this.name = cleanedName;
  }
}
```

`public readonly id` creates the property, assigns the constructor argument, and prevents later reassignment through TypeScript. `readonly` is shallow and compile-time only:

```ts
class TaggedPost {
  constructor(public readonly tags: string[]) {}
}

const taggedPost = new TaggedPost(["typescript"]);
taggedPost.tags.push("classes"); // The array itself is still mutable.
// taggedPost.tags = []; // Reassigning the property is an error.
```

Use `readonly string[]` if callers must not mutate through this reference.

## 28–42 Minutes — Access Modifiers

```ts
class BlogPost {
  private viewCount = 0;

  constructor(
    public readonly id: number,
    public title: string,
    protected authorId: number,
  ) {}

  recordView(): void {
    this.viewCount += 1;
  }

  get views(): number {
    return this.viewCount;
  }
}
```

- `public` is the default and is accessible anywhere.
- `private` is accessible only inside the declaring class.
- `protected` is accessible inside the class and its subclasses.

TypeScript's `private` is primarily a compile-time restriction. JavaScript `#privateField` syntax provides runtime-enforced privacy:

```ts
class ViewCounter {
  #count = 0;

  increment(): void {
    this.#count += 1;
  }

  get value(): number {
    return this.#count;
  }
}
```

Prefer methods that preserve invariants over exposing every property for direct mutation.

## 42–52 Minutes — Interfaces and Classes

An interface can describe what instances must provide:

```ts
interface Publishable {
  publish(): void;
  isPublished(): boolean;
}

class Article implements Publishable {
  private published = false;

  constructor(public readonly title: string) {}

  publish(): void {
    this.published = true;
  }

  isPublished(): boolean {
    return this.published;
  }
}
```

`implements` checks the class contract. It does not copy code into the class and does not validate instances at runtime.

## 52–60 Minutes — Composition Before Inheritance

Inheritance models an “is a” relationship. Composition models “has a”:

```ts
class CommentCollection {
  private readonly comments: string[] = [];

  add(body: string): void {
    this.comments.push(body);
  }

  count(): number {
    return this.comments.length;
  }
}

class ArticleWithComments {
  constructor(
    public readonly title: string,
    private readonly commentCollection: CommentCollection,
  ) {}

  getCommentCount(): number {
    return this.commentCollection.count();
  }
}
```

The article has a comment collection. Composition usually keeps responsibilities smaller and dependencies replaceable.

## Guided Practice — Blog Post Entity

Build a `BlogPost` class that:

1. receives a readonly ID, author ID, title, and body;
2. keeps status and view count private;
3. exposes getters for status and views;
4. validates title changes through a method;
5. allows only draft posts to be published;
6. records views without exposing direct assignment;
7. uses a composed comment collection.

Test valid transitions and deliberate invalid calls.

## Independent Exercises

1. Rewrite a verbose class using parameter properties.
2. Demonstrate public, private, protected, and `#private` members.
3. Compare `readonly string[]` with a readonly property holding `string[]`.
4. Implement a `Summarizable` interface in two unrelated classes.
5. Add a getter derived from private state.
6. Create a subclass only where a genuine “is a” relationship exists.
7. Replace one unnecessary inheritance relationship with composition.

## Common Mistakes and Debugging Advice

- Do not use a class when a simple data object and functions are clearer.
- `readonly` does not recursively freeze nested data.
- `private` and `protected` are not input-validation tools.
- `implements` checks shape but provides no implementation.
- Avoid setters that permit invalid state; prefer intention-revealing methods.
- Deep inheritance trees make behavior difficult to trace.

## Review Questions

1. What happens when `new` calls a class constructor?
2. What is a parameter property?
3. How do `private` and `#private` differ?
4. What can a subclass access through `protected`?
5. Is `readonly` deep or runtime-enforced?
6. What does `implements` do?
7. When is composition clearer than inheritance?
8. Why keep state changes behind methods?

## Completion Checklist

- [ ] Strict compilation succeeds without `any`.
- [ ] Constructors and parameter properties are understood.
- [ ] Every access modifier is demonstrated.
- [ ] `readonly` limitations are explained.
- [ ] A class implements an interface.
- [ ] The guided entity preserves its invariants.
- [ ] All exercises and review questions are complete.

## What to Send for Review

Send all `.ts` source, build output, valid and invalid transition results, and review answers. Next: **Day 26 — Decorators and How NestJS Uses Them**.

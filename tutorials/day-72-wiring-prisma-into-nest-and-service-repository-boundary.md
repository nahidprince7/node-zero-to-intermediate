# Day 72 — Wiring Prisma into Nest and the Service/Repository Boundary

> Core lesson: about 75–90 minutes. Give Nest one managed database runtime and keep persistence details out of controllers.

## Learning Objectives

- manage the Prisma 8 runtime through Nest lifecycle hooks;
- inject database access instead of creating connections per request;
- separate HTTP, business, and persistence responsibilities;
- test services without a real database.

## 0–20 Minutes — One Runtime, One Owner

Create a global `DatabaseModule` and a `PrismaService`. The exact generated runtime types come from Day 69's scaffold; preserve those imports.

```ts
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private runtime?: Awaited<ReturnType<typeof db.connect>>;

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required");
    this.runtime = await db.connect({ url });
  }

  async onModuleDestroy() {
    await this.runtime?.close();
  }

  get orm() {
    return db.orm.public;
  }
}
```

Do not connect in a controller or create one pool per request. Nest owns startup and shutdown; the provider owns database lifetime.

## 20–40 Minutes — Define a Repository Port

```ts
export const POSTS_REPOSITORY = Symbol("POSTS_REPOSITORY");

export interface PostsRepository {
  create(input: NewPostRecord): Promise<PostRecord>;
  findById(id: number): Promise<PostRecord | null>;
  findBySlug(slug: string): Promise<PostRecord | null>;
}
```

Implement it with `PrismaService`. Register the token with `useClass`, then inject the token into `PostsService`. This boundary is useful when it hides ORM query shapes and makes business tests small. Do not add a repository that only renames every ORM method with no benefit.

## 40–60 Minutes — Keep Layers Honest

```text
Controller: HTTP input/output, decorators, status codes
Service: use cases, policies, transactions
Repository: stored-record queries and mapping
PrismaService: connection/runtime ownership
PostgreSQL: final integrity enforcement
```

Controllers must not know `db.orm.public.Post`. Repositories must not throw `HttpException`; they do not know whether the caller is HTTP, a job, or a CLI.

## 60–75 Minutes — Prove Injection

Unit-test `PostsService` with a fake repository:

```ts
const repo: PostsRepository = {
  create: jest.fn(),
  findById: jest.fn().mockResolvedValue(null),
  findBySlug: jest.fn(),
};
```

Also start and stop the app twice while watching database connection logs. Enable shutdown hooks in `main.ts` so process signals run lifecycle cleanup.

## Exercises

1. Add `CommentsRepository` with only methods Day 77 needs.
2. Verify a missing `DATABASE_URL` fails during startup.
3. Ensure no controller imports Prisma-generated code.
4. Explain when a direct service-to-Prisma dependency is sufficient.
5. Mock a repository failure and prove the service does not swallow it.

## Completion Checklist

- [ ] Database runtime starts and closes through Nest lifecycle.
- [ ] Only one provider owns the connection.
- [ ] Posts use a typed repository token.
- [ ] Controllers contain no persistence queries.
- [ ] A service test runs with a fake repository.

## Official References

- [Nest lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events)
- [Nest custom providers](https://docs.nestjs.com/fundamentals/custom-providers)

